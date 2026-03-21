"use client";

// 골 알림 toast — sonner를 사용하여 스코어 변경 시 알림 표시

import { toast } from "sonner";

import type { ScoreChange } from "@/lib/hooks/use-score-change";
import type { Team } from "@/types";

/** 골 발생 시 sonner toast 알림을 트리거 */
export function showGoalNotification(
  change: ScoreChange,
  teams: Record<number, Team>,
) {
  const homeTeam = teams[change.homeTeamId];
  const awayTeam = teams[change.awayTeamId];

  if (!homeTeam || !awayTeam) return;

  const scoringTeamName =
    change.scoringTeam === "home" ? homeTeam.shortName : awayTeam.shortName;

  toast(`⚽ ${scoringTeamName} 골!`, {
    description: `${homeTeam.shortName} ${change.newHomeScore} – ${change.newAwayScore} ${awayTeam.shortName}`,
    duration: 5000,
  });
}
