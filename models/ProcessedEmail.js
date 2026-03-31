import mongoose from "mongoose";

const ProcessedEmailSchema = new mongoose.Schema(
  {
    emailId: { type: String, required: true, unique: true }, // Gmail message ID
    userId: { type: String, required: true },                 // user's email address
    subject: { type: String, default: "" },
    senderName: { type: String, default: "" },
    senderEmail: { type: String, default: "" },
    body: { type: String, default: "" },                      // Sanitized text for AI
    bodyHtml: { type: String, default: "" },                  // HTML content for display
    timestamp: { type: String, default: "" },

    // AI-generated fields
    summary: { type: String, default: "" },
    priority: {
      level: { type: String, enum: ["urgent", "requires_action", "fyi"], default: "fyi" },
      reasons: [{ type: String }],
    },
    intent: { type: String, default: "" },

    suggestedReply: {
      subject: { type: String, default: "" },
      body: { type: String, default: "" },
    },

    // null if no meeting detected
    calendarEvent: {
      title: { type: String, default: "" },
      date: { type: String, default: null },
      time: { type: String, default: null },
      participants: [{ type: String }],
      description: { type: String, default: "" },
    },

    tasks: [
      {
        title: { type: String },
        deadline: { type: String, default: null },
        priority: { type: String, enum: ["high", "medium", "low"], default: "medium" },
      },
    ],

    hasMeeting: { type: Boolean, default: false },
    hasTasks: { type: Boolean, default: false },

    // Action state flags — only true after user explicitly approves
    replySent: { type: Boolean, default: false },
    calendarCreated: { type: Boolean, default: false },
    tasksApproved: { type: Boolean, default: false },

    processedAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

export default mongoose.models.ProcessedEmail ||
  mongoose.model("ProcessedEmail", ProcessedEmailSchema);
