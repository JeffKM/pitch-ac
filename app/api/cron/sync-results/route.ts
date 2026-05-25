import { type NextRequest, NextResponse } from "next/server";

import {
  getPendingResultLeagues,
  syncLeagueFixtures,
  syncStandings,
  verifyCronAuth,
  writeSyncLog,
} from "@/lib/services/sync";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 120;

/** 경기 결과 스마트 동기화 (매시간 13:00~23:00 UTC) */
export async function GET(request: NextRequest) {
  const authError = verifyCronAuth(request);
  if (authError) return authError;

  try {
    const pendingLeagues = await getPendingResultLeagues();

    // 동기화 필요한 리그 없음 → 조기 종료 (0 API 호출)
    if (pendingLeagues.length === 0) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        message: "동기화 필요한 경기 없음",
        timestamp: new Date().toISOString(),
      });
    }

    // 리그별 순차 동기화 (rate limiter 대기 포함)
    const results = [];
    for (const league of pendingLeagues) {
      const fixtureResult = await syncLeagueFixtures(league.code, league.id);
      const standingResult = await syncStandings(league.code, league.id);
      results.push({ league: league.shortName, fixtureResult, standingResult });
    }

    // 요약 로그 기록
    const supabase = createAdminClient();
    const totalFixtures = results.reduce(
      (sum, r) => sum + r.fixtureResult.recordsSynced,
      0,
    );
    await writeSyncLog(supabase, {
      entity: "sync-results-cron",
      status: results.every(
        (r) =>
          r.fixtureResult.status === "success" &&
          r.standingResult.status === "success",
      )
        ? "success"
        : "error",
      recordsSynced: totalFixtures,
    });

    return NextResponse.json({
      ok: true,
      skipped: false,
      leaguesSynced: pendingLeagues.map((l) => l.shortName),
      results,
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
