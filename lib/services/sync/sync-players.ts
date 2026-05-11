import "server-only";

import {
  getPlayerById,
  getTeamSquad,
  mapAfPlayerToPlayer,
  mapAfPlayerToSeasonStats,
  mapAfSquadPlayerToPlayer,
} from "@/lib/api/api-football";
import { MCITY_TEAM_ID } from "@/lib/constants/football";
import { createAdminClient } from "@/lib/supabase/admin";

import { playerToDbRow, seasonStatsToDbRow } from "./db-mappers";
import { extractErrorMessage, type SyncResult, writeSyncLog } from "./log";

const SEASON_LABEL = "2025/2026";
/** 일일 한도 고려: 개별 선수 상세 조회 최대 배치 크기 */
const DETAIL_BATCH_SIZE = 10;

/**
 * 선수 기본정보 + 시즌 스탯 동기화
 * 1차: getTeamSquad() 1요청으로 맨시티 전체 스쿼드 가져옴
 * 2차: 개별 선수 상세 조회 (시즌 스탯 포함, 일일 한도 고려 배치 처리)
 */
export async function syncPlayers(): Promise<SyncResult> {
  const supabase = createAdminClient();
  let totalSynced = 0;

  try {
    // 1차: 스쿼드 API로 맨시티 전체 선수 기본정보 동기화
    const squadRes = await getTeamSquad(MCITY_TEAM_ID);
    if (!squadRes || squadRes.players.length === 0) {
      const result: SyncResult = {
        entity: "players",
        status: "error",
        recordsSynced: 0,
        errorMessage: "스쿼드 API 응답 없음",
      };
      await writeSyncLog(supabase, result);
      return result;
    }

    // 스쿼드 기본정보 upsert
    for (const rawPlayer of squadRes.players) {
      const player = mapAfSquadPlayerToPlayer(rawPlayer, MCITY_TEAM_ID);
      await supabase.from("players").upsert(playerToDbRow(player), {
        onConflict: "id",
      });
      totalSynced++;
    }

    // 2차: 개별 선수 상세 조회 (시즌 스탯 포함)
    // 일일 한도 절약을 위해 DETAIL_BATCH_SIZE만큼만 처리
    let failedCount = 0;
    const playerIds = squadRes.players.map((p) => p.id);
    const batch = playerIds.slice(0, DETAIL_BATCH_SIZE);

    for (const playerId of batch) {
      try {
        const raw = await getPlayerById(playerId);
        if (!raw) continue;

        // 상세 정보로 선수 데이터 업데이트
        const player = mapAfPlayerToPlayer(raw);
        await supabase
          .from("players")
          .upsert(playerToDbRow({ ...player, teamId: MCITY_TEAM_ID }), {
            onConflict: "id",
          });

        const stats = mapAfPlayerToSeasonStats(raw, SEASON_LABEL);
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
          ? `상세 조회: ${failedCount}/${batch.length}명 실패 (건너뜀)`
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
