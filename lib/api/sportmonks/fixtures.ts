// SportMonks 경기(Fixture) API 서비스
import { sportMonksFetch } from "./client";
import { CURRENT_SEASON_ID, PL_LEAGUE_ID } from "./constants";
import type {
  SmApiResponse,
  SmFixture,
  SmPaginatedResponse,
  SmRound,
} from "./types";

/** 라운드(게임위크) ID로 경기 목록 조회
 * /football/rounds/{id}?include=fixtures.X 방식 사용
 * - fixtureRoundIds 필터는 Starter 플랜에서 무시됨
 * - 라운드 엔드포인트 include 방식으로 정확한 시즌/리그 데이터 반환
 * - round 정보를 각 fixture에 주입 → mapSmFixtureToFixture의 gameweek 파싱을 위해
 */
export async function getFixturesByRound(
  roundId: number,
): Promise<SmFixture[]> {
  const response = await sportMonksFetch<
    SmApiResponse<SmRound & { fixtures?: SmFixture[] }>
  >(`/football/rounds/${roundId}`, {
    includes: [
      "fixtures.participants",
      "fixtures.scores",
      "fixtures.events",
      "fixtures.lineups",
      "fixtures.statistics",
      "fixtures.state",
    ],
    tags: [`fixtures-round-${roundId}`],
    revalidate: 300, // 5분 캐시
  });
  const { fixtures: rawFixtures, ...roundData } = response.data;
  // round 정보를 각 fixture에 주입 (mapSmFixtureToFixture가 round.name으로 gameweek 파싱)
  return (rawFixtures ?? []).map((f) => ({
    ...f,
    round: roundData as SmRound,
  }));
}

/** 특정 경기 상세 조회 */
export async function getFixtureById(fixtureId: number): Promise<SmFixture> {
  const response = await sportMonksFetch<SmApiResponse<SmFixture>>(
    `/football/fixtures/${fixtureId}`,
    {
      includes: [
        "participants",
        "scores",
        "events.player",
        "lineups.player",
        "statistics",
        "state",
        "round",
      ],
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
