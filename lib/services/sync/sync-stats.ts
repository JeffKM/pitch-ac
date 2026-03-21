import { getPlayerById } from "@/lib/api/sportmonks";
import { mapSmPlayerToSeasonStats } from "@/lib/api/sportmonks/mappers";
import { createAdminClient } from "@/lib/supabase/admin";

import { seasonStatsToDbRow } from "./db-mappers";
import { extractErrorMessage, type SyncResult, writeSyncLog } from "./log";

const SEASON_LABEL = "2025/2026";
/** 1회 Cron 실행당 처리할 선수 수 */
const BATCH_SIZE = 50;

/**
 * 선수 시즌 통계 동기화
 * Starter 플랜에서 statistics bulk 엔드포인트 미지원 →
 * players 테이블의 ID로 getPlayerById 배치 처리
 */
export async function syncSeasonStats(): Promise<SyncResult> {
  const supabase = createAdminClient();
  let totalSynced = 0;

  try {
    // 1. players 테이블에서 ID 조회 (이미 synced된 선수)
    const { data: existingPlayers, error: fetchError } = await supabase
      .from("players")
      .select("id")
      .order("id", { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchError) throw fetchError;

    const playerIds = (existingPlayers ?? []).map((p) => p.id as number);

    if (playerIds.length === 0) {
      const result: SyncResult = {
        entity: "player_season_stats",
        status: "success",
        recordsSynced: 0,
        errorMessage:
          "players 테이블에 선수 없음 — sync-players 먼저 실행 필요",
      };
      await writeSyncLog(supabase, result);
      return result;
    }

    // 2. 각 선수별 시즌 스탯 getPlayerById로 가져오기
    for (const playerId of playerIds) {
      try {
        const raw = await getPlayerById(playerId);
        const stats = mapSmPlayerToSeasonStats(raw, SEASON_LABEL);
        if (!stats) continue;

        const { error } = await supabase
          .from("player_season_stats")
          .upsert(seasonStatsToDbRow(stats), {
            onConflict: "player_id,season",
          });

        if (!error) totalSynced++;
      } catch {
        // 개별 선수 실패는 건너뜀
        continue;
      }
    }

    const result: SyncResult = {
      entity: "player_season_stats",
      status: "success",
      recordsSynced: totalSynced,
    };
    await writeSyncLog(supabase, result);
    return result;
  } catch (error) {
    const result: SyncResult = {
      entity: "player_season_stats",
      status: "error",
      recordsSynced: totalSynced,
      errorMessage: extractErrorMessage(error),
    };
    await writeSyncLog(supabase, result);
    return result;
  }
}
