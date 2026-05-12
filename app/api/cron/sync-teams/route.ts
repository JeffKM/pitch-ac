import { type NextRequest, NextResponse } from "next/server";

import { verifyCronAuth } from "@/lib/services/sync/auth";
import {
  syncAllLeagueStandings,
  syncAllLeagueTeams,
} from "@/lib/services/sync/sync-teams";

export const maxDuration = 120;

/** 5대 리그 팀 + 순위표 동기화 (주 1회: 매주 월요일 04:00 UTC) */
export async function GET(request: NextRequest) {
  const authError = verifyCronAuth(request);
  if (authError) return authError;

  try {
    const teamsResults = await syncAllLeagueTeams();
    const standingsResults = await syncAllLeagueStandings();

    const allResults = [...teamsResults, ...standingsResults];
    const ok = allResults.every((r) => r.status === "success");

    return NextResponse.json({
      ok,
      results: allResults,
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
