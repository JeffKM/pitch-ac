"use client";

import { Lock } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Team, TeamStanding } from "@/types";

import { StandingsTable } from "./standings-table";

// 5대 리그 탭 정의
const LEAGUES = [
  { id: "epl", label: "EPL", available: true },
  { id: "laliga", label: "La Liga", available: false },
  { id: "bundesliga", label: "Bundesliga", available: false },
  { id: "seriea", label: "Serie A", available: false },
  { id: "ligue1", label: "Ligue 1", available: false },
] as const;

type RankingContentProps = {
  standings: TeamStanding[];
  teamMap: Map<number, Team>;
};

export function RankingContent({ standings, teamMap }: RankingContentProps) {
  return (
    <Tabs defaultValue="epl">
      <TabsList className="w-full justify-start rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-cream">
        {LEAGUES.map((league) => (
          <TabsTrigger
            key={league.id}
            value={league.id}
            disabled={!league.available}
            className="font-[family-name:var(--font-bangers)] tracking-[var(--comic-tracking-normal)] data-[state=active]:bg-comic-yellow data-[state=active]:text-comic-black"
          >
            {league.label}
            {!league.available && <Lock className="ml-1 size-3" />}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* EPL 순위표 */}
      <TabsContent value="epl" className="mt-4">
        <StandingsTable standings={standings} teamMap={teamMap} />
      </TabsContent>

      {/* 나머지 리그 Coming Soon */}
      {LEAGUES.filter((l) => !l.available).map((league) => (
        <TabsContent key={league.id} value={league.id} className="mt-4">
          <Card className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-cream">
            <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <p className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-lg)] text-comic-black">
                {league.label} — Coming Soon
              </p>
              <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)] text-comic-black/60">
                Data integration in progress
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}
