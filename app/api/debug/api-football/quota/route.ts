// GET /api/debug/api-football/quota — 일일 API 사용량 확인

import { NextResponse } from "next/server";

import { getUsage } from "@/lib/api/api-football";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "디버그 전용" }, { status: 403 });
  }

  const usage = getUsage();

  return NextResponse.json(usage);
}
