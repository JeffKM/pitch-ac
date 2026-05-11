// API-Football 경기(Fixture) 관련 서비스 함수
import "server-only";

import { CURRENT_SEASON, PL_LEAGUE_ID } from "@/lib/constants/football";

import { apiFootballFetch } from "./client";
import type {
  AfFixture,
  AfFixtureEvent,
  AfFixtureEventsResponse,
  AfFixtureStatistic,
  AfLineup,
} from "./types";

/** 리그 시즌 전체 경기 조회 (기본값: PL, 380경기, 1요청) */
export async function getAllSeasonFixtures(
  leagueId: number = PL_LEAGUE_ID,
  season: number = CURRENT_SEASON,
): Promise<AfFixture[]> {
  const res = await apiFootballFetch<AfFixture>("/fixtures", {
    params: { league: leagueId, season },
    revalidate: 3600,
    tags: [`season-fixtures-${leagueId}`],
  });
  return res.response;
}

/** 특정 경기 조회 */
export async function getFixtureById(
  fixtureId: number,
): Promise<AfFixture | null> {
  const res = await apiFootballFetch<AfFixture>("/fixtures", {
    params: { id: fixtureId },
    revalidate: 60,
    tags: [`fixture-${fixtureId}`],
  });
  return res.response[0] ?? null;
}

/** 경기 이벤트 조회 (골, 카드, 교체 등) */
export async function getFixtureEvents(
  fixtureId: number,
): Promise<AfFixtureEvent[]> {
  const res = await apiFootballFetch<AfFixtureEventsResponse>(
    "/fixtures/events",
    {
      params: { fixture: fixtureId },
      revalidate: 60,
      tags: [`fixture-events-${fixtureId}`],
    },
  );
  // 응답 구조: response[0].events[] 또는 flat response[]
  const first = res.response[0];
  if (first && "events" in first) {
    return first.events;
  }
  // 일부 버전에서는 flat 배열로 반환
  return res.response as unknown as AfFixtureEvent[];
}

/** 경기 라인업 조회 */
export async function getFixtureLineups(
  fixtureId: number,
): Promise<AfLineup[]> {
  const res = await apiFootballFetch<AfLineup>("/fixtures/lineups", {
    params: { fixture: fixtureId },
    revalidate: 60,
    tags: [`fixture-lineups-${fixtureId}`],
  });
  return res.response;
}

/** 경기 통계 조회 */
export async function getFixtureStatistics(
  fixtureId: number,
): Promise<AfFixtureStatistic[]> {
  const res = await apiFootballFetch<AfFixtureStatistic>(
    "/fixtures/statistics",
    {
      params: { fixture: fixtureId },
      revalidate: 60,
      tags: [`fixture-stats-${fixtureId}`],
    },
  );
  return res.response;
}

/** 현재 진행 중인 라이브 경기 조회 */
export async function getLiveFixtures(): Promise<AfFixture[]> {
  const res = await apiFootballFetch<AfFixture>("/fixtures", {
    params: { live: "all" },
    noCache: true,
  });
  return res.response;
}

/** H2H (맞대결) 최근 5경기 조회 */
export async function getH2HFixtures(
  teamIdA: number,
  teamIdB: number,
): Promise<AfFixture[]> {
  const res = await apiFootballFetch<AfFixture>("/fixtures/headtohead", {
    params: { h2h: `${teamIdA}-${teamIdB}`, last: 5 },
    revalidate: 86400,
    tags: [`h2h-${teamIdA}-${teamIdB}`],
  });
  return res.response;
}

/** 특정 팀의 시즌 경기 조회 (컵 포함) */
export async function getTeamFixtures(
  teamId: number,
  season: number = CURRENT_SEASON,
): Promise<AfFixture[]> {
  const res = await apiFootballFetch<AfFixture>("/fixtures", {
    params: { team: teamId, season },
    revalidate: 3600,
    tags: [`team-fixtures-${teamId}`],
  });
  return res.response;
}

/** 특정 라운드의 경기 조회 */
export async function getFixturesByRound(
  round: string,
  leagueId: number = PL_LEAGUE_ID,
  season: number = CURRENT_SEASON,
): Promise<AfFixture[]> {
  const res = await apiFootballFetch<AfFixture>("/fixtures", {
    params: { league: leagueId, season, round },
    revalidate: 3600,
    tags: [`round-fixtures-${leagueId}-${round}`],
  });
  return res.response;
}
