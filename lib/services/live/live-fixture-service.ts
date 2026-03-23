// 라이브 경기 서비스 — SportMonks 실시간 데이터 조회 및 DB 데이터와 병합
import "server-only";

import {
  getFixtureById as getSmFixtureById,
  getLiveMCityFixtures,
} from "@/lib/api/sportmonks/fixtures";
import { mapSmFixtureToFixture } from "@/lib/api/sportmonks/mappers";
import type { Fixture } from "@/types";

// 서버 인메모리 캐시 — 30초 TTL
// 다수 사용자 동시 요청 시 SportMonks API를 1회만 호출하기 위함
let cachedLiveFixtures: Fixture[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 30_000;

/** 현재 진행 중인 PL 라이브 경기 목록 반환 (서버 인메모리 캐시 30초) */
export async function getLiveFixtures(): Promise<Fixture[]> {
  const now = Date.now();
  if (cachedLiveFixtures !== null && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedLiveFixtures;
  }

  try {
    const smFixtures = await getLiveMCityFixtures();
    cachedLiveFixtures = smFixtures.map(mapSmFixtureToFixture);
    cacheTimestamp = now;
    return cachedLiveFixtures;
  } catch (error) {
    console.error("[getLiveFixtures] SportMonks API 호출 실패:", error);
    // API 장애 시 캐시된 데이터 또는 빈 배열 반환 → DB fallback 유지
    return cachedLiveFixtures ?? [];
  }
}

/** 특정 경기의 실시간 데이터를 SportMonks에서 직접 조회 (60초 revalidate 캐시) */
export async function getLiveFixtureById(
  fixtureId: number,
): Promise<Fixture | null> {
  try {
    const smFixture = await getSmFixtureById(fixtureId);
    return mapSmFixtureToFixture(smFixture);
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
