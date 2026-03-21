// 매치데이 경기 데이터 폴링 API 엔드포인트
// GET /api/matchday/fixtures?gw=N

import { type NextRequest, NextResponse } from "next/server";

import { CURRENT_SEASON_LABEL } from "@/lib/api/sportmonks/constants";
import {
  getFixturesByGameweek,
  getStandingsByTeamIds,
  getTeamsByIds,
} from "@/lib/repositories";
import {
  getLiveFixtures,
  mergeFixturesWithLive,
} from "@/lib/services/live/live-fixture-service";
import { writebackFinishedFixture } from "@/lib/services/live/live-writeback";
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
    const dbFixtures = await getFixturesByGameweek(gameweek);

    // 킥오프 시각이 지났고 아직 FT가 아닌 경기가 있을 때만 라이브 API 호출
    const now = new Date();
    const hasKickedOff = dbFixtures.some(
      (f) => f.status !== "FT" && new Date(f.date) <= now,
    );

    let fixtures = dbFixtures;
    if (hasKickedOff) {
      const liveFixtures = await getLiveFixtures();
      fixtures = mergeFixturesWithLive(dbFixtures, liveFixtures);

      // FT로 전환된 경기 감지 → 비동기 DB writeback (응답 지연 없이)
      const finishedFixtures = fixtures.filter(
        (f) =>
          f.status === "FT" &&
          dbFixtures.find((db) => db.id === f.id)?.status !== "FT",
      );
      if (finishedFixtures.length > 0) {
        Promise.all(finishedFixtures.map(writebackFinishedFixture)).catch(
          () => {},
        );
      }
    }

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

    const cacheControl = data.hasLive
      ? "public, s-maxage=10, stale-while-revalidate=30"
      : "public, s-maxage=30, stale-while-revalidate=60";

    return NextResponse.json(
      { data, error: null, timestamp: new Date().toISOString() },
      { headers: { "Cache-Control": cacheControl } },
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
