"use client";

// 스탯 비교 테이블 — 6개 지표를 선수 A vs 선수 B로 나란히 표시

import { Trophy } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Player, PlayerSeasonStats, StatContext } from "@/types";

// 비교 대상 6개 지표 정의 (compare-verdict에서도 재사용)
export const COMPARE_STAT_DEFINITIONS = [
  {
    key: "goals" as const,
    contextKey: "goalsContext" as const,
    label: "골",
  },
  {
    key: "xg" as const,
    contextKey: "xgContext" as const,
    label: "xG",
    format: (v: number) => v.toFixed(1),
  },
  {
    key: "assists" as const,
    contextKey: "assistsContext" as const,
    label: "어시스트",
  },
  {
    key: "keyPasses" as const,
    contextKey: "keyPassesContext" as const,
    label: "키패스",
  },
  {
    key: "dribbles" as const,
    contextKey: "dribblesContext" as const,
    label: "드리블",
  },
  {
    key: "averageRating" as const,
    contextKey: "averageRatingContext" as const,
    label: "평균 평점",
    format: (v: number) => v.toFixed(1),
  },
] as const;

interface StatRowProps {
  label: string;
  value1: number;
  value2: number;
  context1: StatContext;
  context2: StatContext;
  format?: (v: number) => string;
  isLast?: boolean;
}

function StatRow({
  label,
  value1,
  value2,
  context1,
  context2,
  format = String,
  isLast,
}: StatRowProps) {
  const winner =
    value1 > value2 ? "player1" : value2 > value1 ? "player2" : "draw";

  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-3",
        !isLast && "border-b",
      )}
    >
      {/* 선수 A 수치 */}
      <div className="text-right">
        <span
          className={cn(
            "text-base tabular-nums",
            winner === "player1" && "font-bold",
          )}
        >
          {format(value1)}
        </span>
        <span className="block text-xs text-muted-foreground">
          리그 {context1.rank}위
        </span>
      </div>

      {/* 중앙: 지표명 + 트로피 */}
      <div className="flex min-w-[72px] flex-col items-center gap-1 px-2">
        <span className="text-center text-xs text-muted-foreground">
          {label}
        </span>
        {winner !== "draw" && (
          <Trophy
            className={cn(
              "size-4",
              winner === "player1" ? "text-chart-1" : "text-chart-2",
            )}
            data-testid="trophy-icon"
          />
        )}
      </div>

      {/* 선수 B 수치 */}
      <div className="text-left">
        <span
          className={cn(
            "text-base tabular-nums",
            winner === "player2" && "font-bold",
          )}
        >
          {format(value2)}
        </span>
        <span className="block text-xs text-muted-foreground">
          리그 {context2.rank}위
        </span>
      </div>
    </div>
  );
}

interface CompareStatTableProps {
  player1: Player;
  player2: Player;
  stats1: PlayerSeasonStats;
  stats2: PlayerSeasonStats;
}

export function CompareStatTable({
  player1,
  player2,
  stats1,
  stats2,
}: CompareStatTableProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          스탯 비교 ({stats1.season})
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {/* 헤더: 선수 이름 */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 border-b pb-2">
          <p className="truncate text-right text-sm font-semibold text-chart-1">
            {player1.name}
          </p>
          <div className="min-w-[72px] px-2" />
          <p className="truncate text-left text-sm font-semibold text-chart-2">
            {player2.name}
          </p>
        </div>

        {/* 6개 스탯 행 */}
        {COMPARE_STAT_DEFINITIONS.map((def, index) => (
          <StatRow
            key={def.key}
            label={def.label}
            value1={stats1[def.key]}
            value2={stats2[def.key]}
            context1={stats1[def.contextKey]}
            context2={stats2[def.contextKey]}
            format={"format" in def ? def.format : undefined}
            isLast={index === COMPARE_STAT_DEFINITIONS.length - 1}
          />
        ))}
      </CardContent>
    </Card>
  );
}
