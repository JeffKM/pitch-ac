// 매치데이 경기 데이터 폴링 API 엔드포인트
// GET /api/matchday/fixtures?gw=N

import { type NextRequest, NextResponse } from "next/server";

import { CURRENT_SEASON_LABEL } from "@/lib/api/sportmonks/constants";
import {
  getFixturesByGameweek,
  getStandingsByTeamIds,
  getTeamsByIds,
} from "@/lib/repositories";
import type { Fixture, Team, TeamStanding } from "@/types";

export interface MatchdayData {
  fixtures: Fixture[];
  teams: Record<number, Team>;
  standings: Record<number, TeamStanding>;
  gameweek: number;
  hasLive: boolean;
}

export async function GET(request: NextRequest) {
  const gw = request.nextUrl.searchParams.get("gw");
  const gameweek = Number(gw);

  if (!gameweek || gameweek < 1 || gameweek > 38) {
    return NextResponse.json(
      {
        data: null,
        error: { code: "INVALID_GW", message: "유효하지 않은 게임위크 (1~38)" },
        timestamp: new Date().toISOString(),
      },
      { status: 400 },
    );
  }

  try {
    const fixtures = await getFixturesByGameweek(gameweek);

    const teamIds = [
      ...new Set(
        fixtures.flatMap((f) => [f.homeTeamId, f.awayTeamId]).filter(Boolean),
      ),
    ];

    const [teamsMap, standingsMap] = await Promise.all([
      getTeamsByIds(teamIds),
      getStandingsByTeamIds(teamIds, CURRENT_SEASON_LABEL),
    ]);

    const data: MatchdayData = {
      fixtures,
      teams: Object.fromEntries(teamsMap),
      standings: Object.fromEntries(standingsMap),
      gameweek,
      hasLive: fixtures.some((f) => f.status === "LIVE"),
    };

    return NextResponse.json({
      data,
      error: null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "INTERNAL",
          message: error instanceof Error ? error.message : "서버 오류",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
