// 디버그 엔드포인트 — 컵 대회 데이터 접근 테스트 (schedules 엔드포인트)
// GET /api/debug/sportmonks/cup-fixtures?teamId=9

import { type NextRequest, NextResponse } from "next/server";

import { getSeasonRounds, getTeamScheduleFixtures } from "@/lib/api/sportmonks";
import { MCITY_TEAM_ID, PL_LEAGUE_ID } from "@/lib/api/sportmonks/constants";
import { mapSmFixtureToFixture } from "@/lib/api/sportmonks/mappers";
import {
  assignGameweek,
  assignGameweekByAnchors,
  buildGameweekRanges,
  type McityPlAnchor,
} from "@/lib/services/sync/gameweek-assigner";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const teamId = Number(
    request.nextUrl.searchParams.get("teamId") ?? MCITY_TEAM_ID,
  );

  try {
    // DB에서 맨시티 PL 경기 → 앵커 빌드
    const supabase = createAdminClient();
    const { data: plRows } = await supabase
      .from("fixtures")
      .select("gameweek, date")
      .eq("league_id", PL_LEAGUE_ID)
      .or(`home_team_id.eq.${MCITY_TEAM_ID},away_team_id.eq.${MCITY_TEAM_ID}`)
      .not("gameweek", "is", null)
      .order("gameweek");

    const anchors: McityPlAnchor[] = (plRows ?? []).map((r) => ({
      gameweek: r.gameweek as number,
      date: new Date(r.date),
    }));

    const [rawFixtures, rounds] = await Promise.all([
      getTeamScheduleFixtures(teamId),
      getSeasonRounds(),
    ]);
    const gwRanges = buildGameweekRanges(rounds);

    const fixtures = rawFixtures.map((f) => {
      const mapped = mapSmFixtureToFixture(f);
      const midpointGw = assignGameweek(mapped.date, gwRanges);
      const anchorGw =
        anchors.length > 0
          ? assignGameweekByAnchors(mapped.date, anchors)
          : null;
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
        assignedGameweek: {
          midpoint: midpointGw,
          anchor: anchorGw,
          // 두 값이 다르면 불일치 플래그
          mismatch: anchorGw !== null && midpointGw !== anchorGw,
        },
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
      anchorCount: anchors.length,
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
