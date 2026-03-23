"use client";

// 경기 상세 Client Component — TanStack Query 폴링 + 상태 전환 감지

import { useEffect, useRef, useState } from "react";

import {
  type FixtureDetailData,
  useFixtureDetail,
} from "@/lib/hooks/use-fixture-detail";

import { FixtureTabs } from "./fixture-tabs";
import { MatchHeader } from "./match-header";

type TabValue = "prematch" | "live" | "postmatch";

function resolveDefaultTab(status: "NS" | "LIVE" | "FT" | "POSTP"): TabValue {
  if (status === "NS" || status === "POSTP") return "prematch";
  if (status === "LIVE") return "live";
  return "postmatch";
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
  const prevStatusRef = useRef(initialData.fixture.status);

  // 경기 상태 전환 감지: NS→LIVE 시 live 탭, LIVE→FT 시 postmatch 탭 자동 전환
  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    const nextStatus = fixture.status;

    if (prevStatus !== nextStatus) {
      if (prevStatus === "NS" && nextStatus === "LIVE") {
        setActiveTab("live");
      } else if (prevStatus === "LIVE" && nextStatus === "FT") {
        setActiveTab("postmatch");
      }
      prevStatusRef.current = nextStatus;
    }
  }, [fixture.status]);

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
