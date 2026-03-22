// 전 시즌 대비 변화 표시 컴포넌트

import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface SeasonDeltaIndicatorProps {
  currentValue: number;
  prevSeasonValue: number | null;
  format?: (v: number) => string;
}

export function SeasonDeltaIndicator({
  currentValue,
  prevSeasonValue,
  format = (v) => String(v),
}: SeasonDeltaIndicatorProps) {
  if (prevSeasonValue === null) {
    return (
      <Badge variant="secondary" className="text-xs">
        첫 시즌
      </Badge>
    );
  }

  const delta = currentValue - prevSeasonValue;

  if (delta > 0) {
    return (
      <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
        <TrendingUp className="size-3" />
        <span className="tabular-nums">+{format(delta)} vs 전시즌</span>
      </div>
    );
  }

  if (delta < 0) {
    return (
      <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
        <TrendingDown className="size-3" />
        <span className="tabular-nums">{format(delta)} vs 전시즌</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Minus className="size-3" />
      <span>전시즌과 동일</span>
    </div>
  );
}
