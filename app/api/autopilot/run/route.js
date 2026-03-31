import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import ProcessedEmail from "@/models/ProcessedEmail";
import UserPreferences from "@/models/UserPreferences";
import AutopilotLog from "@/models/AutopilotLog";
import Task from "@/models/Task";
import { sendEmailReply } from "@/lib/gmail";
import { createCalendarEvent } from "@/lib/calendar";
import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { user, accessToken } = session;
  await connectDB();

  // ── 1. Check if autopilot is enabled ──────────────────────────────────────
  const prefs = await UserPreferences.findOne({ userId: user.email }).lean();
  if (!prefs?.autopilotEnabled) {
    return NextResponse.json({ skipped: true, reason: "Autopilot is disabled" });
  }

  // ── 2. Find emails not yet processed by autopilot ─────────────────────────
  // We use the AutopilotLog index to know which emails we've already handled.
  const existingLogIds = (
    await AutopilotLog.find({ userId: user.email }, { emailId: 1 }).lean()
  ).map((l) => l.emailId);

  const emails = await ProcessedEmail.find({
    userId: user.email,
    emailId: { $nin: existingLogIds },
  })
    .sort({ processedAt: -1 })
    .limit(30) // cap per-run to avoid very long waits
    .lean();

  if (emails.length === 0) {
    return NextResponse.json({ processed: 0, message: "No new emails for autopilot" });
  }

  const logs = [];

  for (const email of emails) {
    // ── 3. Call FastAPI /autopilot-decide ────────────────────────────────────
    let decision;
    try {
      const res = await fetch(`${FASTAPI_URL}/autopilot-decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_id: email.emailId,
          subject: email.subject,
          sender_name: email.senderName,
          sender_email: email.senderEmail,
          summary: email.summary,
          priority_level: email.priority?.level ?? "fyi",
          intent: email.intent ?? "",
          has_meeting: email.hasMeeting,
          has_tasks: email.hasTasks,
          suggested_reply_body: email.suggestedReply?.body ?? "",
          user_name: user.name,
          user_email: user.email,
          rules: (prefs.rules ?? []).map((r) => ({ id: r.id, text: r.text })),
        }),
      });

      if (!res.ok) throw new Error(`FastAPI responded with ${res.status}`);
      decision = await res.json();
    } catch (err) {
      // FastAPI is down or returned bad data — log the error, continue to next email
      await AutopilotLog.findOneAndUpdate(
        { userId: user.email, emailId: email.emailId },
        {
          userId: user.email,
          emailId: email.emailId,
          emailSubject: email.subject,
          senderName: email.senderName,
          status: "error",
          errorMessage: err.message,
          reasoning: "FastAPI unreachable or returned an error — no actions taken.",
          processedAt: new Date().toISOString(),
        },
        { upsert: true, new: true }
      );
      logs.push({ emailId: email.emailId, status: "error", error: err.message });
      continue; // always continue — never fail the whole batch
    }

    // ── 4. If no actions decided, log as skipped ─────────────────────────────
    const noAction =
      !decision.should_reply &&
      !decision.should_create_event &&
      !decision.should_approve_tasks;

    if (noAction) {
      await AutopilotLog.findOneAndUpdate(
        { userId: user.email, emailId: email.emailId },
        {
          userId: user.email,
          emailId: email.emailId,
          emailSubject: email.subject,
          senderName: email.senderName,
          status: "skipped",
          matchedRuleId: decision.matched_rule_id ?? null,
          matchedRuleText: decision.matched_rule_text ?? null,
          reasoning: decision.reasoning,
          processedAt: new Date().toISOString(),
        },
        { upsert: true, new: true }
      );
      logs.push({ emailId: email.emailId, status: "skipped" });
      continue;
    }

    // ── 5. Execute decided actions, guard against double-execution ────────────
    let replySent = false;
    let eventCreated = false;
    let tasksApproved = false;
    const errors = [];

    // 5a. Send reply — only if AI decided AND not already sent
    if (decision.should_reply && !email.replySent) {
      try {
        await sendEmailReply(accessToken, {
          to: email.senderEmail,
          subject: email.suggestedReply?.subject ?? `Re: ${email.subject}`,
          body: email.suggestedReply?.body ?? "",
          threadId: email.emailId,
        });
        await ProcessedEmail.findOneAndUpdate(
          { emailId: email.emailId, userId: user.email },
          { replySent: true }
        );
        replySent = true;
      } catch (e) {
        errors.push(`Reply failed: ${e.message}`);
      }
    }

    // 5b. Create calendar event — only if AI decided AND has a meeting AND not already created
    if (
      decision.should_create_event &&
      email.hasMeeting &&
      email.calendarEvent &&
      !email.calendarCreated
    ) {
      try {
        await createCalendarEvent(accessToken, email.calendarEvent, user.email);
        await ProcessedEmail.findOneAndUpdate(
          { emailId: email.emailId, userId: user.email },
          { calendarCreated: true }
        );
        eventCreated = true;
      } catch (e) {
        errors.push(`Calendar event failed: ${e.message}`);
      }
    }

    // 5c. Approve tasks — only if AI decided AND has tasks AND not already approved
    if (
      decision.should_approve_tasks &&
      email.hasTasks &&
      Array.isArray(email.tasks) &&
      email.tasks.length > 0 &&
      !email.tasksApproved
    ) {
      try {
        const taskDocs = email.tasks.map((t) => ({
          userId: user.email,
          sourceEmailId: email.emailId,
          sourceEmailSubject: email.subject,
          title: t.title,
          deadline: t.deadline ?? null,
          priority: t.priority ?? "medium",
          status: "pending",
          createdAt: new Date().toISOString(),
        }));
        // ordered: false — other tasks still insert if one fails (e.g. duplicate)
        await Task.insertMany(taskDocs, { ordered: false });
        await ProcessedEmail.findOneAndUpdate(
          { emailId: email.emailId, userId: user.email },
          { tasksApproved: true }
        );
        tasksApproved = true;
      } catch (e) {
        // insertMany throws but may have partially succeeded — still mark approved
        // if the error is just duplicate keys (code 11000)
        if (e.code === 11000) {
          tasksApproved = true;
        } else {
          errors.push(`Tasks failed: ${e.message}`);
        }
      }
    }

    // ── 6. Save the log entry ─────────────────────────────────────────────────
    const status = errors.length > 0 ? "error" : "success";
    await AutopilotLog.findOneAndUpdate(
      { userId: user.email, emailId: email.emailId },
      {
        userId: user.email,
        emailId: email.emailId,
        emailSubject: email.subject,
        senderName: email.senderName,
        replySent,
        eventCreated,
        tasksApproved,
        matchedRuleId: decision.matched_rule_id ?? null,
        matchedRuleText: decision.matched_rule_text ?? null,
        reasoning: decision.reasoning,
        status,
        errorMessage: errors.length > 0 ? errors.join("; ") : null,
        processedAt: new Date().toISOString(),
      },
      { upsert: true, new: true }
    );

    logs.push({ emailId: email.emailId, status, replySent, eventCreated, tasksApproved });
  }

  return NextResponse.json({
    processed: logs.length,
    logs,
  });
}
