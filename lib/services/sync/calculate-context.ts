// 맥락 데이터 계산 엔진
// DB의 player_season_stats를 읽어 포지션별 순위/백분위/전년비교를 계산하고
// context JSONB + radar_data JSONB를 일괄 업데이트한다

import { createAdminClient } from "@/lib/supabase/admin";
import type { PlayerPosition, StatContext } from "@/types";
import type { RadarData, RadarDataPoint, RadarDimension } from "@/types/radar";

import { extractErrorMessage, type SyncResult, writeSyncLog } from "./log";

// ─── 상수 ────────────────────────────────────────────────

const CURRENT_SEASON = "2025/2026";
const PREV_SEASON = "2024/2025";

/** 맥락 계산 대상 메트릭 (xG/xA는 Starter 플랜 미지원으로 항상 null — 제외) */
const CONTEXT_METRICS = [
  "goals",
  "assists",
  "keyPasses",
  "dribbles",
  "averageRating",
] as const;
type ContextMetric = (typeof CONTEXT_METRICS)[number];

/** 메트릭 → DB 컬럼 매핑 */
const METRIC_TO_COLUMN: Record<ContextMetric, string> = {
  goals: "goals",
  assists: "assists",
  keyPasses: "key_passes",
  dribbles: "dribbles",
  averageRating: "average_rating",
};

// ─── 내부 타입 ────────────────────────────────────────────

/** player_season_stats + players JOIN 결과 행 */
interface StatsWithPosition {
  id: number;
  player_id: number;
  goals: number;
  assists: number;
  key_passes: number;
  dribbles: number;
  average_rating: number;
  radar_data: RadarData | null;
  position: PlayerPosition;
}

/** 전년 시즌 스탯 행 */
interface PrevSeasonRow {
  player_id: number;
  goals: number;
  assists: number;
  key_passes: number;
  dribbles: number;
  average_rating: number;
}

// ─── 유틸 함수 ────────────────────────────────────────────

/**
 * Standard Competition Ranking (동점 처리)
 * 예: [19, 19, 14, 10] → {playerA: 1, playerB: 1, playerC: 3, playerD: 4}
 */
function computeRanks(
  entries: Array<{ playerId: number; value: number }>,
): Map<number, number> {
  const sorted = [...entries].sort((a, b) => b.value - a.value);
  const rankMap = new Map<number, number>();

  for (let i = 0; i < sorted.length; i++) {
    // 이전 항목과 동점이면 같은 순위 사용
    if (i > 0 && sorted[i].value === sorted[i - 1].value) {
      rankMap.set(sorted[i].playerId, rankMap.get(sorted[i - 1].playerId)!);
    } else {
      rankMap.set(sorted[i].playerId, i + 1);
    }
  }

  return rankMap;
}

/**
 * 백분위 계산: 1위→100, 꼴찌→0에 가까움
 * ((totalCount - rank) / (totalCount - 1)) * 100
 */
function computePercentile(rank: number, totalCount: number): number {
  if (totalCount <= 1) return 100;
  const raw = ((totalCount - rank) / (totalCount - 1)) * 100;
  return Math.round(Math.max(0, Math.min(100, raw)));
}

/** 포지션별 레이더 차트 positionAverage 계산 */
function computePositionAverageRadar(
  byPosition: Map<PlayerPosition, StatsWithPosition[]>,
): Map<PlayerPosition, RadarDataPoint[]> {
  const DIMENSION_LABELS: Record<RadarDimension, string> = {
    pace: "스피드",
    shooting: "슈팅",
    passing: "패스",
    dribbling: "드리블",
    defending: "수비",
    physical: "피지컬",
  };
  const ALL_DIMENSIONS: RadarDimension[] = [
    "pace",
    "shooting",
    "passing",
    "dribbling",
    "defending",
    "physical",
  ];

  const result = new Map<PlayerPosition, RadarDataPoint[]>();

  for (const [position, rows] of byPosition) {
    // radar_data.player가 있는 행만 대상
    const validRows = rows.filter(
      (r) => r.radar_data?.player && r.radar_data.player.length > 0,
    );
    if (validRows.length === 0) continue;

    // dimension별 합산
    const sums = new Map<RadarDimension, number>(
      ALL_DIMENSIONS.map((d) => [d, 0]),
    );
    for (const row of validRows) {
      for (const point of row.radar_data!.player) {
        sums.set(
          point.dimension,
          (sums.get(point.dimension) ?? 0) + point.value,
        );
      }
    }

    const avgPoints: RadarDataPoint[] = ALL_DIMENSIONS.map((dim) => ({
      dimension: dim,
      value: Math.round((sums.get(dim) ?? 0) / validRows.length),
      label: DIMENSION_LABELS[dim],
    }));

    result.set(position, avgPoints);
  }

  return result;
}

// ─── 메인 함수 ────────────────────────────────────────────

/** 맥락 데이터 계산 및 DB 업데이트 */
export async function calculateContext(): Promise<SyncResult> {
  const supabase = createAdminClient();
  let totalUpdated = 0;

  try {
    // Step 1: 현재 시즌 전체 스탯 + 포지션 JOIN 조회
    const { data: rawStats, error: fetchError } = await supabase
      .from("player_season_stats")
      .select(
        "id, player_id, goals, assists, key_passes, dribbles, average_rating, radar_data, players!inner(position)",
      )
      .eq("season", CURRENT_SEASON);

    if (fetchError) throw fetchError;

    if (!rawStats || rawStats.length === 0) {
      const result: SyncResult = {
        entity: "context_calculation",
        status: "success",
        recordsSynced: 0,
        errorMessage: "현재 시즌 스탯 데이터 없음 — sync-stats 먼저 실행 필요",
      };
      await writeSyncLog(supabase, result);
      return result;
    }

    // Supabase JOIN 결과를 타입 안전하게 변환
    const rows: StatsWithPosition[] = rawStats.map((r) => ({
      id: r.id as number,
      player_id: r.player_id as number,
      goals: r.goals as number,
      assists: r.assists as number,
      key_passes: r.key_passes as number,
      dribbles: r.dribbles as number,
      average_rating: r.average_rating as number,
      radar_data: r.radar_data as RadarData | null,
      position: ((r.players as unknown as { position: string }).position ??
        "MID") as PlayerPosition,
    }));

    // Step 2: 전년 시즌 스탯 조회 (prevSeason 비교용)
    const { data: prevRaw } = await supabase
      .from("player_season_stats")
      .select("player_id, goals, assists, key_passes, dribbles, average_rating")
      .eq("season", PREV_SEASON);

    const prevMap = new Map<number, PrevSeasonRow>();
    for (const p of prevRaw ?? []) {
      prevMap.set(p.player_id as number, p as PrevSeasonRow);
    }

    // Step 3: 포지션별 그룹핑
    const byPosition = new Map<PlayerPosition, StatsWithPosition[]>();
    for (const row of rows) {
      const group = byPosition.get(row.position) ?? [];
      group.push(row);
      byPosition.set(row.position, group);
    }

    // Step 4: 메트릭별 포지션 내 순위/백분위 계산
    // player_id → { goals: StatContext, assists: StatContext, ... }
    const contextMap = new Map<number, Record<string, StatContext>>();
    for (const row of rows) {
      contextMap.set(row.player_id, {});
    }

    for (const metric of CONTEXT_METRICS) {
      const col = METRIC_TO_COLUMN[metric] as keyof StatsWithPosition;

      for (const [, groupRows] of byPosition) {
        const entries = groupRows.map((r) => ({
          playerId: r.player_id,
          value: r[col] as number,
        }));
        const totalCount = entries.length;
        const rankMap = computeRanks(entries);

        for (const entry of entries) {
          const rank = rankMap.get(entry.playerId)!;
          const percentile = computePercentile(rank, totalCount);
          const prev = prevMap.get(entry.playerId);
          const prevValue = prev
            ? ((prev[col as keyof PrevSeasonRow] as number) ?? null)
            : null;

          contextMap.get(entry.playerId)![metric] = {
            rank,
            percentile,
            prevSeason: prevValue,
          };
        }
      }
    }

    // Step 5: 레이더 positionAverage 실제 평균으로 계산
    const posAvgMap = computePositionAverageRadar(byPosition);

    // Step 6: DB 배치 upsert (순차 UPDATE N회 → upsert 1회로 최적화)
    const upsertRows: Array<{
      id: number;
      player_id: number;
      season: string;
      context: Record<string, StatContext>;
      radar_data?: RadarData;
    }> = [];

    for (const row of rows) {
      const context = contextMap.get(row.player_id);
      if (!context) continue;

      // 레이더 positionAverage 갱신 (player 데이터는 유지)
      let updatedRadar = row.radar_data;
      const posAvg = posAvgMap.get(row.position);
      if (posAvg && updatedRadar?.player && updatedRadar.player.length > 0) {
        updatedRadar = { ...updatedRadar, positionAverage: posAvg };
      }

      upsertRows.push({
        id: row.id,
        player_id: row.player_id,
        season: CURRENT_SEASON,
        context,
        ...(updatedRadar ? { radar_data: updatedRadar } : {}),
      });
    }

    if (upsertRows.length > 0) {
      const { error: upsertError } = await supabase
        .from("player_season_stats")
        .upsert(upsertRows, { onConflict: "id", ignoreDuplicates: false });

      if (upsertError) {
        throw new Error(`context 배치 upsert 실패: ${upsertError.message}`);
      }
      totalUpdated = upsertRows.length;
    }

    const result: SyncResult = {
      entity: "context_calculation",
      status: "success",
      recordsSynced: totalUpdated,
    };
    await writeSyncLog(supabase, result);
    return result;
  } catch (error) {
    const result: SyncResult = {
      entity: "context_calculation",
      status: "error",
      recordsSynced: totalUpdated,
      errorMessage: extractErrorMessage(error),
    };
    await writeSyncLog(supabase, result);
    return result;
  }
}
