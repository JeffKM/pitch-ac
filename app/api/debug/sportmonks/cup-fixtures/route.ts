// 디버그 엔드포인트 — 컵 대회 데이터 접근 테스트 (schedules 엔드포인트)
// GET /api/debug/sportmonks/cup-fixtures?teamId=9

import { type NextRequest, NextResponse } from "next/server";

import { getSeasonRounds, getTeamScheduleFixtures } from "@/lib/api/sportmonks";
import { MCITY_TEAM_ID } from "@/lib/api/sportmonks/constants";
import { mapSmFixtureToFixture } from "@/lib/api/sportmonks/mappers";
import {
  assignGameweek,
  buildGameweekRanges,
} from "@/lib/services/sync/gameweek-assigner";

export async function GET(request: NextRequest) {
  const teamId = Number(
    request.nextUrl.searchParams.get("teamId") ?? MCITY_TEAM_ID,
  );

  try {
    const [rawFixtures, rounds] = await Promise.all([
      getTeamScheduleFixtures(teamId),
      getSeasonRounds(),
    ]);
    const gwRanges = buildGameweekRanges(rounds);

    const fixtures = rawFixtures.map((f) => {
      const mapped = mapSmFixtureToFixture(f);
      const assignedGw = assignGameweek(mapped.date, gwRanges);
      return {
        raw: {
          id: f.id,
          league_id: f.league_id,
          season_id: f.season_id,
          name: f.name,
          starting_at: f.starting_at,
          state: f.state,
          round: f.round,
          participants: f.participants?.map((p) => ({
            id: p.id,
            name: p.name,
            meta: p.meta,
          })),
        },
        mapped,
        assignedGameweek: assignedGw,
      };
    });

    // 대회별 그룹핑
    const byLeague: Record<number, number> = {};
    for (const f of rawFixtures) {
      byLeague[f.league_id] = (byLeague[f.league_id] ?? 0) + 1;
    }

    return NextResponse.json({
      count: fixtures.length,
      teamId,
      byLeague,
      fixtures,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        teamId,
      },
      { status: 500 },
    );
  }
}
