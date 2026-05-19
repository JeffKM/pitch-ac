// 홈 화면용 축소 경기 카드

import Image from "next/image";

import { FixtureStatusBadge } from "@/components/football/fixture-status-badge";
import { formatKickoffTime } from "@/lib/date-utils";
import type { Fixture, Team } from "@/types";

interface MiniFixtureCardProps {
  fixture: Fixture;
  homeTeam: Team;
  awayTeam: Team;
}

export function MiniFixtureCard({
  fixture,
  homeTeam,
  awayTeam,
}: MiniFixtureCardProps) {
  const kickoffTime = formatKickoffTime(fixture.date);

  return (
    <div className="flex items-center gap-3 rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/40 bg-comic-white px-3 py-2">
      {/* 홈팀 */}
      <div className="flex flex-1 items-center gap-2">
        <Image
          src={homeTeam.logoUrl}
          alt={homeTeam.shortName}
          width={24}
          height={24}
          className="size-6 object-contain"
        />
        <span
          className="font-[family-name:var(--font-bangers)] text-comic-black"
          style={{ fontSize: "var(--comic-text-xs)" }}
        >
          {homeTeam.shortName}
        </span>
      </div>

      {/* 스코어 / 상태 */}
      <div className="flex flex-col items-center gap-0.5">
        {fixture.homeScore !== null && fixture.awayScore !== null ? (
          <span
            className="font-[family-name:var(--font-bangers)] text-comic-black tabular-nums"
            style={{ fontSize: "var(--comic-text-sm)" }}
          >
            {fixture.homeScore} – {fixture.awayScore}
          </span>
        ) : null}
        <FixtureStatusBadge status={fixture.status} kickoffTime={kickoffTime} />
      </div>

      {/* 어웨이팀 */}
      <div className="flex flex-1 flex-row-reverse items-center gap-2">
        <Image
          src={awayTeam.logoUrl}
          alt={awayTeam.shortName}
          width={24}
          height={24}
          className="size-6 object-contain"
        />
        <span
          className="font-[family-name:var(--font-bangers)] text-comic-black"
          style={{ fontSize: "var(--comic-text-xs)" }}
        >
          {awayTeam.shortName}
        </span>
      </div>
    </div>
  );
}
