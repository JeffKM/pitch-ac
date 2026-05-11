// 대회명 배지 — 리그별 색상 구분 표시

import { Badge } from "@/components/ui/badge";
import { TOP5_LEAGUES } from "@/lib/constants/football";
import { cn } from "@/lib/utils";

interface CompetitionBadgeProps {
  competitionName: string;
  leagueId: number;
}

/** 대회별 색상 클래스 */
function getCompetitionColorClass(leagueId: number): string {
  const league = TOP5_LEAGUES.find((l) => l.id === leagueId);
  if (!league) {
    return "border-comic-black/30 bg-comic-cream text-comic-black/70";
  }
  // 리그 코드 기반 색상
  switch (league.code) {
    case "PL":
      return "border-purple-500 bg-purple-500/10 text-purple-700";
    case "PD":
      return "border-orange-500 bg-orange-500/10 text-orange-700";
    case "SA":
      return "border-sky-500 bg-sky-500/10 text-sky-700";
    case "BL1":
      return "border-comic-red bg-comic-red/10 text-comic-red";
    case "FL1":
      return "border-emerald-500 bg-emerald-500/10 text-emerald-700";
    default:
      return "border-comic-black/30 bg-comic-cream text-comic-black/70";
  }
}

export function CompetitionBadge({
  competitionName,
  leagueId,
}: CompetitionBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)]",
        getCompetitionColorClass(leagueId),
      )}
    >
      {competitionName}
    </Badge>
  );
}
