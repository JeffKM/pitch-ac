"use client";

// 경기 상세 Client Component — TanStack Query 폴링

import { useState } from "react";

import {
  type FixtureDetailData,
  useFixtureDetail,
} from "@/lib/hooks/use-fixture-detail";

import { FixtureTabs } from "./fixture-tabs";
import { MatchHeader } from "./match-header";

type TabValue = "prematch" | "postmatch";

function resolveDefaultTab(status: "NS" | "LIVE" | "FT" | "POSTP"): TabValue {
  if (status === "FT") return "postmatch";
  return "prematch";
}

interface FixtureDetailContentProps {
  initialData: FixtureDetailData;
}

export function FixtureDetailContent({
  initialData,
}: FixtureDetailContentProps) {
  const { data } = useFixtureDetail(initialData.fixture.id, initialData);

  const {
    fixture,
    homeTeam,
    awayTeam,
    homeStanding,
    awayStanding,
    h2hResults,
    homeInjuries,
    awayInjuries,
  } = data;

  const [activeTab, setActiveTab] = useState<TabValue>(
    resolveDefaultTab(initialData.fixture.status),
  );

  return (
    <div className="space-y-4">
      <MatchHeader
        fixture={fixture}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        homeStanding={homeStanding ?? undefined}
        awayStanding={awayStanding ?? undefined}
      />

      <FixtureTabs
        fixture={fixture}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        homeStanding={homeStanding ?? undefined}
        awayStanding={awayStanding ?? undefined}
        h2hResults={h2hResults}
        homeInjuries={homeInjuries}
        awayInjuries={awayInjuries}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
