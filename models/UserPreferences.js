import mongoose from "mongoose";

const RuleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },   // client-generated UUID
    text: { type: String, required: true }, // natural language rule text
  },
  { _id: false } // don't create _id for subdocuments
);

const UserPreferencesSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true }, // user's email
    autopilotEnabled: { type: Boolean, default: false },
    rules: { type: [RuleSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.UserPreferences ||
  mongoose.model("UserPreferences", UserPreferencesSchema);
