// 라이브 경기 서비스 — API-Football 실시간 데이터 조회 및 DB 데이터와 병합
import "server-only";

import {
  getFixtureById as getAfFixtureById,
  getFixtureEvents,
  getFixtureStatistics,
  getLiveFixtures as getAfLiveFixtures,
} from "@/lib/api/api-football/fixtures";
import {
  mapAfEventToFixtureEvent,
  mapAfFixtureToFixture,
  mapAfStatisticsToLiveStats,
} from "@/lib/api/api-football/mappers";
import { TOP5_LEAGUE_IDS } from "@/lib/constants/football";
import type { Fixture, FixtureEvent } from "@/types";

// 서버 인메모리 캐시 — 120초 TTL (일일 한도 절약)
let cachedLiveFixtures: Fixture[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 120_000;

/** 현재 진행 중인 5대 리그 라이브 경기 목록 반환 (서버 인메모리 캐시 120초) */
export async function getLiveFixtures(): Promise<Fixture[]> {
  const now = Date.now();
  if (cachedLiveFixtures !== null && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedLiveFixtures;
  }

  try {
    const allLive = await getAfLiveFixtures();
    // 5대 리그 경기만 필터
    const top5Live = allLive.filter((f) => TOP5_LEAGUE_IDS.has(f.league.id));
    cachedLiveFixtures = top5Live.map(mapAfFixtureToFixture);
    cacheTimestamp = now;
    return cachedLiveFixtures;
  } catch (error) {
    console.error("[getLiveFixtures] API-Football API 호출 실패:", error);
    return cachedLiveFixtures ?? [];
  }
}

/** 전체 라이브 데이터에서 특정 리그만 추출 */
export function filterLiveByLeague(
  liveFixtures: Fixture[],
  leagueId: number,
): Fixture[] {
  return liveFixtures.filter((f) => f.leagueId === leagueId);
}

/** 특정 경기의 실시간 데이터 조회 (events/statistics 별도 호출) */
export async function getLiveFixtureById(
  fixtureId: number,
): Promise<Fixture | null> {
  try {
    const afFixture = await getAfFixtureById(fixtureId);
    if (!afFixture) return null;

    const fixture = mapAfFixtureToFixture(afFixture);

    // 라이브 또는 종료 경기: events + statistics 별도 조회
    if (fixture.status === "LIVE" || fixture.status === "FT") {
      const [events, statistics] = await Promise.all([
        getFixtureEvents(fixtureId),
        getFixtureStatistics(fixtureId),
      ]);

      const mappedEvents: FixtureEvent[] = events
        .map(mapAfEventToFixtureEvent)
        .filter((e): e is FixtureEvent => e !== null);

      const liveStats = mapAfStatisticsToLiveStats(
        statistics,
        fixture.homeTeamId,
      );

      return {
        ...fixture,
        events: mappedEvents,
        liveStats,
      };
    }

    return fixture;
  } catch (error) {
    console.error(`[getLiveFixtureById] 경기 ${fixtureId} 조회 실패:`, error);
    return null;
  }
}

/** 라이브 경기 데이터를 DB 경기 목록에 병합 — 라이브 데이터가 있으면 완전 교체 */
export function mergeFixturesWithLive(
  dbFixtures: Fixture[],
  liveFixtures: Fixture[],
): Fixture[] {
  const liveMap = new Map(liveFixtures.map((f) => [f.id, f]));
  return dbFixtures.map((dbFixture) => {
    const liveFixture = liveMap.get(dbFixture.id);
    return liveFixture ?? dbFixture;
  });
}
