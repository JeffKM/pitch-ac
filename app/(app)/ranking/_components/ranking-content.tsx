"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TOP5_LEAGUES } from "@/lib/constants/football";
import type { Team, TeamStanding } from "@/types";

import { StandingsTable } from "./standings-table";

type RankingContentProps = {
  standingsMap: Map<number, TeamStanding[]>;
  teamMap: Map<number, Team>;
};

export function RankingContent({ standingsMap, teamMap }: RankingContentProps) {
  return (
    <Tabs defaultValue="epl">
      <TabsList className="w-full justify-start rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-cream">
        {TOP5_LEAGUES.map((league) => (
          <TabsTrigger
            key={league.slug}
            value={league.slug}
            className="font-[family-name:var(--font-bangers)] tracking-[var(--comic-tracking-normal)] data-[state=active]:bg-comic-yellow data-[state=active]:text-comic-black"
          >
            {league.shortName}
          </TabsTrigger>
        ))}
      </TabsList>

      {TOP5_LEAGUES.map((league) => {
        const standings = standingsMap.get(league.id) ?? [];
        return (
          <TabsContent key={league.slug} value={league.slug} className="mt-4">
            {standings.length > 0 ? (
              <StandingsTable
                standings={standings}
                teamMap={teamMap}
                leagueId={league.id}
              />
            ) : (
              <Card className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-cream">
                <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                  <p className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-lg)] text-comic-black">
                    {league.shortName} — No Data
                  </p>
                  <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)] text-comic-black/60">
                    Standings will be available after sync
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
