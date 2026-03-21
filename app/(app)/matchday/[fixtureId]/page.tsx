// 경기 상세 페이지 — 헤더 + 상태별 탭 (프리매치/라이브/포스트매치)

import { notFound } from "next/navigation";

import {
  getFixtureById,
  getH2HResults,
  getInjuriesByTeamId,
  getStandingByTeamId,
  getTeamById,
} from "@/lib/mock";
import type { FixtureStatus } from "@/types";

import { FixtureTabs } from "./_components/fixture-tabs";
import { MatchHeader } from "./_components/match-header";

function resolveDefaultTab(
  status: FixtureStatus,
): "prematch" | "live" | "postmatch" {
  if (status === "NS") return "prematch";
  if (status === "LIVE") return "live";
  return "postmatch";
}

export default async function FixtureDetailPage({
  params,
}: {
  params: Promise<{ fixtureId: string }>;
}) {
  const { fixtureId } = await params;
  const id = Number(fixtureId);
  if (isNaN(id) || id <= 0) notFound();

  const fixture = getFixtureById(id);

  if (!fixture) notFound();

  const homeTeam = getTeamById(fixture.homeTeamId);
  const awayTeam = getTeamById(fixture.awayTeamId);

  if (!homeTeam || !awayTeam) notFound();

  const homeStanding = getStandingByTeamId(fixture.homeTeamId);
  const awayStanding = getStandingByTeamId(fixture.awayTeamId);
  const h2hResults = getH2HResults(fixture.homeTeamId, fixture.awayTeamId);
  const homeInjuries = getInjuriesByTeamId(fixture.homeTeamId);
  const awayInjuries = getInjuriesByTeamId(fixture.awayTeamId);
  const defaultTab = resolveDefaultTab(fixture.status);

  return (
    <div className="space-y-4">
      <MatchHeader
        fixture={fixture}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        homeStanding={homeStanding}
        awayStanding={awayStanding}
      />

      <FixtureTabs
        fixture={fixture}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        homeStanding={homeStanding}
        awayStanding={awayStanding}
        h2hResults={h2hResults}
        homeInjuries={homeInjuries}
        awayInjuries={awayInjuries}
        defaultTab={defaultTab}
      />
    </div>
  );
}
