// 경기 카드 컴포넌트 — 상태(NS/LIVE/FT)별 UI 분기

import Image from "next/image";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { formatKickoffTime } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import type { Fixture, Team, TeamStanding } from "@/types";

import { FixtureStatusBadge } from "./fixture-status-badge";
import { LivePulse } from "./live-pulse";
import { ScoreFlash } from "./score-flash";

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
          "rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-white transition-colors hover:bg-comic-cream",
          isLive && "border-comic-green bg-comic-green/10",
        )}
        data-live={isLive || undefined}
        data-fixture-id={fixture.id}
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
                <p className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-sm)] text-comic-black">
                  {homeTeam.shortName}
                </p>
                {homeStanding && (
                  <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/50">
                    {homeStanding.position}위
                  </p>
                )}
              </div>
            </div>

            {/* 스코어 / 배지 */}
            <div className="flex flex-col items-center gap-1.5">
              {fixture.homeScore !== null && fixture.awayScore !== null ? (
                <div className="flex items-center gap-1.5">
                  {isLive && <LivePulse />}
                  <p className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-2xl)] text-comic-black tabular-nums">
                    <ScoreFlash score={fixture.homeScore}>
                      {fixture.homeScore}
                    </ScoreFlash>
                    {" – "}
                    <ScoreFlash score={fixture.awayScore}>
                      {fixture.awayScore}
                    </ScoreFlash>
                  </p>
                </div>
              ) : (
                <p className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-lg)] text-comic-black/40">
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
            <div className="flex flex-1 flex-row-reverse items-center gap-3">
              <Image
                src={awayTeam.logoUrl}
                alt={awayTeam.name}
                width={40}
                height={40}
                className="size-10 object-contain"
              />
              <div className="text-right">
                <p className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-sm)] text-comic-black">
                  {awayTeam.shortName}
                </p>
                {awayStanding && (
                  <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/50">
                    {awayStanding.position}위
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* FT 전용: xG + 점유율 미리보기 */}
          {isFt && fixture.liveStats && (
            <div className="mt-3 border-comic-black/20 border-t-[var(--comic-border-thin)] pt-3">
              <div className="grid grid-cols-3 gap-2 text-center font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/50">
                <span>{fixture.liveStats.home.xg?.toFixed(2) ?? "N/A"}</span>
                <span className="font-[family-name:var(--font-bangers)] text-comic-black">
                  xG
                </span>
                <span>{fixture.liveStats.away.xg?.toFixed(2) ?? "N/A"}</span>

                <span>{fixture.liveStats.home.possession}%</span>
                <span className="font-[family-name:var(--font-bangers)] text-comic-black">
                  점유율
                </span>
                <span>{fixture.liveStats.away.possession}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
