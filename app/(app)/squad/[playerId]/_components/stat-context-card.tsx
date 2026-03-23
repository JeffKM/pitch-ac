// 개별 맥락 스탯 카드 — 수치 + 리그 순위 + 백분위 + 전년 비교

import { GlossaryPopover } from "@/components/glossary-popover";
import { Card, CardContent } from "@/components/ui/card";
import type { StatContext } from "@/types";

import { PercentileBar } from "./percentile-bar";
import { SeasonDeltaIndicator } from "./season-delta-indicator";

interface StatContextCardProps {
  label: string;
  value: number | null;
  format?: (v: number) => string;
  context: StatContext | null;
  /** 전문 용어 ID (xG, xA 등에만 제공) */
  glossaryId?: string;
}

export function StatContextCard({
  label,
  value,
  format = (v) => String(v),
  context,
  glossaryId,
}: StatContextCardProps) {
  return (
    <Card className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-cream">
      <CardContent className="space-y-2 p-4">
        {/* 레이블 + 용어 설명 */}
        <div className="flex items-center gap-1">
          <span className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/60">
            {label}
          </span>
          {glossaryId && <GlossaryPopover glossaryId={glossaryId} />}
        </div>

        {/* 데이터 없음 처리 */}
        {value === null || context === null ? (
          <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)] text-comic-black/50">
            N/A
          </p>
        ) : (
          <>
            {/* 수치 */}
            <p className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-2xl)] text-comic-black tabular-nums">
              {format(value)}
            </p>

            {/* 리그 순위 (context 미계산 시 숨김) */}
            {context.rank > 0 && (
              <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black">
                리그 {context.rank}위
              </p>
            )}

            {/* 백분위 바 (context 미계산 시 숨김) */}
            {context.percentile > 0 && (
              <PercentileBar percentile={context.percentile} />
            )}

            {/* 전 시즌 비교 */}
            <SeasonDeltaIndicator
              currentValue={value}
              prevSeasonValue={context.prevSeason}
              format={format}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
