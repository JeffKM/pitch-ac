import "server-only";

import {
  getLeaguePlayers,
  mapAfPlayerToSeasonStats,
} from "@/lib/api/api-football";
import { createAdminClient } from "@/lib/supabase/admin";

import { seasonStatsToDbRow } from "./db-mappers";
import { extractErrorMessage, type SyncResult, writeSyncLog } from "./log";

const SEASON_LABEL = "2025/2026";

/**
 * 선수 시즌 통계 동기화
 * API-Football: getLeaguePlayers() 페이지네이션 일괄 조회 (~25 요청/500명)
 * 일일 한도 고려: 최대 25페이지까지만 처리
 */
export async function syncSeasonStats(): Promise<SyncResult> {
  const supabase = createAdminClient();
  let totalSynced = 0;
  let failedCount = 0;

  try {
    // players 테이블에서 전체 선수 ID 조회 (DB에 있는 선수만 스탯 업데이트)
    const { data: existingPlayers, error: fetchError } = await supabase
      .from("players")
      .select("id")
      .order("id", { ascending: true });

    if (fetchError) throw fetchError;

    const existingIds = new Set(
      (existingPlayers ?? []).map((p) => p.id as number),
    );

    if (existingIds.size === 0) {
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

    // 페이지네이션으로 전체 PL 선수 조회
    let page = 1;
    const maxPages = 25; // 일일 한도 고려

    while (page <= maxPages) {
      try {
        const res = await getLeaguePlayers(page);

        for (const raw of res.response) {
          // DB에 있는 선수만 스탯 업데이트
          if (!existingIds.has(raw.player.id)) continue;

          try {
            const stats = mapAfPlayerToSeasonStats(raw, SEASON_LABEL);
            if (!stats) continue;

            const { error } = await supabase
              .from("player_season_stats")
              .upsert(seasonStatsToDbRow(stats), {
                onConflict: "player_id,season",
              });

            if (!error) totalSynced++;
          } catch {
            failedCount++;
            continue;
          }
        }

        // 마지막 페이지 도달
        if (page >= res.paging.total) break;
        page++;
      } catch {
        // 한도 초과 등으로 중단 시 지금까지 결과 반환
        break;
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
