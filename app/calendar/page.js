import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import ProcessedEmail from "@/models/ProcessedEmail";
import Navbar from "@/components/Navbar";
import { redirect } from "next/navigation";
import CalendarClient from "./CalendarClient";

export const metadata = {
  title: "Calendar — EmailAssist",
  description: "View all your meeting events extracted from emails",
};

export default async function CalendarPage() {
  const session = await auth();
  if (!session) redirect("/");

  await connectDB();

  // Fetch all emails that have a meeting detected
  const emailsWithEvents = await ProcessedEmail.find(
    { userId: session.user.email, hasMeeting: true },
    {
      emailId: 1,
      subject: 1,
      senderName: 1,
      senderEmail: 1,
      calendarEvent: 1,
      calendarCreated: 1,
      processedAt: 1,
    }
  )
    .sort({ "calendarEvent.date": 1 })
    .lean();

  // Serialize for client (convert MongoDB _id etc)
  const events = emailsWithEvents.map((e) => ({
    id: e._id.toString(),
    emailId: e.emailId,
    sourceSubject: e.subject,
    sourceSender: e.senderName,
    calendarCreated: e.calendarCreated,
    title: e.calendarEvent?.title || e.subject,
    date: e.calendarEvent?.date || null,
    time: e.calendarEvent?.time || null,
    participants: e.calendarEvent?.participants || [],
    description: e.calendarEvent?.description || "",
  }));

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <CalendarClient events={events} userName={session.user.name} />
    </div>
  );
}
