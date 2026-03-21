import { type NextRequest, NextResponse } from "next/server";

import { verifyCronAuth } from "@/lib/services/sync/auth";
import { syncStandings, syncTeams } from "@/lib/services/sync/sync-teams";

export const maxDuration = 60;

/** 팀 기본정보 + 순위표 동기화 (주 1회: 매주 월요일 04:00 UTC) */
export async function GET(request: NextRequest) {
  const authError = verifyCronAuth(request);
  if (authError) return authError;

  try {
    const teamsResult = await syncTeams();
    const standingsResult = await syncStandings();

    const ok =
      teamsResult.status === "success" && standingsResult.status === "success";

    return NextResponse.json({
      ok,
      results: [teamsResult, standingsResult],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
