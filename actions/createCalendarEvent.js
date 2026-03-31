"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { createCalendarEvent as createGCalEvent } from "@/lib/calendar";
import ProcessedEmail from "@/models/ProcessedEmail";
import { revalidatePath } from "next/cache";

/**
 * Server Action: Create a Google Calendar event and mark it in the DB.
 * Called from CalendarCard when user clicks "Create Event".
 */
export async function createCalendarEvent({ emailId, eventData }) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  // Create event via Google Calendar API
  const createdEvent = await createGCalEvent(session.accessToken, eventData, session.user.email);


  // Mark calendarCreated = true in DB
  await ProcessedEmail.findOneAndUpdate(
    { emailId, userId: session.user.email },
    { calendarCreated: true }
  );

  revalidatePath("/dashboard");
  return { success: true, eventId: createdEvent.id };
}
