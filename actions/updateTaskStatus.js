"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";
import { revalidatePath } from "next/cache";

/**
 * Server Action: Toggle a task's status between pending and completed.
 * Called from TaskCard (dashboard) and tasks page Mark Complete button.
 */
export async function updateTaskStatus({ taskId, status }) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await connectDB();

  await Task.findOneAndUpdate(
    { _id: taskId, userId: session.user.email }, // scope to the user's tasks only
    { status }
  );

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { success: true };
}
