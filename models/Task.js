import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },          // user's email address
    sourceEmailId: { type: String, required: true },   // Gmail message ID
    sourceEmailSubject: { type: String, default: "" },
    title: { type: String, required: true },
    deadline: { type: String, default: null },
    priority: { type: String, enum: ["high", "medium", "low"], default: "medium" },
    status: { type: String, enum: ["pending", "completed"], default: "pending" },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
