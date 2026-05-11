"use client";

// 경기 상세 탭 네비게이션 — Pre-match / Post-match 2탭 구성

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  Fixture,
  H2HResult,
  InjuredPlayer,
  Team,
  TeamStanding,
} from "@/types";

import { PostmatchTab } from "./postmatch-tab";
import { PrematchTab } from "./prematch-tab";

type TabValue = "prematch" | "postmatch";

interface FixtureTabsProps {
  fixture: Fixture;
  homeTeam: Team;
  awayTeam: Team;
  homeStanding?: TeamStanding;
  awayStanding?: TeamStanding;
  h2hResults: H2HResult[];
  homeInjuries: InjuredPlayer[];
  awayInjuries: InjuredPlayer[];
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
}

export function FixtureTabs({
  fixture,
  homeTeam,
  awayTeam,
  homeStanding,
  awayStanding,
  h2hResults,
  homeInjuries,
  awayInjuries,
  activeTab,
  onTabChange,
}: FixtureTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as TabValue)}>
      <TabsList className="w-full rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-cream">
        <TabsTrigger
          value="prematch"
          className="flex-1 rounded-[var(--comic-panel-radius)] font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-sm)] tracking-[var(--comic-tracking-normal)] data-[state=active]:bg-comic-yellow data-[state=active]:text-comic-black"
        >
          Pre-match
        </TabsTrigger>
        <TabsTrigger
          value="postmatch"
          className="flex-1 rounded-[var(--comic-panel-radius)] font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-sm)] tracking-[var(--comic-tracking-normal)] data-[state=active]:bg-comic-yellow data-[state=active]:text-comic-black"
        >
          Post-match
        </TabsTrigger>
      </TabsList>

      <TabsContent value="prematch" className="mt-4">
        <PrematchTab
          homeTeamId={fixture.homeTeamId}
          homeTeamName={homeTeam.name}
          awayTeamName={awayTeam.name}
          homeStanding={homeStanding}
          awayStanding={awayStanding}
          h2hResults={h2hResults}
          homeInjuries={homeInjuries}
          awayInjuries={awayInjuries}
        />
      </TabsContent>

      <TabsContent value="postmatch" className="mt-4">
        <PostmatchTab
          fixture={fixture}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
        />
      </TabsContent>
    </Tabs>
  );
}
