import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const providers: Record<string, boolean | string | null> = {
    GOOGLE_API_KEY: !!process.env.GOOGLE_API_KEY,
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    GROK_API_KEY: !!process.env.GROK_API_KEY,
    GROK_BASE_URL: process.env.GROK_BASE_URL || null,
    QDRANT_URL: !!process.env.QDRANT_URL,
    QDRANT_API_KEY: !!process.env.QDRANT_API_KEY,
  };

  return NextResponse.json({ ok: true, providers });
}
