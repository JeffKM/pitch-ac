"use client";

// 폴링 사이클 간 스코어 변경을 감지하는 훅
// 초기 로드(initialData) 시에는 false positive 방지 — 이미 진행 중인 경기의 스코어에 알림 없음

import { useRef } from "react";

import type { Fixture } from "@/types";

/** 스코어 변경이 감지된 경기 정보 */
export interface ScoreChange {
  fixtureId: number;
  homeTeamId: number;
  awayTeamId: number;
  prevHomeScore: number;
  prevAwayScore: number;
  newHomeScore: number;
  newAwayScore: number;
  /** 득점한 팀 */
  scoringTeam: "home" | "away";
}

/** 이전 스코어를 추적하고 변경을 감지하는 훅 */
export function useScoreChangeDetector() {
  const prevScoresRef = useRef<Map<number, { home: number; away: number }>>(
    new Map(),
  );
  // 첫 번째 호출 여부 — initialData 포함 첫 로드 시 알림 방지
  const isInitializedRef = useRef(false);

  function detectChanges(fixtures: Fixture[]): ScoreChange[] {
    const changes: ScoreChange[] = [];
    const prevScores = prevScoresRef.current;

    if (!isInitializedRef.current) {
      // 첫 로드: 현재 스코어만 저장하고 변경 감지는 하지 않음
      for (const f of fixtures) {
        if (f.homeScore !== null && f.awayScore !== null) {
          prevScores.set(f.id, { home: f.homeScore, away: f.awayScore });
        }
      }
      isInitializedRef.current = true;
      return [];
    }

    for (const f of fixtures) {
      if (f.homeScore === null || f.awayScore === null) continue;

      const prev = prevScores.get(f.id);
      if (prev) {
        if (f.homeScore > prev.home) {
          changes.push({
            fixtureId: f.id,
            homeTeamId: f.homeTeamId,
            awayTeamId: f.awayTeamId,
            prevHomeScore: prev.home,
            prevAwayScore: prev.away,
            newHomeScore: f.homeScore,
            newAwayScore: f.awayScore,
            scoringTeam: "home",
          });
        }
        if (f.awayScore > prev.away) {
          changes.push({
            fixtureId: f.id,
            homeTeamId: f.homeTeamId,
            awayTeamId: f.awayTeamId,
            prevHomeScore: prev.home,
            prevAwayScore: prev.away,
            newHomeScore: f.homeScore,
            newAwayScore: f.awayScore,
            scoringTeam: "away",
          });
        }
      }
      // 스코어 갱신 (득점 방향만 추적)
      prevScores.set(f.id, { home: f.homeScore, away: f.awayScore });
    }

    return changes;
  }

  return { detectChanges };
}
