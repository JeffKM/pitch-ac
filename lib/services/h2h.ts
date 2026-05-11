// H2H(맞대결) 데이터 조회 서비스 — API-Football API 호출
import "server-only";

import { getH2HFixtures } from "@/lib/api/api-football/fixtures";
import { mapAfFixtureToH2HResult } from "@/lib/api/api-football/mappers";
import type { H2HResult } from "@/types";

/**
 * 두 팀 간 H2H 최근 5경기 결과 조회
 * API-Football API 직접 호출 (24시간 캐시)
 */
export async function fetchH2HResults(
  teamIdA: number,
  teamIdB: number,
): Promise<H2HResult[]> {
  const rawFixtures = await getH2HFixtures(teamIdA, teamIdB);

  return rawFixtures
    .map(mapAfFixtureToH2HResult)
    .filter((r): r is H2HResult => r !== null);
}
