import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import UserPreferences from "@/models/UserPreferences";
import { NextResponse } from "next/server";

// GET /api/preferences — fetch current user's autopilot prefs
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const prefs = await UserPreferences.findOne({ userId: session.user.email }).lean();

  // Return safe defaults if document doesn't exist yet
  if (!prefs) {
    return NextResponse.json({ autopilotEnabled: false, rules: [] });
  }

  return NextResponse.json({
    autopilotEnabled: prefs.autopilotEnabled,
    rules: prefs.rules ?? [],
  });
}

// POST /api/preferences — save updated autopilot prefs
export async function POST(request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { autopilotEnabled, rules } = body;

  // Validate structure
  if (!Array.isArray(rules)) {
    return NextResponse.json({ error: "rules must be an array" }, { status: 400 });
  }

  // Filter out rules with empty/missing text
  const validRules = rules
    .filter((r) => r?.id && typeof r.text === "string" && r.text.trim().length > 0)
    .map((r) => ({ id: r.id, text: r.text.trim() }));

  await connectDB();
  const prefs = await UserPreferences.findOneAndUpdate(
    { userId: session.user.email },
    { autopilotEnabled: !!autopilotEnabled, rules: validRules },
    { upsert: true, new: true, lean: true }
  );

  return NextResponse.json({
    autopilotEnabled: prefs.autopilotEnabled,
    rules: prefs.rules ?? [],
  });
}
