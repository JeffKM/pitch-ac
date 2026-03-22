// 경기 이벤트 타임라인 — 홈 왼쪽, 어웨이 오른쪽

import { ArrowLeftRight, CircleDot } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FixtureEvent } from "@/types";

import { PlayerNameLink } from "./player-name-link";

interface EventTimelineProps {
  events: FixtureEvent[];
  homeTeamId: number;
}

function EventIcon({ type }: { type: FixtureEvent["type"] }) {
  if (type === "goal") {
    return <CircleDot className="size-4 text-comic-skyblue" />;
  }
  if (type === "substitution") {
    return <ArrowLeftRight className="size-4 text-comic-skyblue" />;
  }
  if (type === "yellow_card") {
    return <div className="size-3.5 rounded-sm bg-comic-yellow" />;
  }
  if (type === "red_card") {
    return <div className="size-3.5 rounded-sm bg-comic-red" />;
  }
  return null;
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
            {event.type === "goal" && event.xg !== undefined && (
              <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/40">
                xG {event.xg.toFixed(2)}
              </p>
            )}
          </div>
          <EventIcon type={event.type} />
        </>
      )}
      {!isHome && (
        <>
          <EventIcon type={event.type} />
          <div>
            <PlayerNameLink
              playerId={event.playerId}
              playerName={event.playerName}
              className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)]"
            />
            {event.type === "goal" && event.xg !== undefined && (
              <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/40">
                xG {event.xg.toFixed(2)}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );

  return content;
}

export function EventTimeline({ events, homeTeamId }: EventTimelineProps) {
  if (events.length === 0) {
    return (
      <Card className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-white">
        <CardHeader className="pb-2">
          <CardTitle className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-sm)] text-comic-black">
            이벤트
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-sm)] text-comic-black/40">
            이벤트가 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  const sorted = [...events].sort((a, b) => a.minute - b.minute);

  return (
    <Card className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-white">
      <CardHeader className="pb-2">
        <CardTitle className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-sm)] text-comic-black">
          이벤트
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sorted.map((event) => {
          const isHome = event.teamId === homeTeamId;
          return (
            <div
              key={`${event.minute}-${event.teamId}-${event.type}-${event.playerId ?? ""}`}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-2"
            >
              {/* 홈팀 이벤트 */}
              <div>{isHome && <EventItem event={event} isHome />}</div>

              {/* 분 표시 */}
              <div className="w-10 text-center font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-xs)] text-comic-black/40">
                {event.minute}&apos;
              </div>

              {/* 어웨이팀 이벤트 */}
              <div>{!isHome && <EventItem event={event} isHome={false} />}</div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
