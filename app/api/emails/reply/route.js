import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

// POST /api/emails/reply — regenerate a reply with a different tone / custom instruction
export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { emailId, subject, senderName, emailBody, tone, customInstruction } = body;

    // Forward to FastAPI — match exact input spec
    const fastapiPayload = {
      email_id: emailId,
      subject,
      sender_name: senderName,
      body: emailBody,
      tone: tone || "formal",
      user_name: session.user.name,
      user_email: session.user.email,
      custom_instruction: customInstruction || "",
    };

    const aiResponse = await fetch(`${FASTAPI_URL}/generate-reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fastapiPayload),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`FastAPI error: ${aiResponse.status} — ${errText}`);
    }

    const data = await aiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error regenerating reply:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
