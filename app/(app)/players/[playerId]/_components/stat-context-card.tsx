// 개별 맥락 스탯 카드 — 수치 + 리그 순위 + 백분위 + 전년 비교

import { GlossaryPopover } from "@/components/glossary-popover";
import { Card, CardContent } from "@/components/ui/card";
import type { StatContext } from "@/types";

import { PercentileBar } from "./percentile-bar";
import { SeasonDeltaIndicator } from "./season-delta-indicator";

interface StatContextCardProps {
  label: string;
  value: number;
  format?: (v: number) => string;
  context: StatContext;
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
    <Card>
      <CardContent className="space-y-2 p-4">
        {/* 레이블 + 용어 설명 */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
          {glossaryId && <GlossaryPopover glossaryId={glossaryId} />}
        </div>

        {/* 수치 */}
        <p className="text-2xl font-bold tabular-nums">{format(value)}</p>

        {/* 리그 순위 */}
        <p className="text-xs font-medium text-foreground">
          리그 {context.rank}위
        </p>

        {/* 백분위 바 */}
        <PercentileBar percentile={context.percentile} />

        {/* 전 시즌 비교 */}
        <SeasonDeltaIndicator
          currentValue={value}
          prevSeasonValue={context.prevSeason}
          format={format}
        />
      </CardContent>
    </Card>
  );
}
