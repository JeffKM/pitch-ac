"use client";

// 경기 상세 탭 네비게이션 — 프리매치 / 라이브 / 포스트매치
// activeTab + onTabChange prop으로 외부에서 제어 가능한 컴포넌트

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

type TabValue = "prematch" | "live" | "postmatch";

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
  const isLive = fixture.status === "LIVE";

  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as TabValue)}>
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
