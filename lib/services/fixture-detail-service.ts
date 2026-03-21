// Fixture 상세 데이터 조립 서비스 — page.tsx와 API route 공통 로직
import "server-only";

import { CURRENT_SEASON_LABEL } from "@/lib/api/sportmonks/constants";
import {
  getInjuriesByTeamId,
  getStandingsByTeamIds,
  getTeamsByIds,
} from "@/lib/repositories";
import { fetchH2HResults } from "@/lib/services/h2h";
import type {
  Fixture,
  FixtureDetailData,
  H2HResult,
  InjuredPlayer,
} from "@/types";

/** Fixture 객체로부터 팀/순위/H2H/부상자를 병렬 조회하여 FixtureDetailData 조립 */
export async function assembleFixtureDetail(
  fixture: Fixture,
): Promise<FixtureDetailData | null> {
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

  if (!homeTeam || !awayTeam) return null;

  return {
    fixture,
    homeTeam,
    awayTeam,
    homeStanding: standingsMap.get(fixture.homeTeamId) ?? null,
    awayStanding: standingsMap.get(fixture.awayTeamId) ?? null,
    h2hResults,
    homeInjuries,
    awayInjuries,
  };
}
