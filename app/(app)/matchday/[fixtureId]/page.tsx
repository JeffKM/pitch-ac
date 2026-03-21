// 경기 상세 페이지 — 서버에서 초기 데이터 조회 후 Client 폴링으로 전달

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { FixtureDetailData } from "@/app/api/matchday/fixture/route";
import { CURRENT_SEASON_LABEL } from "@/lib/api/sportmonks/constants";
import {
  getFixtureById,
  getInjuriesByTeamId,
  getStandingsByTeamIds,
  getTeamsByIds,
} from "@/lib/repositories";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ fixtureId: string }>;
}): Promise<Metadata> {
  const { fixtureId } = await params;
  const id = Number(fixtureId);
  if (isNaN(id) || id <= 0) return { title: "경기 상세" };

  const fixture = await getFixtureById(id);
  if (!fixture) return { title: "경기를 찾을 수 없습니다" };

  const teamIds = [fixture.homeTeamId, fixture.awayTeamId].filter(Boolean);
  const teamsMap = await getTeamsByIds(teamIds);
  const homeTeam = teamsMap.get(fixture.homeTeamId);
  const awayTeam = teamsMap.get(fixture.awayTeamId);

  if (!homeTeam || !awayTeam) return { title: "경기 상세" };

  const isFinished =
    fixture.status === "FT" &&
    fixture.homeScore !== null &&
    fixture.awayScore !== null;
  const scoreStr = isFinished
    ? ` ${fixture.homeScore}-${fixture.awayScore}`
    : "";
  const title = `${homeTeam.name} vs ${awayTeam.name}${scoreStr}`;
  const description = `GW${fixture.gameweek} — ${homeTeam.name} vs ${awayTeam.name} 경기 상세`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | pitch-ac`,
      description,
    },
  };
}
import { fetchH2HResults } from "@/lib/services/h2h";
import type { H2HResult, InjuredPlayer } from "@/types";

import { FixtureDetailContent } from "./_components/fixture-detail-content";

export default async function FixtureDetailPage({
  params,
}: {
  params: Promise<{ fixtureId: string }>;
}) {
  const { fixtureId } = await params;
  const id = Number(fixtureId);
  if (isNaN(id) || id <= 0) notFound();

  const fixture = await getFixtureById(id);
  if (!fixture) notFound();

  const teamIds = [fixture.homeTeamId, fixture.awayTeamId].filter(Boolean);

  const [teamsMap, standingsMap, h2hResults, homeInjuries, awayInjuries] =
    await Promise.all([
      getTeamsByIds(teamIds),
      getStandingsByTeamIds(teamIds, CURRENT_SEASON_LABEL),
      fetchH2HResults(fixture.homeTeamId, fixture.awayTeamId).catch(
        () => [] as H2HResult[],
      ),
      getInjuriesByTeamId(fixture.homeTeamId).catch(
        () => [] as InjuredPlayer[],
      ),
      getInjuriesByTeamId(fixture.awayTeamId).catch(
        () => [] as InjuredPlayer[],
      ),
    ]);

  const homeTeam = teamsMap.get(fixture.homeTeamId);
  const awayTeam = teamsMap.get(fixture.awayTeamId);

  if (!homeTeam || !awayTeam) notFound();

  const initialData: FixtureDetailData = {
    fixture,
    homeTeam,
    awayTeam,
    homeStanding: standingsMap.get(fixture.homeTeamId) ?? null,
    awayStanding: standingsMap.get(fixture.awayTeamId) ?? null,
    h2hResults,
    homeInjuries,
    awayInjuries,
  };

  return <FixtureDetailContent initialData={initialData} />;
}
