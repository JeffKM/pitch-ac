// H2H(맞대결) 데이터 조회 서비스 — SportMonks API 직접 호출

import { getH2HFixtures } from "@/lib/api/sportmonks/fixtures";
import { mapSmFixtureToH2HResult } from "@/lib/api/sportmonks/mappers";
import type { H2HResult } from "@/types";

/**
 * 두 팀 간 H2H 최근 5경기 결과 조회
 * SportMonks API 직접 호출 (24시간 캐시)
 */
export async function fetchH2HResults(
  teamIdA: number,
  teamIdB: number,
): Promise<H2HResult[]> {
  const rawFixtures = await getH2HFixtures(teamIdA, teamIdB);

  return rawFixtures
    .map(mapSmFixtureToH2HResult)
    .filter((r): r is H2HResult => r !== null);
}
