// 경기 헤더 — 양팀 로고/이름, 스코어, 상태 배지, 순위 정보

import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";
import { formatKickoffDate, formatKickoffTime } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import type { Fixture, Team, TeamStanding } from "@/types";

import { FixtureStatusBadge } from "../../_components/fixture-status-badge";
import { ScoreFlash } from "../../_components/score-flash";

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

  const kickoffDate = formatKickoffDate(fixture.date);
  const kickoffTime = formatKickoffTime(fixture.date);

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-white",
        isLive && "border-comic-green bg-comic-green/10",
      )}
    >
      <CardContent className="p-6">
        {/* GW + 날짜 */}
        <div className="mb-4 text-center">
          <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)] text-comic-black/60">
            {fixture.gameweek
              ? `GW${fixture.gameweek}`
              : (fixture.competitionName ?? "Cup")}{" "}
            · {kickoffDate}
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
            <p className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-base)] text-comic-black">
              {homeTeam.name}
            </p>
            {homeStanding && (
              <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/50">
                {homeStanding.position}위 · {homeStanding.points}pts
              </p>
            )}
          </div>

          {/* 스코어 / 상태 */}
          <div className="flex flex-col items-center gap-2">
            {fixture.homeScore !== null && fixture.awayScore !== null ? (
              <p className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-4xl)] text-comic-black tabular-nums">
                <ScoreFlash score={fixture.homeScore}>
                  {fixture.homeScore}
                </ScoreFlash>
                {" – "}
                <ScoreFlash score={fixture.awayScore}>
                  {fixture.awayScore}
                </ScoreFlash>
              </p>
            ) : (
              <p className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-2xl)] text-comic-black/40">
                vs
              </p>
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
            <p className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-base)] text-comic-black">
              {awayTeam.name}
            </p>
            {awayStanding && (
              <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/50">
                {awayStanding.position}위 · {awayStanding.points}pts
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
