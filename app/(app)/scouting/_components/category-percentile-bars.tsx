// ScoutLab Summary — 10개 카테고리 평균 백분위 수평 바 차트
import { cn } from "@/lib/utils";
import type {
  ScoutlabCategory,
  ScoutlabCategoryMetrics,
  ScoutlabMetrics,
} from "@/types";
import { SCOUTLAB_CATEGORY_LABELS } from "@/types";

interface CategoryPercentileBarsProps {
  metrics: ScoutlabMetrics;
}

// 카테고리 키 → camelCase 프로퍼티 매핑 (misc 제외 = 10개)
const SUMMARY_CATEGORIES: Array<{
  key: ScoutlabCategory;
  prop: keyof ScoutlabMetrics;
}> = [
  { key: "final_product", prop: "finalProduct" },
  { key: "shooting", prop: "shooting" },
  { key: "creation", prop: "creation" },
  { key: "passing", prop: "passing" },
  { key: "ball_carrying", prop: "ballCarrying" },
  { key: "defending", prop: "defending" },
  { key: "set_pieces", prop: "setPieces" },
  { key: "aerial", prop: "aerial" },
  { key: "possession", prop: "possession" },
  { key: "vaep_overview", prop: "vaepOverview" },
];

/** 카테고리 내 모든 메트릭 평균 백분위 계산 */
function computeAvgPercentile(
  categoryMetrics: ScoutlabCategoryMetrics,
): number {
  const entries = Object.values(categoryMetrics);
  if (entries.length === 0) return 0;
  return Math.round(
    entries.reduce((sum, m) => sum + m.percentile, 0) / entries.length,
  );
}

/** 백분위 기반 색상 */
function getBarColor(percentile: number): string {
  if (percentile >= 90) return "bg-comic-green";
  if (percentile >= 70) return "bg-comic-skyblue";
  if (percentile >= 50) return "bg-comic-yellow";
  return "bg-comic-black/30";
}

export function CategoryPercentileBars({
  metrics,
}: CategoryPercentileBarsProps) {
  const bars = SUMMARY_CATEGORIES.map(({ key, prop }) => {
    const categoryMetrics = metrics[prop] as ScoutlabCategoryMetrics;
    const avg = categoryMetrics ? computeAvgPercentile(categoryMetrics) : 0;
    return { key, label: SCOUTLAB_CATEGORY_LABELS[key], avg };
  });

  return (
    <div className="space-y-3" data-testid="category-percentile-bars">
      {bars.map(({ key, label, avg }) => (
        <div
          key={key}
          className="flex items-center gap-3"
          data-testid={`category-bar-${key}`}
        >
          {/* 카테고리명 */}
          <span className="w-28 shrink-0 truncate font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)] text-comic-black/70">
            {label}
          </span>

          {/* 프로그레스 바 */}
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-comic-cream">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                getBarColor(avg),
              )}
              style={{ width: `${avg}%` }}
              role="progressbar"
              aria-valuenow={avg}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${label} 평균 백분위 ${avg}%`}
            />
          </div>

          {/* 퍼센트 텍스트 */}
          <span
            className="w-10 text-right font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)] text-comic-black tabular-nums"
            data-testid={`category-percent-${key}`}
          >
            {avg}%
          </span>
        </div>
      ))}
    </div>
  );
}
