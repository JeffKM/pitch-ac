// SportMonks 라운드(게임위크) API 서비스
import { sportMonksFetch } from "./client";
import { CURRENT_SEASON_ID } from "./constants";
import type { SmApiResponse, SmPaginatedResponse, SmRound } from "./types";

/** 시즌 전체 라운드 목록 조회 */
export async function getSeasonRounds(
  seasonId: number = CURRENT_SEASON_ID,
): Promise<SmRound[]> {
  const response = await sportMonksFetch<SmPaginatedResponse<SmRound>>(
    `/football/rounds/seasons/${seasonId}`,
    {
      perPage: 50,
      revalidate: 86400,
      tags: [`season-rounds-${seasonId}`],
    },
  );
  return response.data;
}

/** 현재 진행 중인 라운드 조회
 * - is_current=true 라운드 우선
 * - 없으면 가장 최근 종료된 라운드 (휴식기·국제 A매치 기간 대응)
 */
export async function getCurrentRound(
  seasonId: number = CURRENT_SEASON_ID,
): Promise<SmRound | null> {
  const rounds = await getSeasonRounds(seasonId);
  if (!rounds.length) return null;

  const current = rounds.find((r) => r.is_current);
  if (current) return current;

  // 폴백: 종료된 라운드 중 ending_at 기준 가장 최근 것
  const finished = rounds
    .filter((r) => r.finished && r.ending_at)
    .sort((a, b) => b.ending_at.localeCompare(a.ending_at));
  return finished[0] ?? rounds[rounds.length - 1];
}

/** 특정 라운드 조회 */
export async function getRoundById(roundId: number): Promise<SmRound> {
  const response = await sportMonksFetch<SmApiResponse<SmRound>>(
    `/football/rounds/${roundId}`,
    {
      revalidate: 86400,
      tags: [`round-${roundId}`],
    },
  );
  return response.data;
}
