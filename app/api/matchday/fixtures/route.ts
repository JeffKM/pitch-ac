// 매치데이 경기 데이터 API 엔드포인트
// GET /api/matchday/fixtures?date=YYYY-MM-DD

import { type NextRequest, NextResponse } from "next/server";

import { CURRENT_SEASON_LABEL } from "@/lib/constants/football";
import { isValidDateKey } from "@/lib/date-utils";
import {
  getFixturesByDate,
  getStandingsByTeamIds,
  getTeamsByIds,
} from "@/lib/repositories";
import type { Fixture, Team, TeamStanding } from "@/types";

export interface MatchdayData {
  fixtures: Fixture[];
  teams: Record<number, Team>;
  standings: Record<number, TeamStanding>;
  date: string;
}

export async function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get("date");

  if (!dateParam || !isValidDateKey(dateParam)) {
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "INVALID_DATE",
          message: `유효하지 않은 날짜: ${dateParam}`,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 400 },
    );
  }

  try {
    const fixtures = await getFixturesByDate(dateParam);

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
      date: dateParam,
    };

    return NextResponse.json(
      { data, error: null, timestamp: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
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
