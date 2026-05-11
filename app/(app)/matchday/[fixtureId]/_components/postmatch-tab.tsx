// 포스트매치 탭 — 골 이벤트 타임라인

import type { Fixture, Team } from "@/types";

import { EventTimeline } from "./event-timeline";

interface PostmatchTabProps {
  fixture: Fixture;
  homeTeam: Team;
  awayTeam: Team;
}

export function PostmatchTab({ fixture }: PostmatchTabProps) {
  if (fixture.status !== "FT") {
    return (
      <div className="py-12 text-center font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)] text-comic-black/50">
        Match hasn&apos;t ended yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <EventTimeline events={fixture.events} homeTeamId={fixture.homeTeamId} />
    </div>
  );
}
