"use client";

// 매치데이 경기 목록 Client Component — TanStack Query 데이터 폴링

import {
  type MatchdayData,
  useMatchdayFixtures,
} from "@/lib/hooks/use-matchday-fixtures";

import { groupFixturesByLeague } from "../_utils";
import { FixtureCard } from "./fixture-card";
import { LeagueFixtureGroup } from "./league-fixture-group";

interface MatchdayContentProps {
  initialData: MatchdayData;
}

export function MatchdayContent({ initialData }: MatchdayContentProps) {
  const { data } = useMatchdayFixtures(initialData.date, initialData);

  const leagueGroups = groupFixturesByLeague(data.fixtures);

  return (
    <>
      {leagueGroups.map(({ league, fixtures: groupFixtures }) => (
        <LeagueFixtureGroup
          key={league.id}
          shortName={league.shortName}
          country={league.country}
        >
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
        </LeagueFixtureGroup>
      ))}
    </>
  );
}
