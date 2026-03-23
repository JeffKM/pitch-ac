import "server-only";

import {
  getCurrentRound,
  getFixturesByRound,
  getPlayerById,
  getSeasonRounds,
  getSquadByTeamAndSeason,
  MCITY_TEAM_ID,
} from "@/lib/api/sportmonks";
import {
  mapSmPlayerToPlayer,
  mapSmPlayerToSeasonStats,
} from "@/lib/api/sportmonks/mappers";
import type { SmFixture } from "@/lib/api/sportmonks/types";
import { createAdminClient } from "@/lib/supabase/admin";

import { playerToDbRow, seasonStatsToDbRow } from "./db-mappers";
import { extractErrorMessage, type SyncResult, writeSyncLog } from "./log";

const SEASON_LABEL = "2025/2026";

/** SmFixture 배열에서 선수 ID 추출 (events + lineups) */
function extractPlayerIds(fixtures: SmFixture[]): Set<number> {
  const playerIdSet = new Set<number>();
  for (const fixture of fixtures) {
    for (const event of fixture.events ?? []) {
      if (event.player_id) playerIdSet.add(event.player_id);
      if (event.related_player_id) playerIdSet.add(event.related_player_id);
    }
    for (const lineup of fixture.lineups ?? []) {
      if (lineup.player_id) playerIdSet.add(lineup.player_id);
    }
  }
  return playerIdSet;
}

/**
 * 선수 기본정보 + 시즌 스탯 동기화
 * 1차: getSquadByTeamAndSeason()으로 맨시티 전체 스쿼드 동기화
 * 2차 (fallback): 현재 + 이전 라운드 fixtures의 events·lineups에서 선수 ID 추출 후 getPlayerById 배치 처리
 */
export async function syncPlayers(): Promise<SyncResult> {
  const supabase = createAdminClient();
  let totalSynced = 0;

  try {
    // 1차: 스쿼드 API로 맨시티 전체 선수 동기화
    try {
      const squadPlayers = await getSquadByTeamAndSeason(MCITY_TEAM_ID);

      if (squadPlayers.length > 0) {
        let failedCount = 0;
        for (const raw of squadPlayers) {
          try {
            const player = mapSmPlayerToPlayer(raw);
            // 스쿼드 API 응답에 teams include가 빠질 수 있으므로 teamId 보장
            const dbRow = playerToDbRow({
              ...player,
              teamId: player.teamId || MCITY_TEAM_ID,
            });
            await supabase.from("players").upsert(dbRow, { onConflict: "id" });
            totalSynced++;

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
              ? `스쿼드 API: ${failedCount}/${squadPlayers.length}명 실패 (건너뜀)`
              : undefined,
        };
        await writeSyncLog(supabase, result);
        return result;
      }
    } catch {
      // 스쿼드 API 실패 시 fixture 기반 fallback으로 진행
    }

    // 2차 (fallback): 현재 + 이전 라운드 경기에서 선수 추출
    const currentRound = await getCurrentRound();
    if (!currentRound) {
      const result: SyncResult = {
        entity: "players",
        status: "success",
        recordsSynced: 0,
        errorMessage: "스쿼드 API 실패 + 현재 라운드 정보 없음",
      };
      await writeSyncLog(supabase, result);
      return result;
    }

    // 현재 라운드 경기 조회
    const currentFixtures = await getFixturesByRound(currentRound.id);
    const playerIdSet = extractPlayerIds(currentFixtures);

    // 이전 라운드도 처리하여 현재 라운드 NS 팀 커버
    const rounds = await getSeasonRounds();
    const roundNumber = parseInt(currentRound.name, 10);
    if (roundNumber > 1) {
      const prevRound = rounds.find(
        (r) => parseInt(r.name, 10) === roundNumber - 1,
      );
      if (prevRound) {
        const prevFixtures = await getFixturesByRound(prevRound.id);
        const prevIds = extractPlayerIds(prevFixtures);
        for (const id of prevIds) {
          playerIdSet.add(id);
        }
      }
    }

    const playerIds = Array.from(playerIdSet);

    if (playerIds.length === 0) {
      const result: SyncResult = {
        entity: "players",
        status: "success",
        recordsSynced: 0,
        errorMessage: `스쿼드 API 실패 + 라운드 ${currentRound.name}에서 선수 ID 추출 없음`,
      };
      await writeSyncLog(supabase, result);
      return result;
    }

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
          ? `fixture fallback: ${failedCount}/${playerIds.length}명 동기화 실패`
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
