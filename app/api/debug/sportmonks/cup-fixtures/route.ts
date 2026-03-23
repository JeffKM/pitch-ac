// 디버그 엔드포인트 — 컵 대회 데이터 접근 테스트
// GET /api/debug/sportmonks/cup-fixtures?teamId=9&start=2025-08-01&end=2026-06-30

import { type NextRequest, NextResponse } from "next/server";

import { MCITY_TEAM_ID } from "@/lib/api/sportmonks/constants";
import { getCupFixturesByTeam } from "@/lib/api/sportmonks/fixtures";
import { mapSmFixtureToFixture } from "@/lib/api/sportmonks/mappers";

export async function GET(request: NextRequest) {
  const teamId = Number(
    request.nextUrl.searchParams.get("teamId") ?? MCITY_TEAM_ID,
  );
  const start = request.nextUrl.searchParams.get("start") ?? "2025-08-01";
  const end = request.nextUrl.searchParams.get("end") ?? "2026-06-30";

  try {
    const rawFixtures = await getCupFixturesByTeam(teamId, start, end);
    const fixtures = rawFixtures.map((f) => ({
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
      mapped: mapSmFixtureToFixture(f),
    }));

    return NextResponse.json({
      count: fixtures.length,
      teamId,
      dateRange: { start, end },
      fixtures,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        teamId,
        dateRange: { start, end },
      },
      { status: 500 },
    );
  }
}
