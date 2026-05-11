// 경기 이벤트 타임라인 — 홈 왼쪽, 어웨이 오른쪽 (goal 이벤트만)

import { CircleDot } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FixtureEvent } from "@/types";

import { PlayerNameLink } from "./player-name-link";

interface EventTimelineProps {
  events: FixtureEvent[];
  homeTeamId: number;
}

interface EventItemProps {
  event: FixtureEvent;
  isHome: boolean;
}

function EventItem({ event, isHome }: EventItemProps) {
  const content = (
    <div
      className={`flex items-center gap-1.5 ${isHome ? "justify-end" : "justify-start"}`}
    >
      {isHome && (
        <>
          <div className="text-right">
            <PlayerNameLink
              playerId={event.playerId}
              playerName={event.playerName}
              className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)]"
            />
          </div>
          <CircleDot className="size-4 text-comic-skyblue" />
        </>
      )}
      {!isHome && (
        <>
          <CircleDot className="size-4 text-comic-skyblue" />
          <div>
            <PlayerNameLink
              playerId={event.playerId}
              playerName={event.playerName}
              className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)]"
            />
          </div>
        </>
      )}
    </div>
  );

  return content;
}

export function EventTimeline({ events, homeTeamId }: EventTimelineProps) {
  // goal 이벤트만 필터
  const goalEvents = events.filter((e) => e.type === "goal");

  if (goalEvents.length === 0) {
    return (
      <Card className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-white">
        <CardHeader className="pb-2">
          <CardTitle className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-sm)] text-comic-black">
            Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)] text-comic-black/40">
            No goals.
          </p>
        </CardContent>
      </Card>
    );
  }

  const sorted = [...goalEvents].sort((a, b) => a.minute - b.minute);

  return (
    <Card className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-white">
      <CardHeader className="pb-2">
        <CardTitle className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-sm)] text-comic-black">
          Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sorted.map((event) => {
          const isHome = event.teamId === homeTeamId;
          return (
            <div
              key={`${event.minute}-${event.teamId}-${event.playerId ?? ""}`}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-2"
            >
              <div>{isHome && <EventItem event={event} isHome />}</div>

              <div className="w-10 text-center font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-xs)] text-comic-black/40">
                {event.minute}&apos;
              </div>

              <div>{!isHome && <EventItem event={event} isHome={false} />}</div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
