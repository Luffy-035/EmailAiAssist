import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import ProcessedEmail from "@/models/ProcessedEmail";
import { NextResponse } from "next/server";

// GET /api/emails — returns all processed emails for the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch all processed emails for user, sorted newest first
    const emails = await ProcessedEmail.find({ userId: session.user.email })
      .sort({ processedAt: -1 })
      .lean();

    return NextResponse.json({ emails });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
