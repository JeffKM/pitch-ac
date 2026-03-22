// 백분위 프로그레스 바

import { cn } from "@/lib/utils";

interface PercentileBarProps {
  percentile: number; // 0~100
}

export function PercentileBar({ percentile }: PercentileBarProps) {
  const clamped = Math.max(0, Math.min(100, percentile));
  const barColor =
    clamped >= 90
      ? "bg-comic-green"
      : clamped >= 70
        ? "bg-comic-skyblue"
        : clamped >= 50
          ? "bg-comic-yellow"
          : "bg-comic-black/30";

  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-comic-cream"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`백분위 ${clamped}%`}
      >
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="w-8 text-right font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/40 tabular-nums">
        {clamped}%
      </span>
    </div>
  );
}
