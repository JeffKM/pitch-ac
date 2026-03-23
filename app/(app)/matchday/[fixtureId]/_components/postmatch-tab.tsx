// 포스트매치 탭 — 최종 스탯 비교 + 이벤트 요약

import type { Fixture, Team } from "@/types";

import { EventTimeline } from "./event-timeline";
import { StatBar } from "./stat-bar";

interface PostmatchTabProps {
  fixture: Fixture;
  homeTeam: Team;
  awayTeam: Team;
}

export function PostmatchTab({
  fixture,
  homeTeam,
  awayTeam,
}: PostmatchTabProps) {
  if (fixture.status !== "FT") {
    return (
      <div className="py-12 text-center font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)] text-comic-black/50">
        Match hasn&apos;t ended yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 최종 스탯 비교 */}
      {fixture.liveStats ? (
        <StatBar
          homeStats={fixture.liveStats.home}
          awayStats={fixture.liveStats.away}
          homeTeamName={homeTeam.shortName}
          awayTeamName={awayTeam.shortName}
        />
      ) : (
        <p className="text-center font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)] text-comic-black/50">
          No match stats available.
        </p>
      )}

      {/* 전체 이벤트 요약 */}
      <EventTimeline events={fixture.events} homeTeamId={fixture.homeTeamId} />
    </div>
  );
}
