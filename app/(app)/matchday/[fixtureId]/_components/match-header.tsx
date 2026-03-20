// 경기 헤더 — 양팀 로고/이름, 스코어, 상태 배지, 순위 정보

import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Fixture, Team, TeamStanding } from "@/types";

import { FixtureStatusBadge } from "../../_components/fixture-status-badge";

interface MatchHeaderProps {
  fixture: Fixture;
  homeTeam: Team;
  awayTeam: Team;
  homeStanding?: TeamStanding;
  awayStanding?: TeamStanding;
}

export function MatchHeader({
  fixture,
  homeTeam,
  awayTeam,
  homeStanding,
  awayStanding,
}: MatchHeaderProps) {
  const isLive = fixture.status === "LIVE";

  // 킥오프 날짜/시간 포맷 (KST)
  const kickoffDate = new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(fixture.date));

  const kickoffTime = new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(new Date(fixture.date));

  return (
    <Card
      className={cn(
        "overflow-hidden",
        isLive && "border-green-500/50 bg-green-500/5",
      )}
    >
      <CardContent className="p-6">
        {/* GW + 날짜 */}
        <div className="mb-4 text-center">
          <p className="text-sm text-muted-foreground">
            GW{fixture.gameweek} · {kickoffDate}
          </p>
        </div>

        {/* 메인 행: 홈팀 — 스코어 — 어웨이팀 */}
        <div className="flex items-center justify-between gap-4">
          {/* 홈팀 */}
          <div className="flex flex-1 flex-col items-center gap-2 text-center">
            <Image
              src={homeTeam.logoUrl}
              alt={homeTeam.name}
              width={64}
              height={64}
              className="size-16 object-contain"
            />
            <p className="font-semibold">{homeTeam.name}</p>
            {homeStanding && (
              <p className="text-xs text-muted-foreground">
                {homeStanding.position}위 · {homeStanding.points}pts
              </p>
            )}
          </div>

          {/* 스코어 / 상태 */}
          <div className="flex flex-col items-center gap-2">
            {fixture.homeScore !== null && fixture.awayScore !== null ? (
              <p className="text-4xl font-bold tabular-nums">
                {fixture.homeScore} – {fixture.awayScore}
              </p>
            ) : (
              <p className="text-2xl font-medium text-muted-foreground">vs</p>
            )}
            <FixtureStatusBadge
              status={fixture.status}
              minute={fixture.minute}
              kickoffTime={kickoffTime}
            />
          </div>

          {/* 어웨이팀 */}
          <div className="flex flex-1 flex-col items-center gap-2 text-center">
            <Image
              src={awayTeam.logoUrl}
              alt={awayTeam.name}
              width={64}
              height={64}
              className="size-16 object-contain"
            />
            <p className="font-semibold">{awayTeam.name}</p>
            {awayStanding && (
              <p className="text-xs text-muted-foreground">
                {awayStanding.position}위 · {awayStanding.points}pts
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
