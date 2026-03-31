import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import AutopilotLog from "@/models/AutopilotLog";
import { NextResponse } from "next/server";

// GET /api/autopilot/logs — fetch the last 50 autopilot log entries for this user
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const logs = await AutopilotLog.find({ userId: session.user.email })
    .sort({ processedAt: -1 })
    .limit(50)
    .lean();

  // Serialize _id to string
  const serialized = logs.map((l) => ({ ...l, _id: l._id.toString() }));
  return NextResponse.json({ logs: serialized });
}
