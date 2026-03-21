// 선수 관련 테이블 쿼리 함수

import { createClient } from "@/lib/supabase/server";
import type { Player, PlayerMatchStats, PlayerSeasonStats } from "@/types";

import {
  type PlayerMatchStatsRow,
  playerMatchStatsRowToStats,
  type PlayerRow,
  playerRowToPlayer,
  type PlayerSeasonStatsRow,
  playerSeasonStatsRowToStats,
} from "./mappers";

/** 전체 선수 목록 조회 (이름순 정렬) */
export async function getAllPlayers(): Promise<Player[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(`players 조회 실패: ${error.message}`);

  return (data as PlayerRow[]).map(playerRowToPlayer);
}

/** ID로 선수 단건 조회 */
export async function getPlayerById(id: number): Promise<Player | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`player 조회 실패: ${error.message}`);
  if (!data) return null;

  return playerRowToPlayer(data as PlayerRow);
}

/** 선수 ID + 시즌으로 시즌 스탯 조회 */
export async function getPlayerSeasonStats(
  playerId: number,
  season: string,
): Promise<PlayerSeasonStats | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("player_season_stats")
    .select("*")
    .eq("player_id", playerId)
    .eq("season", season)
    .maybeSingle();

  if (error) throw new Error(`player_season_stats 조회 실패: ${error.message}`);
  if (!data) return null;

  return playerSeasonStatsRowToStats(data as PlayerSeasonStatsRow);
}

/** 여러 선수 ID의 시즌 스탯 배치 조회 → Map<playerId, PlayerSeasonStats> (N+1 방지) */
export async function getPlayerSeasonStatsByIds(
  playerIds: number[],
  season: string,
): Promise<Map<number, PlayerSeasonStats>> {
  if (playerIds.length === 0) return new Map();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("player_season_stats")
    .select("*")
    .in("player_id", playerIds)
    .eq("season", season);

  if (error)
    throw new Error(`player_season_stats 배치 조회 실패: ${error.message}`);

  const map = new Map<number, PlayerSeasonStats>();
  for (const row of data as PlayerSeasonStatsRow[]) {
    map.set(row.player_id, playerSeasonStatsRowToStats(row));
  }
  return map;
}

/** 선수 ID로 최근 경기 스탯 조회 (최신순, 최대 10경기) */
export async function getMatchStatsByPlayerId(
  playerId: number,
): Promise<PlayerMatchStats[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("player_match_stats")
    .select("*")
    .eq("player_id", playerId)
    .order("fixture_id", { ascending: false })
    .limit(10);

  if (error) throw new Error(`player_match_stats 조회 실패: ${error.message}`);

  return (data as PlayerMatchStatsRow[]).map(playerMatchStatsRowToStats);
}
