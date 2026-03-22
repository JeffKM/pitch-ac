// 대결형 수평 스탯 바 — 홈/어웨이 양방향 비교

import { GlossaryPopover } from "@/components/glossary-popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TeamLiveStats } from "@/types";

interface StatBarProps {
  homeStats: TeamLiveStats;
  awayStats: TeamLiveStats;
  homeTeamName: string;
  awayTeamName: string;
}

interface StatRowProps {
  label: string;
  homeValue: number | null;
  awayValue: number | null;
  format?: (v: number) => string;
  glossaryId?: string;
}

function StatRow({
  label,
  homeValue,
  awayValue,
  format,
  glossaryId,
}: StatRowProps) {
  // null 값은 "N/A" 표시 후 바 숨김
  if (homeValue === null || awayValue === null) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-muted-foreground tabular-nums">
            N/A
          </span>
          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
            {label}
            {glossaryId && <GlossaryPopover glossaryId={glossaryId} />}
          </span>
          <span className="font-medium text-muted-foreground tabular-nums">
            N/A
          </span>
        </div>
      </div>
    );
  }

  const total = homeValue + awayValue;
  const homePercent = total === 0 ? 50 : (homeValue / total) * 100;
  const awayPercent = 100 - homePercent;
  const fmt = format ?? String;

  return (
    <div className="space-y-1">
      {/* 수치 + 라벨 */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium tabular-nums">{fmt(homeValue)}</span>
        <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
          {label}
          {glossaryId && <GlossaryPopover glossaryId={glossaryId} />}
        </span>
        <span className="font-medium tabular-nums">{fmt(awayValue)}</span>
      </div>
      {/* 비율 바 */}
      <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-l-full bg-primary transition-all",
            homePercent >= awayPercent && "rounded-r-full",
          )}
          style={{ width: `${homePercent}%` }}
        />
        <div
          className="h-full flex-1 bg-muted-foreground/30"
          style={{ width: `${awayPercent}%` }}
        />
      </div>
    </div>
  );
}

export function StatBar({
  homeStats,
  awayStats,
  homeTeamName,
  awayTeamName,
}: StatBarProps) {
  return (
    <Card className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-white">
      <CardHeader className="pb-2">
        <CardTitle className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-sm)] text-comic-black">
          팀 스탯 비교
        </CardTitle>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{homeTeamName}</span>
          <span>{awayTeamName}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <StatRow
          label="점유율"
          homeValue={homeStats.possession}
          awayValue={awayStats.possession}
          format={(v) => `${v}%`}
          glossaryId="possession"
        />
        <StatRow
          label="슈팅"
          homeValue={homeStats.shots}
          awayValue={awayStats.shots}
          glossaryId="shot"
        />
        <StatRow
          label="유효 슈팅"
          homeValue={homeStats.shotsOnTarget}
          awayValue={awayStats.shotsOnTarget}
          glossaryId="shot-on-target"
        />
        <StatRow
          label="xG"
          homeValue={homeStats.xg}
          awayValue={awayStats.xg}
          format={(v) => v.toFixed(2)}
          glossaryId="xg"
        />
        <StatRow
          label="코너킥"
          homeValue={homeStats.corners}
          awayValue={awayStats.corners}
          glossaryId="corner-kick"
        />
        <StatRow
          label="파울"
          homeValue={homeStats.fouls}
          awayValue={awayStats.fouls}
          glossaryId="foul"
        />
      </CardContent>
    </Card>
  );
}
