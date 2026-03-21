"use client";

// 매치데이 경기 목록 Client Component — TanStack Query 폴링 + 골 알림

import { useEffect } from "react";

import {
  type MatchdayData,
  useMatchdayFixtures,
} from "@/lib/hooks/use-matchday-fixtures";
import { useScoreChangeDetector } from "@/lib/hooks/use-score-change";

import { groupFixturesByDate } from "../_utils";
import { FixtureCard } from "./fixture-card";
import { FixtureDateGroup } from "./fixture-date-group";
import { showGoalNotification } from "./goal-notification";

interface MatchdayContentProps {
  initialData: MatchdayData;
}

export function MatchdayContent({ initialData }: MatchdayContentProps) {
  const { data } = useMatchdayFixtures(initialData.gameweek, initialData);
  const { detectChanges } = useScoreChangeDetector();

  // 폴링 데이터 변경 시 스코어 변경 감지 → 골 알림 트리거
  useEffect(() => {
    const changes = detectChanges(data.fixtures);
    for (const change of changes) {
      showGoalNotification(change, data.teams);
    }
    // detectChanges는 ref 기반으로 변경되지 않으므로 deps에서 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.fixtures]);

  const dateGroups = groupFixturesByDate(data.fixtures);

  return (
    <>
      {dateGroups.map(({ dateKey, dateLabel, fixtures: groupFixtures }) => (
        <FixtureDateGroup key={dateKey} dateLabel={dateLabel}>
          {groupFixtures.map((fixture) => {
            const homeTeam = data.teams[fixture.homeTeamId];
            const awayTeam = data.teams[fixture.awayTeamId];

            if (!homeTeam || !awayTeam) return null;

            return (
              <FixtureCard
                key={fixture.id}
                fixture={fixture}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
                homeStanding={data.standings[fixture.homeTeamId]}
                awayStanding={data.standings[fixture.awayTeamId]}
              />
            );
          })}
        </FixtureDateGroup>
      ))}
    </>
  );
}
