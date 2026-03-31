import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import ProcessedEmail from "@/models/ProcessedEmail";
import Navbar from "@/components/Navbar";
import DashboardClient from "./DashboardClient";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Inbox — EmailAssist",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/");

  // Fetch user's already-processed emails from MongoDB (server-side initial load)
  await connectDB();
  const emailDocs = await ProcessedEmail.find({ userId: session.user.email })
    .sort({ processedAt: -1 })
    .lean();

  // Convert MongoDB documents to plain serializable objects
  const emails = emailDocs.map((doc) => ({
    ...doc,
    _id: doc._id.toString(),
    tasks: doc.tasks?.map((task) => ({
      ...task,
      _id: task._id?.toString(),
    })),
  }));

  return (
    <div className="flex flex-col h-screen bg-white">
      <Navbar />
      {/* Full-height dashboard below the navbar */}
      <div className="flex-1 overflow-hidden">
        <DashboardClient initialEmails={emails} />
      </div>
    </div>
  );
}
