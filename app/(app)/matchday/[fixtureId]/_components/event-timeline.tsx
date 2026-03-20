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
    return <CircleDot className="size-4 text-primary" />;
  }
  if (type === "substitution") {
    return <ArrowLeftRight className="size-4 text-blue-500" />;
  }
  if (type === "yellow_card") {
    return <div className="size-3.5 rounded-sm bg-yellow-400" />;
  }
  if (type === "red_card") {
    return <div className="size-3.5 rounded-sm bg-red-500" />;
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
              className="text-sm"
            />
            {event.type === "goal" && event.xg !== undefined && (
              <p className="text-xs text-muted-foreground">
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
              className="text-sm"
            />
            {event.type === "goal" && event.xg !== undefined && (
              <p className="text-xs text-muted-foreground">
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
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">이벤트</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">이벤트가 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  const sorted = [...events].sort((a, b) => a.minute - b.minute);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">이벤트</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sorted.map((event, i) => {
          const isHome = event.teamId === homeTeamId;
          return (
            <div
              key={i}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-2"
            >
              {/* 홈팀 이벤트 */}
              <div>{isHome && <EventItem event={event} isHome />}</div>

              {/* 분 표시 */}
              <div className="w-10 text-center text-xs font-medium text-muted-foreground">
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
