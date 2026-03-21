import {
  getCurrentRound,
  getFixturesByRound,
  getPlayerById,
} from "@/lib/api/sportmonks";
import {
  mapSmPlayerToPlayer,
  mapSmPlayerToSeasonStats,
} from "@/lib/api/sportmonks/mappers";
import { createAdminClient } from "@/lib/supabase/admin";

import { playerToDbRow, seasonStatsToDbRow } from "./db-mappers";
import { extractErrorMessage, type SyncResult, writeSyncLog } from "./log";

const SEASON_LABEL = "2025/2026";

/**
 * 선수 기본정보 + 시즌 스탯 동기화
 * Starter 플랜에서 squads/statistics bulk 엔드포인트 미지원 →
 * 현재 라운드 fixtures의 events·lineups에서 선수 ID 추출 후 getPlayerById 배치 처리
 */
export async function syncPlayers(): Promise<SyncResult> {
  const supabase = createAdminClient();
  let totalSynced = 0;

  try {
    // 1. 현재/최근 라운드 조회
    const currentRound = await getCurrentRound();
    if (!currentRound) {
      const result: SyncResult = {
        entity: "players",
        status: "success",
        recordsSynced: 0,
        errorMessage: "현재 라운드 정보 없음",
      };
      await writeSyncLog(supabase, result);
      return result;
    }

    // 2. 라운드 경기 목록 조회 (events.player, lineups.player 포함)
    const fixtures = await getFixturesByRound(currentRound.id);

    // 3. events + lineups에서 선수 ID 추출
    const playerIdSet = new Set<number>();
    for (const fixture of fixtures) {
      // events에서 추출
      for (const event of fixture.events ?? []) {
        if (event.player_id) playerIdSet.add(event.player_id);
        if (event.related_player_id) playerIdSet.add(event.related_player_id);
      }
      // lineups에서 추출
      for (const lineup of fixture.lineups ?? []) {
        if (lineup.player_id) playerIdSet.add(lineup.player_id);
      }
    }

    const playerIds = Array.from(playerIdSet);

    if (playerIds.length === 0) {
      const result: SyncResult = {
        entity: "players",
        status: "success",
        recordsSynced: 0,
        errorMessage: `라운드 ${currentRound.name}에서 선수 ID 추출 없음 (경기 전 상태일 수 있음)`,
      };
      await writeSyncLog(supabase, result);
      return result;
    }

    // 4. getPlayerById 배치 처리 → players + player_season_stats 동시 upsert
    let failedCount = 0;
    for (const playerId of playerIds) {
      try {
        const raw = await getPlayerById(playerId);

        const player = mapSmPlayerToPlayer(raw);
        if (player.teamId) {
          await supabase
            .from("players")
            .upsert(playerToDbRow(player), { onConflict: "id" });
          totalSynced++;
        }

        const stats = mapSmPlayerToSeasonStats(raw, SEASON_LABEL);
        if (stats) {
          await supabase
            .from("player_season_stats")
            .upsert(seasonStatsToDbRow(stats), {
              onConflict: "player_id,season",
            });
        }
      } catch {
        failedCount++;
        continue;
      }
    }

    const result: SyncResult = {
      entity: "players",
      status: "success",
      recordsSynced: totalSynced,
      errorMessage:
        failedCount > 0
          ? `${failedCount}/${playerIds.length}명 동기화 실패 (건너뜀)`
          : undefined,
    };
    await writeSyncLog(supabase, result);
    return result;
  } catch (error) {
    const result: SyncResult = {
      entity: "players",
      status: "error",
      recordsSynced: totalSynced,
      errorMessage: extractErrorMessage(error),
    };
    await writeSyncLog(supabase, result);
    return result;
  }
}
