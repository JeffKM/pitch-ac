// SportMonks 경기(Fixture) API 서비스
import { sportMonksFetch } from "./client";
import { CURRENT_SEASON_ID, MCITY_TEAM_ID, PL_LEAGUE_ID } from "./constants";
import type {
  SmAggregate,
  SmApiResponse,
  SmFixture,
  SmPaginatedResponse,
  SmRound,
  SmScheduleEntry,
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

/** 맨시티 참가 라이브 경기 (전 대회) */
export async function getLiveMCityFixtures(): Promise<SmFixture[]> {
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
      revalidate: false,
    },
  );
  return response.data.filter((f) =>
    f.participants?.some((p) => p.id === MCITY_TEAM_ID),
  );
}

/** 날짜 범위 내 팀의 비-PL 경기 조회 (컵 대회) */
export async function getCupFixturesByTeam(
  teamId: number,
  startDate: string,
  endDate: string,
): Promise<SmFixture[]> {
  const response = await sportMonksFetch<SmPaginatedResponse<SmFixture>>(
    `/football/fixtures/between/${startDate}/${endDate}`,
    {
      filters: {
        fixtureTeamIds: teamId,
      },
      includes: [
        "participants",
        "scores",
        "events",
        "state",
        "round",
        "league",
      ],
      perPage: 50,
      revalidate: 3600, // 1시간 캐시
      tags: [`cup-fixtures-${teamId}`],
    },
  );
  // PL 경기는 제외 (PL은 별도 동기화)
  return response.data.filter((f) => f.league_id !== PL_LEAGUE_ID);
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

/**
 * 팀 스케줄에서 비-PL 컵 경기 추출
 * /football/schedules/teams/{teamId} 엔드포인트 사용
 * - between 엔드포인트와 달리 EFL Cup(Carabao Cup) 포함 전 대회 반환
 * - Starter 플랜: includes 미지원, participants/scores는 기본 포함
 * - 경기 위치: stage.fixtures / rounds.fixtures / aggregates.fixtures (3곳)
 * - 컵 시즌 ID는 PL 시즌 ID와 다름 (EFL Cup: 25654, FA Cup: 25919)
 */
export async function getTeamScheduleFixtures(
  teamId: number,
): Promise<SmFixture[]> {
  // Starter 플랜: 중첩 include 미지원 → includes 없이 호출
  // participants, scores는 기본 포함됨 (state 객체는 미포함, state_id만)
  const response = await sportMonksFetch<{ data: SmScheduleEntry[] }>(
    `/football/schedules/teams/${teamId}`,
    {
      revalidate: 3600,
      tags: [`schedule-${teamId}`],
      timeout: 30_000,
    },
  );

  const fixtures: SmFixture[] = [];

  for (const entry of response.data) {
    // PL 경기는 별도 동기화 → 제외
    if (entry.league_id === PL_LEAGUE_ID) continue;

    // 1) stage 직속 경기 (컵 결승, 단일전 라운드 등)
    for (const fixture of entry.fixtures ?? []) {
      fixtures.push({
        ...fixture,
        league_id: fixture.league_id ?? entry.league_id,
      });
    }

    // 2) rounds 내부 경기
    for (const round of entry.rounds ?? []) {
      for (const fixture of round.fixtures ?? []) {
        fixtures.push({
          ...fixture,
          league_id: fixture.league_id ?? entry.league_id,
          round: round,
        });
      }
      // 라운드 내 aggregate (있을 수 있음)
      for (const agg of (round as unknown as { aggregates?: SmAggregate[] })
        .aggregates ?? []) {
        for (const fixture of agg.fixtures ?? []) {
          fixtures.push({
            ...fixture,
            league_id: fixture.league_id ?? entry.league_id,
            round: round,
          });
        }
      }
    }

    // 3) stage 레벨 aggregate (2-leg 타이: EFL Cup 준결승, UCL 녹아웃 등)
    for (const agg of entry.aggregates ?? []) {
      for (const fixture of agg.fixtures ?? []) {
        fixtures.push({
          ...fixture,
          league_id: fixture.league_id ?? entry.league_id,
        });
      }
    }
  }

  return fixtures;
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
