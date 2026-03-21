// OG 이미지용 비교 로직 유틸 (서버 전용)

import type { PlayerSeasonStats } from "@/types";

export type Winner = "player1" | "player2" | "draw";

export interface OgStatDef {
  key: keyof PlayerSeasonStats;
  label: string;
  format?: (v: number) => string;
}

// OG 이미지용 스탯 정의 (영어 라벨)
export const OG_STAT_DEFINITIONS: OgStatDef[] = [
  { key: "goals", label: "Goals" },
  { key: "xg", label: "xG", format: (v) => v.toFixed(1) },
  { key: "assists", label: "Assists" },
  { key: "keyPasses", label: "Key Passes" },
  { key: "dribbles", label: "Dribbles" },
  { key: "averageRating", label: "Rating", format: (v) => v.toFixed(1) },
];

/** 단일 스탯 승자 판정 */
export function getStatWinner(
  v1: number | null,
  v2: number | null,
): Winner | null {
  if (v1 === null || v2 === null) return null;
  if (v1 > v2) return "player1";
  if (v2 > v1) return "player2";
  return "draw";
}

export interface VerdictData {
  player1Wins: number;
  player2Wins: number;
  isDraw: boolean;
  leaderName: string;
  leadCount: number;
  isPlayer1Leading: boolean;
}

/** 전체 판정 데이터 계산 */
export function computeVerdictData(
  stats1: PlayerSeasonStats,
  stats2: PlayerSeasonStats,
  player1Name: string,
  player2Name: string,
): VerdictData {
  let p1Wins = 0;
  let p2Wins = 0;

  for (const def of OG_STAT_DEFINITIONS) {
    const v1 = stats1[def.key];
    const v2 = stats2[def.key];
    if (typeof v1 === "number" && typeof v2 === "number") {
      if (v1 > v2) p1Wins++;
      else if (v2 > v1) p2Wins++;
    }
  }

  const isDraw = p1Wins === p2Wins;
  const isPlayer1Leading = p1Wins > p2Wins;

  return {
    player1Wins: p1Wins,
    player2Wins: p2Wins,
    isDraw,
    leaderName: isPlayer1Leading ? player1Name : player2Name,
    leadCount: Math.max(p1Wins, p2Wins),
    isPlayer1Leading,
  };
}
