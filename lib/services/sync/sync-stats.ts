import "server-only";

import { getPlayerById } from "@/lib/api/sportmonks";
import { mapSmPlayerToSeasonStats } from "@/lib/api/sportmonks/mappers";
import { createAdminClient } from "@/lib/supabase/admin";

import { seasonStatsToDbRow } from "./db-mappers";
import { extractErrorMessage, type SyncResult, writeSyncLog } from "./log";

const SEASON_LABEL = "2025/2026";
/** 1회 API 호출 배치 크기 (Vercel Cron 60초 제한 고려) */
const BATCH_SIZE = 50;

/**
 * 선수 시즌 통계 동기화
 * Starter 플랜에서 statistics bulk 엔드포인트 미지원 →
 * players 테이블의 전체 ID를 BATCH_SIZE씩 나눠 처리
 */
export async function syncSeasonStats(): Promise<SyncResult> {
  const supabase = createAdminClient();
  let totalSynced = 0;
  let failedCount = 0;

  try {
    // 1. players 테이블에서 전체 선수 ID 조회 (limit 제거)
    const { data: existingPlayers, error: fetchError } = await supabase
      .from("players")
      .select("id")
      .order("id", { ascending: true });

    if (fetchError) throw fetchError;

    const allPlayerIds = (existingPlayers ?? []).map((p) => p.id as number);

    if (allPlayerIds.length === 0) {
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

    // 2. BATCH_SIZE씩 나눠서 순차 처리
    for (let offset = 0; offset < allPlayerIds.length; offset += BATCH_SIZE) {
      const batch = allPlayerIds.slice(offset, offset + BATCH_SIZE);

      for (const playerId of batch) {
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
          failedCount++;
          // 개별 선수 실패는 건너뜀 (로그에 실패 수 기록)
          continue;
        }
      }
    }

    const result: SyncResult = {
      entity: "player_season_stats",
      status: "success",
      recordsSynced: totalSynced,
      ...(failedCount > 0 && {
        errorMessage: `${failedCount}명 선수 스탯 동기화 실패 (건너뜀)`,
      }),
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
