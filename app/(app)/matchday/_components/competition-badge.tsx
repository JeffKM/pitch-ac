// 대회명 배지 — 컵 경기에만 표시 (PL 경기는 표시 안 함)

import { Badge } from "@/components/ui/badge";
import { CUP_LEAGUE_IDS } from "@/lib/api/sportmonks/constants";
import { cn } from "@/lib/utils";

interface CompetitionBadgeProps {
  competitionName: string;
  leagueId: number;
}

/** 대회별 색상 클래스 */
function getCompetitionColorClass(leagueId: number): string {
  switch (leagueId) {
    case CUP_LEAGUE_IDS.UCL:
      return "border-sky-500 bg-sky-500/10 text-sky-700";
    case CUP_LEAGUE_IDS.FA_CUP:
      return "border-comic-red bg-comic-red/10 text-comic-red";
    case CUP_LEAGUE_IDS.EFL_CUP:
      return "border-emerald-500 bg-emerald-500/10 text-emerald-700";
    case CUP_LEAGUE_IDS.COMMUNITY_SHIELD:
      return "border-amber-500 bg-amber-500/10 text-amber-700";
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
