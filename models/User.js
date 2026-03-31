import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    googleAccessToken: { type: String },
    googleRefreshToken: { type: String },
  },
  { timestamps: true }
);

// Prevent model re-compilation during hot reload
export default mongoose.models.User || mongoose.model("User", UserSchema);
