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
  const player1Wins = COMPARE_STAT_DEFINITIONS.filter(({ key }) => {
    const v1 = stats1[key];
    const v2 = stats2[key];
    return v1 !== null && v2 !== null && v1 > v2;
  }).length;
  const player2Wins = COMPARE_STAT_DEFINITIONS.filter(({ key }) => {
    const v1 = stats1[key];
    const v2 = stats2[key];
    return v1 !== null && v2 !== null && v2 > v1;
  }).length;

  const isDraw = player1Wins === player2Wins;
  const leader = player1Wins > player2Wins ? player1 : player2;
  const leadCount = Math.max(player1Wins, player2Wins);
  const isPlayer1Leading = player1Wins > player2Wins;

  return (
    <div className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-yellow px-4 py-3 text-center font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-sm)] text-comic-black">
      {isDraw ? (
        <span className="text-comic-black/50">
          판정: 무승부 ({player1Wins}/{COMPARE_STAT_DEFINITIONS.length}개 항목
          동점)
        </span>
      ) : (
        <span>
          판정:{" "}
          <span
            className={cn(
              isPlayer1Leading ? "text-comic-skyblue" : "text-comic-red",
            )}
          >
            {leader.name}
          </span>
          이(가) {leadCount}/{COMPARE_STAT_DEFINITIONS.length}개 항목에서 우위
        </span>
      )}
    </div>
  );
}
