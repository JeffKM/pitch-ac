import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import { extractErrorMessage, type SyncResult, writeSyncLog } from "./log";

/**
 * 선수 시즌 통계 동기화 — 보류 (football-data.org 무료 티어 미지원)
 * 향후 scorers 엔드포인트로 득점/어시스트만 축소 동기화 예정
 */
export async function syncSeasonStats(): Promise<SyncResult> {
  const supabase = createAdminClient();
  const result: SyncResult = {
    entity: "player_season_stats",
    status: "success",
    recordsSynced: 0,
    errorMessage: "football-data.org 무료 티어: 시즌 스탯 동기화 보류",
  };

  try {
    await writeSyncLog(supabase, result);
  } catch (error) {
    result.status = "error";
    result.errorMessage = extractErrorMessage(error);
  }

  return result;
}
