import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { fetchUnreadEmails } from "@/lib/gmail";
import ProcessedEmail from "@/models/ProcessedEmail";
import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Read maxResults from request body (default 20, max 50)
    const body = await request.json().catch(() => ({}));
    const maxResults = Math.min(parseInt(body.maxResults) || 20, 50);

    const { user, accessToken } = session;
    await connectDB();

    // Step 1: Fetch unread emails from Gmail
    const rawEmails = await fetchUnreadEmails(accessToken, maxResults);
    if (rawEmails.length === 0) {
      return NextResponse.json({ processed: [], message: "No new emails to process" });
    }

    // Step 2: Filter out emails already in the database for this user
    const emailIds = rawEmails.map((e) => e.emailId);
    const existingDocs = await ProcessedEmail.find(
      { userId: user.email, emailId: { $in: emailIds } },
      { emailId: 1 }
    ).lean();
    const existingIds = new Set(existingDocs.map((d) => d.emailId));
    const newEmails = rawEmails.filter((e) => !existingIds.has(e.emailId));

    if (newEmails.length === 0) {
      return NextResponse.json({ processed: [], message: "All emails already processed" });
    }

    // Step 3: Send new emails to FastAPI for AI processing
    const fastapiPayload = {
      emails: newEmails.map((e) => ({
        email_id: e.emailId,
        subject: e.subject,
        sender_name: e.senderName,
        sender_email: e.senderEmail,
        body: e.body,
        timestamp: e.timestamp,
      })),
      user_name: user.name,
      user_email: user.email,
    };

    const aiResponse = await fetch(`${FASTAPI_URL}/process-emails`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fastapiPayload),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`FastAPI error: ${aiResponse.status} — ${errText}`);
    }

    const aiData = await aiResponse.json();
    const processed = aiData.processed || [];

    // Step 4: Map AI results back to original email data and save to MongoDB
    const emailMap = Object.fromEntries(newEmails.map((e) => [e.emailId, e]));
    const savedEmails = [];

    for (const aiResult of processed) {
      const original = emailMap[aiResult.email_id];
      if (!original) continue;

      const doc = new ProcessedEmail({
        emailId: aiResult.email_id,
        userId: user.email,
        subject: original.subject,
        senderName: original.senderName,
        senderEmail: original.senderEmail,
        body: original.body,              // Sanitized text for AI
        bodyHtml: original.bodyHtml,      // HTML content for display
        timestamp: original.timestamp,

        // AI-generated fields
        summary: aiResult.summary || "",
        priority: {
          level: aiResult.priority?.level || "fyi",
          reasons: aiResult.priority?.reasons || [],
        },
        intent: aiResult.intent || "",

        suggestedReply: {
          subject: aiResult.suggested_reply?.subject || `Re: ${original.subject}`,
          body: aiResult.suggested_reply?.body || "",
        },

        calendarEvent: aiResult.has_meeting
          ? {
              title: aiResult.calendar_event?.title || "",
              date: aiResult.calendar_event?.date || null,
              time: aiResult.calendar_event?.time || null,
              participants: aiResult.calendar_event?.participants || [],
              description: aiResult.calendar_event?.description || "",
            }
          : null,

        tasks: (aiResult.tasks || []).map((t) => ({
          title: t.title,
          deadline: t.deadline || null,
          priority: t.priority || "medium",
        })),

        hasMeeting: !!aiResult.has_meeting,
        hasTasks: (aiResult.tasks || []).length > 0,

        replySent: false,
        calendarCreated: false,
        tasksApproved: false,
        processedAt: new Date().toISOString(),
      });

      await doc.save();
      savedEmails.push(doc.toObject());
    }

    return NextResponse.json({
      processed: savedEmails,
      count: savedEmails.length,
      message: `Processed ${savedEmails.length} new emails`,
    });
  } catch (error) {
    console.error("Error processing emails:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
