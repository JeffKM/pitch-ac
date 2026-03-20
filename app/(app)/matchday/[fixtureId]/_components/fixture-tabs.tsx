"use client";

// 경기 상세 탭 네비게이션 — 프리매치 / 라이브 / 포스트매치

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  Fixture,
  H2HResult,
  InjuredPlayer,
  Team,
  TeamStanding,
} from "@/types";

import { LivePulse } from "../../_components/live-pulse";
import { LiveTab } from "./live-tab";
import { PostmatchTab } from "./postmatch-tab";
import { PrematchTab } from "./prematch-tab";

interface FixtureTabsProps {
  fixture: Fixture;
  homeTeam: Team;
  awayTeam: Team;
  homeStanding?: TeamStanding;
  awayStanding?: TeamStanding;
  h2hResults: H2HResult[];
  homeInjuries: InjuredPlayer[];
  awayInjuries: InjuredPlayer[];
  defaultTab: "prematch" | "live" | "postmatch";
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
  defaultTab,
}: FixtureTabsProps) {
  const isLive = fixture.status === "LIVE";

  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList className="w-full">
        <TabsTrigger value="prematch" className="flex-1">
          프리매치
        </TabsTrigger>
        <TabsTrigger value="live" className="flex-1 gap-1.5">
          {isLive && <LivePulse />}
          라이브
        </TabsTrigger>
        <TabsTrigger value="postmatch" className="flex-1">
          포스트매치
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

      <TabsContent value="live" className="mt-4">
        <LiveTab fixture={fixture} homeTeam={homeTeam} awayTeam={awayTeam} />
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
