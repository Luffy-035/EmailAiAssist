import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";
import Navbar from "@/components/Navbar";
import TasksClient from "./TasksClient";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Tasks — EmailAssist",
};

export default async function TasksPage() {
  const session = await auth();
  if (!session) redirect("/");

  // Fetch all tasks for this user server-side
  await connectDB();
  const taskDocs = await Task.find({ userId: session.user.email })
    .sort({ createdAt: -1 })
    .lean();

  // Serialize MongoDB docs to plain JS objects
  const tasks = taskDocs.map((doc) => ({
    ...doc,
    _id: doc._id.toString(),
  }));

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <TasksClient initialTasks={tasks} />
    </div>
  );
}
