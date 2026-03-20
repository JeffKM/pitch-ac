// 프리매치 탭 — 폼, H2H, 부상자, 순위 시뮬레이터

import type { H2HResult, InjuredPlayer, TeamStanding } from "@/types";

import { H2HResults } from "./h2h-results";
import { InjuryList } from "./injury-list";
import { StandingSimulator } from "./standing-simulator";
import { TeamFormRow } from "./team-form-row";

interface PrematchTabProps {
  homeTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
  homeStanding?: TeamStanding;
  awayStanding?: TeamStanding;
  h2hResults: H2HResult[];
  homeInjuries: InjuredPlayer[];
  awayInjuries: InjuredPlayer[];
}

export function PrematchTab({
  homeTeamId,
  homeTeamName,
  awayTeamName,
  homeStanding,
  awayStanding,
  h2hResults,
  homeInjuries,
  awayInjuries,
}: PrematchTabProps) {
  return (
    <div className="space-y-4">
      {/* 최근 폼 */}
      <TeamFormRow
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        homeForm={homeStanding?.form ?? []}
        awayForm={awayStanding?.form ?? []}
      />

      {/* H2H 전적 */}
      <H2HResults
        results={h2hResults}
        homeTeamId={homeTeamId}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
      />

      {/* 부상/결장 */}
      <InjuryList
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        homeInjuries={homeInjuries}
        awayInjuries={awayInjuries}
      />

      {/* 순위 시뮬레이터 */}
      {homeStanding && awayStanding && (
        <StandingSimulator
          homeTeamName={homeTeamName}
          awayTeamName={awayTeamName}
          homeStanding={homeStanding}
          awayStanding={awayStanding}
        />
      )}
    </div>
  );
}
