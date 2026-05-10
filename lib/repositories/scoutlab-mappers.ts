// ScoutLab DB row(snake_case) → 앱 타입(camelCase) 변환
import "server-only";

import type {
  ScoutlabActionLine,
  ScoutlabActionMap,
  ScoutlabActionType,
  ScoutlabAdjustment,
  ScoutlabCategoryMetrics,
  ScoutlabLeague,
  ScoutlabMetrics,
  ScoutlabMode,
  ScoutlabPlayer,
  ScoutlabPosition,
  ScoutlabRadar,
  ScoutlabRadarAxis,
  ScoutlabSimilarity,
  ScoutlabSimilarPlayer,
} from "@/types";

// ── Row 타입 (Supabase 반환값) ──

export interface ScoutlabPlayerRow {
  id: number;
  name: string;
  team: string;
  league: string;
  position: string;
  season: string;
  nationality: string | null;
  age: number | null;
  height: number | null;
  minutes_played: number;
  pitch_ac_player_id: number | null;
}

export interface ScoutlabMetricsRow {
  id: number;
  player_id: number;
  season: string;
  mode: string;
  adjustment: string;
  final_product: ScoutlabCategoryMetrics;
  shooting: ScoutlabCategoryMetrics;
  creation: ScoutlabCategoryMetrics;
  passing: ScoutlabCategoryMetrics;
  ball_carrying: ScoutlabCategoryMetrics;
  defending: ScoutlabCategoryMetrics;
  set_pieces: ScoutlabCategoryMetrics;
  aerial: ScoutlabCategoryMetrics;
  possession: ScoutlabCategoryMetrics;
  vaep_overview: ScoutlabCategoryMetrics;
  misc: ScoutlabCategoryMetrics;
}

export interface ScoutlabRadarRow {
  id: number;
  player_id: number;
  season: string;
  axes: ScoutlabRadarAxis[];
}

export interface ScoutlabActionMapRow {
  id: number;
  player_id: number;
  season: string;
  action_type: string;
  lines: ScoutlabActionLine[];
  total_count: number;
  per90: number;
}

export interface ScoutlabSimilarityRow {
  id: number;
  player_id: number;
  season: string;
  similar_players: ScoutlabSimilarPlayer[];
}

// ── 매퍼 함수 ──

export function scoutlabPlayerRowToPlayer(
  row: ScoutlabPlayerRow,
): ScoutlabPlayer {
  return {
    id: row.id,
    name: row.name,
    team: row.team,
    league: row.league as ScoutlabLeague,
    position: row.position as ScoutlabPosition,
    season: row.season,
    nationality: row.nationality,
    age: row.age,
    height: row.height,
    minutesPlayed: row.minutes_played,
    pitchAcPlayerId: row.pitch_ac_player_id,
  };
}

export function scoutlabMetricsRowToMetrics(
  row: ScoutlabMetricsRow,
): ScoutlabMetrics {
  return {
    id: row.id,
    playerId: row.player_id,
    season: row.season,
    mode: row.mode as ScoutlabMode,
    adjustment: row.adjustment as ScoutlabAdjustment,
    finalProduct: row.final_product,
    shooting: row.shooting,
    creation: row.creation,
    passing: row.passing,
    ballCarrying: row.ball_carrying,
    defending: row.defending,
    setPieces: row.set_pieces,
    aerial: row.aerial,
    possession: row.possession,
    vaepOverview: row.vaep_overview,
    misc: row.misc,
  };
}

export function scoutlabRadarRowToRadar(row: ScoutlabRadarRow): ScoutlabRadar {
  return {
    id: row.id,
    playerId: row.player_id,
    season: row.season,
    axes: row.axes,
  };
}

export function scoutlabActionMapRowToActionMap(
  row: ScoutlabActionMapRow,
): ScoutlabActionMap {
  return {
    id: row.id,
    playerId: row.player_id,
    season: row.season,
    actionType: row.action_type as ScoutlabActionType,
    lines: row.lines,
    totalCount: row.total_count,
    per90: row.per90,
  };
}

export function scoutlabSimilarityRowToSimilarity(
  row: ScoutlabSimilarityRow,
): ScoutlabSimilarity {
  return {
    id: row.id,
    playerId: row.player_id,
    season: row.season,
    similarPlayers: row.similar_players,
  };
}
