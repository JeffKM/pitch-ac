// SportMonks 경기(Fixture) API 서비스
import { sportMonksFetch } from "./client";
import { CURRENT_SEASON_ID, PL_LEAGUE_ID } from "./constants";
import type { SmApiResponse, SmFixture, SmPaginatedResponse } from "./types";

/** 경기 상세 조회에 사용할 기본 include 목록 */
const FIXTURE_INCLUDES = [
  "participants",
  "scores",
  "events.player",
  "lineups.player",
  "statistics",
  "state",
  "round",
];

/** 라운드(게임위크) ID로 경기 목록 조회 */
export async function getFixturesByRound(
  roundId: number,
): Promise<SmFixture[]> {
  const response = await sportMonksFetch<SmPaginatedResponse<SmFixture>>(
    `/football/fixtures`,
    {
      includes: FIXTURE_INCLUDES,
      filters: { fixtureRoundIds: roundId },
      perPage: 20,
      tags: [`fixtures-round-${roundId}`],
      revalidate: 300, // 5분 캐시
    },
  );
  return response.data;
}

/** 특정 경기 상세 조회 */
export async function getFixtureById(fixtureId: number): Promise<SmFixture> {
  const response = await sportMonksFetch<SmApiResponse<SmFixture>>(
    `/football/fixtures/${fixtureId}`,
    {
      includes: FIXTURE_INCLUDES,
      tags: [`fixture-${fixtureId}`],
      revalidate: 60, // 라이브 경기 대비 짧은 캐시
    },
  );
  return response.data;
}

/** PL 라이브 경기 목록 조회 */
export async function getLivePLFixtures(): Promise<SmFixture[]> {
  const response = await sportMonksFetch<SmPaginatedResponse<SmFixture>>(
    `/football/livescores/inplay`,
    {
      includes: [
        "participants",
        "scores",
        "events.player",
        "statistics",
        "state",
      ],
      revalidate: false, // 라이브는 캐시 없음
    },
  );
  return response.data.filter((f) => f.league_id === PL_LEAGUE_ID);
}

/** H2H 경기 이력 조회 (최근 5경기) */
export async function getH2HFixtures(
  teamIdA: number,
  teamIdB: number,
): Promise<SmFixture[]> {
  const response = await sportMonksFetch<SmPaginatedResponse<SmFixture>>(
    `/football/fixtures/head-to-head/${teamIdA}/${teamIdB}`,
    {
      includes: ["participants", "scores"],
      perPage: 5,
      revalidate: 86400, // H2H는 24시간 캐시
      tags: [`h2h-${Math.min(teamIdA, teamIdB)}-${Math.max(teamIdA, teamIdB)}`],
    },
  );
  return response.data;
}

/** 시즌 경기 목록 (페이지네이션) */
export async function getSeasonFixtures(
  page = 1,
  seasonId: number = CURRENT_SEASON_ID,
): Promise<SmPaginatedResponse<SmFixture>> {
  return sportMonksFetch<SmPaginatedResponse<SmFixture>>(`/football/fixtures`, {
    filters: {
      fixtureSeasonIds: seasonId,
      fixtureLeagueIds: PL_LEAGUE_ID,
    },
    includes: ["participants", "scores", "state", "round"],
    page,
    perPage: 50,
    revalidate: 3600, // 시즌 전체는 1시간 캐시
  });
}
