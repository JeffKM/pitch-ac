// 경기 상세 데이터 폴링 API 엔드포인트
// GET /api/matchday/fixture?id=N

import { type NextRequest, NextResponse } from "next/server";

import { CURRENT_SEASON_LABEL } from "@/lib/api/sportmonks/constants";
import {
  getFixtureById,
  getInjuriesByTeamId,
  getStandingsByTeamIds,
  getTeamsByIds,
} from "@/lib/repositories";
import { fetchH2HResults } from "@/lib/services/h2h";
import { getLiveFixtureById } from "@/lib/services/live/live-fixture-service";
import { writebackFinishedFixture } from "@/lib/services/live/live-writeback";
import type {
  Fixture,
  H2HResult,
  InjuredPlayer,
  Team,
  TeamStanding,
} from "@/types";

export interface FixtureDetailData {
  fixture: Fixture;
  homeTeam: Team;
  awayTeam: Team;
  homeStanding: TeamStanding | null;
  awayStanding: TeamStanding | null;
  h2hResults: H2HResult[];
  homeInjuries: InjuredPlayer[];
  awayInjuries: InjuredPlayer[];
}

export async function GET(request: NextRequest) {
  const idParam = request.nextUrl.searchParams.get("id");
  const id = Number(idParam);

  if (!id || isNaN(id) || id <= 0) {
    return NextResponse.json(
      {
        data: null,
        error: { code: "INVALID_ID", message: "유효하지 않은 경기 ID" },
        timestamp: new Date().toISOString(),
      },
      { status: 400 },
    );
  }

  try {
    const dbFixture = await getFixtureById(id);

    if (!dbFixture) {
      return NextResponse.json(
        {
          data: null,
          error: { code: "NOT_FOUND", message: "경기를 찾을 수 없습니다" },
          timestamp: new Date().toISOString(),
        },
        { status: 404 },
      );
    }

    // 킥오프 시각이 지났고 아직 FT가 아닌 경우 → SportMonks 실시간 데이터로 교체
    let fixture = dbFixture;
    const now = new Date();
    if (dbFixture.status !== "FT" && new Date(dbFixture.date) <= now) {
      const liveFixture = await getLiveFixtureById(id);
      if (liveFixture) {
        // FT 전환 감지 → 비동기 DB writeback (응답 지연 없이)
        // dbFixture.status는 이미 "FT"가 아님이 보장됨 (외부 if 조건)
        if (liveFixture.status === "FT") {
          writebackFinishedFixture(liveFixture).catch(() => {});
        }
        fixture = liveFixture;
      }
    }

    const teamIds = [fixture.homeTeamId, fixture.awayTeamId].filter(Boolean);

    const [teamsMap, standingsMap, h2hResults, homeInjuries, awayInjuries] =
      await Promise.all([
        getTeamsByIds(teamIds),
        getStandingsByTeamIds(teamIds, CURRENT_SEASON_LABEL),
        fetchH2HResults(fixture.homeTeamId, fixture.awayTeamId).catch(
          () => [] as H2HResult[],
        ),
        getInjuriesByTeamId(fixture.homeTeamId).catch(
          () => [] as InjuredPlayer[],
        ),
        getInjuriesByTeamId(fixture.awayTeamId).catch(
          () => [] as InjuredPlayer[],
        ),
      ]);

    const homeTeam = teamsMap.get(fixture.homeTeamId);
    const awayTeam = teamsMap.get(fixture.awayTeamId);

    if (!homeTeam || !awayTeam) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "TEAM_NOT_FOUND",
            message: "팀 정보를 찾을 수 없습니다",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 404 },
      );
    }

    const data: FixtureDetailData = {
      fixture,
      homeTeam,
      awayTeam,
      homeStanding: standingsMap.get(fixture.homeTeamId) ?? null,
      awayStanding: standingsMap.get(fixture.awayTeamId) ?? null,
      h2hResults,
      homeInjuries,
      awayInjuries,
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
