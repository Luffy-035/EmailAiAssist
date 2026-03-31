"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import ProcessedEmail from "@/models/ProcessedEmail";
import Task from "@/models/Task";
import { revalidatePath } from "next/cache";

/**
 * Server Action: Save approved tasks to the tasks collection
 * and mark tasksApproved = true on the email document.
 * Called from TaskCard when user clicks "Approve All".
 */
export async function approveTasks({ emailId, subject, tasks }) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  // Insert each task into the tasks collection
  const taskDocs = tasks.map((t) => ({
    userId: session.user.email,
    sourceEmailId: emailId,
    sourceEmailSubject: subject,
    title: t.title,
    deadline: t.deadline || null,
    priority: t.priority || "medium",
    status: "pending",
    createdAt: new Date().toISOString(),
  }));

  await Task.insertMany(taskDocs);

  // Mark tasksApproved = true on the processed email
  await ProcessedEmail.findOneAndUpdate(
    { emailId, userId: session.user.email },
    { tasksApproved: true }
  );

  revalidatePath("/dashboard");
  revalidatePath("/tasks");
  return { success: true, count: taskDocs.length };
}
