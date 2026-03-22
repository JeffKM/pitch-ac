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
      <Badge
        variant="secondary"
        className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-xs)]"
      >
        첫 시즌
      </Badge>
    );
  }

  const delta = currentValue - prevSeasonValue;

  if (delta > 0) {
    return (
      <div className="flex items-center gap-1 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-green">
        <TrendingUp className="size-3" />
        <span className="tabular-nums">+{format(delta)} vs 전시즌</span>
      </div>
    );
  }

  if (delta < 0) {
    return (
      <div className="flex items-center gap-1 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-red">
        <TrendingDown className="size-3" />
        <span className="tabular-nums">{format(delta)} vs 전시즌</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/40">
      <Minus className="size-3" />
      <span>전시즌과 동일</span>
    </div>
  );
}
