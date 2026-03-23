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
  if (homeValue === null || awayValue === null) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)]">
          <span className="text-comic-black/50 tabular-nums">N/A</span>
          <span className="flex items-center gap-0.5 text-[length:var(--comic-body-xs)] text-comic-black/50">
            {label}
            {glossaryId && <GlossaryPopover glossaryId={glossaryId} />}
          </span>
          <span className="text-comic-black/50 tabular-nums">N/A</span>
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
      <div className="flex items-center justify-between font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)]">
        <span className="tabular-nums">{fmt(homeValue)}</span>
        <span className="flex items-center gap-0.5 text-[length:var(--comic-body-xs)] text-comic-black/50">
          {label}
          {glossaryId && <GlossaryPopover glossaryId={glossaryId} />}
        </span>
        <span className="tabular-nums">{fmt(awayValue)}</span>
      </div>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-comic-cream">
        <div
          className={cn(
            "h-full rounded-l-full bg-comic-skyblue transition-all",
            homePercent >= awayPercent && "rounded-r-full",
          )}
          style={{ width: `${homePercent}%` }}
        />
        <div
          className="h-full flex-1 bg-comic-black/30"
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>팀 스탯 비교</CardTitle>
        <div className="flex justify-between font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/50">
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
