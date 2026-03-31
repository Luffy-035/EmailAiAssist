import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

// GET /api/health — check if FastAPI service is running
export async function GET() {
  try {
    const res = await fetch(`${FASTAPI_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });
    if (!res.ok) throw new Error("FastAPI returned non-OK status");
    const data = await res.json();
    return NextResponse.json({ fastapi: "ok", detail: data });
  } catch (error) {
    return NextResponse.json(
      { fastapi: "down", error: error.message },
      { status: 503 }
    );
  }
}
