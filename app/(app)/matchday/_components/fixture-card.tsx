// 경기 카드 컴포넌트 — 상태(NS/FT/POSTP)별 UI 분기

import Image from "next/image";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { formatKickoffTime } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import type { Fixture, Team, TeamStanding } from "@/types";

import { CompetitionBadge } from "./competition-badge";
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
  const isPostp = fixture.status === "POSTP";

  const kickoffTime = formatKickoffTime(fixture.date);

  const cardContent = (
    <Card
      className={cn(
        "rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-white transition-colors hover:bg-comic-cream",
        isPostp && "border-comic-red/50 opacity-60",
      )}
      data-fixture-id={fixture.id}
    >
      <CardContent className="p-[var(--comic-panel-padding)]">
        {/* 대회 배지 (컵 경기만) */}
        {fixture.competitionName && (
          <div className="mb-2">
            <CompetitionBadge
              competitionName={fixture.competitionName}
              leagueId={fixture.leagueId}
            />
          </div>
        )}
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
                  #{homeStanding.position}
                </p>
              )}
            </div>
          </div>

          {/* 스코어 / 배지 */}
          <div className="flex flex-col items-center gap-1.5">
            {fixture.homeScore !== null && fixture.awayScore !== null ? (
              <p className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-2xl)] text-comic-black tabular-nums">
                {fixture.homeScore} – {fixture.awayScore}
              </p>
            ) : (
              <p className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-lg)] text-comic-black/40">
                vs
              </p>
            )}
            <FixtureStatusBadge
              status={fixture.status}
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
                  #{awayStanding.position}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // POSTP 경기는 클릭 비활성화
  if (isPostp) {
    return <div className="cursor-not-allowed">{cardContent}</div>;
  }

  return (
    <Link href={`/matchday/${fixture.id}`} className="block">
      {cardContent}
    </Link>
  );
}
