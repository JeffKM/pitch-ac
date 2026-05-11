// GET /api/debug/api-football/sync-leagues — 5대 리그 동기화 실행

import { NextResponse } from "next/server";

import { getUsage } from "@/lib/api/api-football/rate-limiter";
import { syncAllLeagueFixtures } from "@/lib/services/sync/sync-fixtures";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "디버그 전용" }, { status: 403 });
  }

  const results = await syncAllLeagueFixtures();
  const usage = getUsage();

  return NextResponse.json({
    results,
    totalApiCalls: results.length,
    usage,
  });
}
