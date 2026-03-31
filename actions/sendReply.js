"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { sendEmailReply } from "@/lib/gmail";
import ProcessedEmail from "@/models/ProcessedEmail";
import { revalidatePath } from "next/cache";

/**
 * Server Action: Send a reply via Gmail and mark the email as replied.
 * Called from ReplyCard when user clicks "Send".
 */
export async function sendReply({ emailId, to, subject, body, threadId }) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  // Send via Gmail API
  await sendEmailReply(session.accessToken, { to, subject, body, threadId });

  // Mark replySent = true in DB
  await ProcessedEmail.findOneAndUpdate(
    { emailId, userId: session.user.email },
    { replySent: true }
  );

  revalidatePath("/dashboard");
  return { success: true };
}
