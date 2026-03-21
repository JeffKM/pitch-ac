"use client";

// 매치데이 경기 목록 Client Component — TanStack Query 폴링 담당

import {
  type MatchdayData,
  useMatchdayFixtures,
} from "@/lib/hooks/use-matchday-fixtures";

import { groupFixturesByDate } from "../_utils";
import { FixtureCard } from "./fixture-card";
import { FixtureDateGroup } from "./fixture-date-group";

interface MatchdayContentProps {
  initialData: MatchdayData;
}

export function MatchdayContent({ initialData }: MatchdayContentProps) {
  const { data } = useMatchdayFixtures(initialData.gameweek, initialData);

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
