import mongoose from "mongoose";

const AutopilotLogSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    emailId: { type: String, required: true },
    emailSubject: { type: String, default: "" },
    senderName: { type: String, default: "" },

    // Actions that the autopilot actually executed
    replySent: { type: Boolean, default: false },
    eventCreated: { type: Boolean, default: false },
    tasksApproved: { type: Boolean, default: false },

    // Which user rule triggered the action (null = heuristic or no match)
    matchedRuleId: { type: String, default: null },
    matchedRuleText: { type: String, default: null },

    // LLM one-line explanation
    reasoning: { type: String, default: "" },

    // "success" | "skipped" | "error"
    status: {
      type: String,
      enum: ["success", "skipped", "error"],
      default: "success",
    },
    errorMessage: { type: String, default: null },

    processedAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

// Compound unique index — ensures idempotency across duplicate refresh runs
AutopilotLogSchema.index({ userId: 1, emailId: 1 }, { unique: true });

export default mongoose.models.AutopilotLog ||
  mongoose.model("AutopilotLog", AutopilotLogSchema);
