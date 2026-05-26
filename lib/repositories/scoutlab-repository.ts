// ScoutLab 스카우팅 데이터 조회 Repository
import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type {
  ScoutlabActionMap,
  ScoutlabActionType,
  ScoutlabAdjustment,
  ScoutlabCategory,
  ScoutlabComparisonPosition,
  ScoutlabFilterOptions,
  ScoutlabLeague,
  ScoutlabMetrics,
  ScoutlabMode,
  ScoutlabPlayer,
  ScoutlabPosition,
  ScoutlabRadar,
  ScoutlabScatterPoint,
  ScoutlabSearchFilters,
  ScoutlabSimilarity,
} from "@/types";

import {
  type ScoutlabActionMapRow,
  scoutlabActionMapRowToActionMap,
  type ScoutlabMetricsRow,
  scoutlabMetricsRowToMetrics,
  type ScoutlabPlayerRow,
  scoutlabPlayerRowToPlayer,
  type ScoutlabRadarRow,
  scoutlabRadarRowToRadar,
  type ScoutlabSimilarityRow,
  scoutlabSimilarityRowToSimilarity,
} from "./scoutlab-mappers";

/** 선수 검색 (필터 기반) */
export async function searchScoutlabPlayers(
  filters: ScoutlabSearchFilters,
): Promise<ScoutlabPlayer[]> {
  const supabase = await createClient();

  let query = supabase
    .from("scoutlab_players")
    .select("*")
    .order("name", { ascending: true });

  if (filters.season) query = query.eq("season", filters.season);
  if (filters.league) query = query.eq("league", filters.league);
  if (filters.team) query = query.eq("team", filters.team);
  if (filters.position) query = query.eq("position", filters.position);
  if (filters.minMinutes)
    query = query.gte("minutes_played", filters.minMinutes);
  if (filters.maxAge) query = query.lte("age", filters.maxAge);

  const { data, error } = await query;

  if (error) throw new Error(`scoutlab_players 조회 실패: ${error.message}`);

  return (data as ScoutlabPlayerRow[]).map(scoutlabPlayerRowToPlayer);
}

/** 기본 선수 조회 (playerId 미지정 시 Haaland 표시용) */
export const getDefaultScoutlabPlayer = cache(
  async (season: string): Promise<ScoutlabPlayer | null> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("scoutlab_players")
      .select("*")
      .eq("name", "Erling Haaland")
      .eq("season", season)
      .maybeSingle();

    if (error || !data) return null;

    return scoutlabPlayerRowToPlayer(data as ScoutlabPlayerRow);
  },
);

/** ScoutLab 선수 단건 조회 */
export const getScoutlabPlayerById = cache(
  async (id: number): Promise<ScoutlabPlayer | null> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("scoutlab_players")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`scoutlab_players 조회 실패: ${error.message}`);
    if (!data) return null;

    return scoutlabPlayerRowToPlayer(data as ScoutlabPlayerRow);
  },
);

/** 선수 메트릭 조회 (요청된 comparison_position 우선, 없으면 폴백) */
export const getScoutlabMetrics = cache(
  async (
    playerId: number,
    season: string,
    mode: ScoutlabMode = "per90",
    adjustment: ScoutlabAdjustment = "padj",
    comparisonPosition: ScoutlabComparisonPosition = "AM/W",
  ): Promise<ScoutlabMetrics | null> => {
    const supabase = await createClient();

    // 1차: 요청된 comparison_position으로 조회
    const { data, error } = await supabase
      .from("scoutlab_metrics")
      .select("*")
      .eq("player_id", playerId)
      .eq("season", season)
      .eq("mode", mode)
      .eq("adjustment", adjustment)
      .eq("comparison_position", comparisonPosition)
      .maybeSingle();

    if (error) throw new Error(`scoutlab_metrics 조회 실패: ${error.message}`);
    if (data) return scoutlabMetricsRowToMetrics(data as ScoutlabMetricsRow);

    // 2차 폴백: comparison_position 무관하게 아무 행이든 조회
    const { data: fallback, error: fbError } = await supabase
      .from("scoutlab_metrics")
      .select("*")
      .eq("player_id", playerId)
      .eq("season", season)
      .eq("mode", mode)
      .eq("adjustment", adjustment)
      .limit(1)
      .maybeSingle();

    if (fbError)
      throw new Error(`scoutlab_metrics 폴백 조회 실패: ${fbError.message}`);
    if (!fallback) return null;

    return scoutlabMetricsRowToMetrics(fallback as ScoutlabMetricsRow);
  },
);

/** 시즌 추이 (여러 시즌 메트릭) */
export async function getScoutlabProgression(
  playerId: number,
  mode: ScoutlabMode = "per90",
  adjustment: ScoutlabAdjustment = "padj",
  comparisonPosition: ScoutlabComparisonPosition = "AM/W",
): Promise<ScoutlabMetrics[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("scoutlab_metrics")
    .select("*")
    .eq("player_id", playerId)
    .eq("mode", mode)
    .eq("adjustment", adjustment)
    .eq("comparison_position", comparisonPosition)
    .order("season", { ascending: true });

  if (error)
    throw new Error(`scoutlab_metrics 추이 조회 실패: ${error.message}`);

  return (data as ScoutlabMetricsRow[]).map(scoutlabMetricsRowToMetrics);
}

/** 레이더 차트 데이터 조회 */
export const getScoutlabRadar = cache(
  async (playerId: number, season: string): Promise<ScoutlabRadar | null> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("scoutlab_radar")
      .select("*")
      .eq("player_id", playerId)
      .eq("season", season)
      .maybeSingle();

    if (error) throw new Error(`scoutlab_radar 조회 실패: ${error.message}`);
    if (!data) return null;

    return scoutlabRadarRowToRadar(data as ScoutlabRadarRow);
  },
);

/** 유사 선수 조회 */
export const getScoutlabSimilarity = cache(
  async (
    playerId: number,
    season: string,
  ): Promise<ScoutlabSimilarity | null> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("scoutlab_similarity")
      .select("*")
      .eq("player_id", playerId)
      .eq("season", season)
      .maybeSingle();

    if (error)
      throw new Error(`scoutlab_similarity 조회 실패: ${error.message}`);
    if (!data) return null;

    return scoutlabSimilarityRowToSimilarity(data as ScoutlabSimilarityRow);
  },
);

/** 액션맵 데이터 조회 */
export const getScoutlabActionMaps = cache(
  async (
    playerId: number,
    season: string,
    actionType?: ScoutlabActionType,
  ): Promise<ScoutlabActionMap[]> => {
    const supabase = await createClient();

    let query = supabase
      .from("scoutlab_action_maps")
      .select("*")
      .eq("player_id", playerId)
      .eq("season", season);

    if (actionType) query = query.eq("action_type", actionType);

    const { data, error } = await query;

    if (error)
      throw new Error(`scoutlab_action_maps 조회 실패: ${error.message}`);

    return (data as ScoutlabActionMapRow[]).map(
      scoutlabActionMapRowToActionMap,
    );
  },
);

/** 산점도 전체 데이터 조회 */
export async function getScatterData(
  xMetric: string,
  yMetric: string,
  xCategory: ScoutlabCategory,
  yCategory: ScoutlabCategory,
  filters: ScoutlabSearchFilters,
): Promise<ScoutlabScatterPoint[]> {
  const supabase = await createClient();

  // 메트릭 + 선수 전체 조회 후 클라이언트에서 JSONB 추출
  let query = supabase
    .from("scoutlab_metrics")
    .select("*, scoutlab_players!inner(*)")
    .eq("mode", "per90")
    .eq("adjustment", "padj");

  if (filters.season) query = query.eq("season", filters.season);
  if (filters.league)
    query = query.eq("scoutlab_players.league", filters.league);
  if (filters.position)
    query = query.eq("scoutlab_players.position", filters.position);
  if (filters.minMinutes)
    query = query.gte("scoutlab_players.minutes_played", filters.minMinutes);
  if (filters.maxAge) query = query.lte("scoutlab_players.age", filters.maxAge);

  const { data, error } = await query;

  if (error) throw new Error(`scatter 데이터 조회 실패: ${error.message}`);

  type MetricValue = { value: number; percentile: number };
  type CategoryMetrics = Record<string, MetricValue>;

  const points: ScoutlabScatterPoint[] = [];
  for (const row of data ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = row as Record<string, any>;
    const xCat = r[xCategory] as CategoryMetrics | null;
    const yCat = r[yCategory] as CategoryMetrics | null;
    const xVal = xCat?.[xMetric];
    const yVal = yCat?.[yMetric];
    const player = r.scoutlab_players as ScoutlabPlayerRow;

    if (xVal && yVal && player) {
      points.push({
        playerId: player.id,
        name: player.name,
        team: player.team,
        league: player.league as ScoutlabLeague,
        position: player.position as ScoutlabPosition,
        x: xVal.value,
        y: yVal.value,
      });
    }
  }

  return points;
}

/** 메트릭별 랭킹 데이터 */
export async function getRankingData(
  metric: string,
  category: ScoutlabCategory,
  filters: ScoutlabSearchFilters,
  limit: number = 50,
): Promise<
  Array<{ player: ScoutlabPlayer; value: number; percentile: number }>
> {
  const supabase = await createClient();

  let query = supabase
    .from("scoutlab_metrics")
    .select("*, scoutlab_players!inner(*)")
    .eq("mode", "per90")
    .eq("adjustment", "padj")
    .limit(2000);

  if (filters.season) query = query.eq("season", filters.season);
  if (filters.league)
    query = query.eq("scoutlab_players.league", filters.league);
  if (filters.position)
    query = query.eq("scoutlab_players.position", filters.position);
  if (filters.minMinutes)
    query = query.gte("scoutlab_players.minutes_played", filters.minMinutes);

  const { data, error } = await query;

  if (error) throw new Error(`ranking 데이터 조회 실패: ${error.message}`);

  type MetricValue = { value: number; percentile: number };
  type CategoryMetrics = Record<string, MetricValue>;

  const results: Array<{
    player: ScoutlabPlayer;
    value: number;
    percentile: number;
  }> = [];

  for (const row of data ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = row as Record<string, any>;
    const cat = r[category] as CategoryMetrics | null;
    const metricData = cat?.[metric];
    const playerRow = r.scoutlab_players as ScoutlabPlayerRow;

    if (metricData && playerRow) {
      results.push({
        player: scoutlabPlayerRowToPlayer(playerRow),
        value: metricData.value,
        percentile: metricData.percentile,
      });
    }
  }

  // 백분위 내림차순 정렬 + limit
  results.sort((a, b) => b.value - a.value);
  return results.slice(0, limit);
}

/** 메트릭 키 목록 추출용 — 아무 선수 1명의 메트릭 조회 */
export const getSampleMetrics = cache(
  async (
    season: string,
    mode: ScoutlabMode = "per90",
    adjustment: ScoutlabAdjustment = "padj",
  ): Promise<ScoutlabMetrics | null> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("scoutlab_metrics")
      .select("*")
      .eq("season", season)
      .eq("mode", mode)
      .eq("adjustment", adjustment)
      .limit(1);

    if (error) throw new Error(`sample metrics 조회 실패: ${error.message}`);
    if (!data || data.length === 0) return null;

    return scoutlabMetricsRowToMetrics(data[0] as ScoutlabMetricsRow);
  },
);

/** 필터 옵션 조회 (드롭다운용) */
export const getScoutlabFilterOptions = cache(
  async (season?: string): Promise<ScoutlabFilterOptions> => {
    const supabase = await createClient();

    let query = supabase
      .from("scoutlab_players")
      .select("league, team, position, season");
    if (season) query = query.eq("season", season);

    const { data, error } = await query;

    if (error) throw new Error(`필터 옵션 조회 실패: ${error.message}`);

    const leagues = new Set<ScoutlabLeague>();
    const teams = new Set<string>();
    const positions = new Set<ScoutlabPosition>();
    const seasons = new Set<string>();
    const teamsByLeagueMap = new Map<string, Set<string>>();

    for (const row of data ?? []) {
      const l = row.league as string;
      const t = row.team as string;
      leagues.add(l as ScoutlabLeague);
      teams.add(t);
      positions.add(row.position as ScoutlabPosition);
      seasons.add(row.season as string);

      if (!teamsByLeagueMap.has(l)) teamsByLeagueMap.set(l, new Set());
      teamsByLeagueMap.get(l)!.add(t);
    }

    // Map<string, Set> → Record<string, string[]>
    const teamsByLeague: Record<string, string[]> = {};
    for (const [league, teamSet] of teamsByLeagueMap) {
      teamsByLeague[league] = [...teamSet].sort();
    }

    return {
      leagues: [...leagues].sort(),
      teams: [...teams].sort(),
      teamsByLeague,
      positions: [...positions].sort(),
      seasons: [...seasons].sort().reverse(),
    };
  },
);
