// 경기 카드 컴포넌트 — 상태(NS/LIVE/FT)별 UI 분기

import Image from "next/image";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { formatKickoffTime } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import type { Fixture, Team, TeamStanding } from "@/types";

import { FixtureStatusBadge } from "./fixture-status-badge";

interface FixtureCardProps {
  fixture: Fixture;
  homeTeam: Team;
  awayTeam: Team;
  homeStanding?: TeamStanding;
  awayStanding?: TeamStanding;
}

export function FixtureCard({
  fixture,
  homeTeam,
  awayTeam,
  homeStanding,
  awayStanding,
}: FixtureCardProps) {
  const isLive = fixture.status === "LIVE";
  const isFt = fixture.status === "FT";

  const kickoffTime = formatKickoffTime(fixture.date);

  return (
    <Link href={`/matchday/${fixture.id}`} className="block">
      <Card
        className={cn(
          "transition-colors hover:bg-muted/50",
          isLive && "border-green-500/50 bg-green-500/5",
        )}
      >
        <CardContent className="p-4">
          {/* 메인 행: 홈팀 — 스코어/상태 — 어웨이팀 */}
          <div className="flex items-center justify-between gap-4">
            {/* 홈팀 */}
            <div className="flex flex-1 items-center gap-3">
              <Image
                src={homeTeam.logoUrl}
                alt={homeTeam.name}
                width={40}
                height={40}
                className="size-10 object-contain"
              />
              <div>
                <p className="font-semibold">{homeTeam.shortName}</p>
                {homeStanding && (
                  <p className="text-xs text-muted-foreground">
                    {homeStanding.position}위
                  </p>
                )}
              </div>
            </div>

            {/* 스코어 / 배지 */}
            <div className="flex flex-col items-center gap-1.5">
              {fixture.homeScore !== null && fixture.awayScore !== null ? (
                <p className="text-2xl font-bold tabular-nums">
                  {fixture.homeScore} – {fixture.awayScore}
                </p>
              ) : (
                <p className="text-lg font-medium text-muted-foreground">vs</p>
              )}
              <FixtureStatusBadge
                status={fixture.status}
                minute={fixture.minute}
                kickoffTime={kickoffTime}
              />
            </div>

            {/* 어웨이팀 */}
            <div className="flex flex-1 flex-row-reverse items-center gap-3">
              <Image
                src={awayTeam.logoUrl}
                alt={awayTeam.name}
                width={40}
                height={40}
                className="size-10 object-contain"
              />
              <div className="text-right">
                <p className="font-semibold">{awayTeam.shortName}</p>
                {awayStanding && (
                  <p className="text-xs text-muted-foreground">
                    {awayStanding.position}위
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* FT 전용: xG + 점유율 미리보기 */}
          {isFt && fixture.liveStats && (
            <div className="mt-3 border-t pt-3">
              <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
                <span>{fixture.liveStats.home.xg.toFixed(2)}</span>
                <span className="font-medium text-foreground">xG</span>
                <span>{fixture.liveStats.away.xg.toFixed(2)}</span>

                <span>{fixture.liveStats.home.possession}%</span>
                <span className="font-medium text-foreground">점유율</span>
                <span>{fixture.liveStats.away.possession}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
