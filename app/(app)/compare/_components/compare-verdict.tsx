// 비교 결과 판정 — 항목별 우위 요약 텍스트

import { cn } from "@/lib/utils";
import type { Player, PlayerSeasonStats } from "@/types";

import { COMPARE_STAT_DEFINITIONS } from "./compare-stat-table";

interface CompareVerdictProps {
  player1: Player;
  player2: Player;
  stats1: PlayerSeasonStats;
  stats2: PlayerSeasonStats;
}

export function CompareVerdict({
  player1,
  player2,
  stats1,
  stats2,
}: CompareVerdictProps) {
  const player1Wins = COMPARE_STAT_DEFINITIONS.filter(
    ({ key }) => stats1[key] > stats2[key],
  ).length;
  const player2Wins = COMPARE_STAT_DEFINITIONS.filter(
    ({ key }) => stats2[key] > stats1[key],
  ).length;

  const isDraw = player1Wins === player2Wins;
  const leader = player1Wins > player2Wins ? player1 : player2;
  const leadCount = Math.max(player1Wins, player2Wins);
  const isPlayer1Leading = player1Wins > player2Wins;

  return (
    <div className="rounded-lg border bg-muted/40 px-4 py-3 text-center text-sm font-semibold">
      {isDraw ? (
        <span className="text-muted-foreground">
          판정: 무승부 ({player1Wins}/{COMPARE_STAT_DEFINITIONS.length}개 항목
          동점)
        </span>
      ) : (
        <span>
          판정:{" "}
          <span
            className={cn(isPlayer1Leading ? "text-chart-1" : "text-chart-2")}
          >
            {leader.name}
          </span>
          이(가) {leadCount}/{COMPARE_STAT_DEFINITIONS.length}개 항목에서 우위
        </span>
      )}
    </div>
  );
}
