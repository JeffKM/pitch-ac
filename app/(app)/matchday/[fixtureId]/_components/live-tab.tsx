// 라이브 탭 — 스탯 바, 이벤트 타임라인, 라인업

import type { Fixture, Team } from "@/types";

import { AutoRefreshIndicator } from "./auto-refresh-indicator";
import { EventTimeline } from "./event-timeline";
import { LineupDisplay } from "./lineup-display";
import { StatBar } from "./stat-bar";

interface LiveTabProps {
  fixture: Fixture;
  homeTeam: Team;
  awayTeam: Team;
}

export function LiveTab({ fixture, homeTeam, awayTeam }: LiveTabProps) {
  if (fixture.status === "NS") {
    return (
      <div className="py-12 text-center font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)] text-comic-black/50">
        Match hasn&apos;t started yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AutoRefreshIndicator status={fixture.status} />

      {/* 팀 스탯 비교 */}
      {fixture.liveStats ? (
        <StatBar
          homeStats={fixture.liveStats.home}
          awayStats={fixture.liveStats.away}
          homeTeamName={homeTeam.shortName}
          awayTeamName={awayTeam.shortName}
        />
      ) : (
        <p className="text-center font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)] text-comic-black/50">
          Live stats not yet available.
        </p>
      )}

      {/* 이벤트 타임라인 */}
      <EventTimeline events={fixture.events} homeTeamId={fixture.homeTeamId} />

      {/* 라인업 */}
      {fixture.lineups && (
        <LineupDisplay
          homeLineup={fixture.lineups.home}
          awayLineup={fixture.lineups.away}
          homeTeamName={homeTeam.name}
          awayTeamName={awayTeam.name}
        />
      )}
    </div>
  );
}
