import { NextResponse } from "next/server";
import { runSync } from "@/lib/sync/runSync";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiKey } = body;
    if (!apiKey || typeof apiKey !== "string") return NextResponse.json({ success: false, error: "API key is required" }, { status: 400 });
    const result = await runSync(apiKey);
    return NextResponse.json(result);
  } catch (error) { return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 }); }
}