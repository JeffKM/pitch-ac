import "server-only";

import { LEAGUE_BY_ID, type LeagueConfig } from "@/lib/constants/football";
import { createAdminClient } from "@/lib/supabase/admin";

/** 킥오프 후 결과 반영까지 대기 시간 (2.5시간 = 150분) */
const KICKOFF_OFFSET_MINUTES = 150;

/**
 * 결과 동기화가 필요한 리그 목록 조회
 *
 * 조건: status='NS' AND date < now() - 2.5h
 * → 킥오프 시간이 2.5시간 이상 지났지만 아직 NS 상태인 경기가 있는 리그
 * → 빈 배열이면 동기화 불필요 (cron 조기 종료, 0 API 호출)
 */
export async function getPendingResultLeagues(): Promise<LeagueConfig[]> {
  const supabase = createAdminClient();

  const cutoff = new Date(Date.now() - KICKOFF_OFFSET_MINUTES * 60 * 1000);

  const { data, error } = await supabase
    .from("fixtures")
    .select("league_id")
    .eq("status", "NS")
    .lt("date", cutoff.toISOString());

  if (error) {
    console.error("[getPendingResultLeagues] DB 조회 실패:", error.message);
    return [];
  }

  if (!data || data.length === 0) return [];

  // 중복 제거 후 LeagueConfig로 변환
  const uniqueLeagueIds = [...new Set(data.map((row) => row.league_id))];
  const leagues = uniqueLeagueIds.map((id) => LEAGUE_BY_ID[id]).filter(Boolean);

  return leagues;
}
