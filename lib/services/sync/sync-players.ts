import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import { extractErrorMessage, type SyncResult, writeSyncLog } from "./log";

/**
 * 선수 동기화 — 보류 (football-data.org 무료 티어에서는 scorers만 제공)
 * 향후 scorers 엔드포인트로 축소 동기화 구현 예정
 */
export async function syncPlayers(): Promise<SyncResult> {
  const supabase = createAdminClient();
  const result: SyncResult = {
    entity: "players",
    status: "success",
    recordsSynced: 0,
    errorMessage: "football-data.org 무료 티어: 선수 동기화 보류",
  };

  try {
    await writeSyncLog(supabase, result);
  } catch (error) {
    result.status = "error";
    result.errorMessage = extractErrorMessage(error);
  }

  return result;
}
