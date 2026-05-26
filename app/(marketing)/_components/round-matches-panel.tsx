// 이번 라운드/오늘 경기 통합 패널
// 오늘 경기 있으면 → 오늘 경기 카드, 없으면 → 다음 라운드 미리보기

import Image from "next/image";
import Link from "next/link";

import { COMPETITION_BY_ID } from "@/lib/constants/football";
import { formatKickoffDate } from "@/lib/date-utils";
import type { Fixture, Team } from "@/types";

import { ComicPanel, ComicPanelTitle } from "./comic-panel";
import { MiniFixtureCard } from "./mini-fixture-card";

interface RoundMatchesPanelProps {
  todayFixtures: Fixture[];
  nextRoundFixtures: Fixture[];
  upcomingFixtures: Fixture[];
  teamsMap: Map<number, Team>;
  currentGameweek: number;
}

export function RoundMatchesPanel({
  todayFixtures,
  nextRoundFixtures,
  upcomingFixtures,
  teamsMap,
  currentGameweek,
}: RoundMatchesPanelProps) {
  // 오늘 경기가 있는 경우
  if (todayFixtures.length > 0) {
    const displayFixtures = todayFixtures.slice(0, 6);
    const remaining = todayFixtures.length - displayFixtures.length;

    return (
      <ComicPanel bg="white" className="p-[var(--comic-panel-padding)]">
        <ComicPanelTitle
          title="TODAY'S MATCHES"
          subtitle={`${todayFixtures.length} matches today`}
        />

        <div className="space-y-1.5">
          {displayFixtures.map((fixture) => {
            const homeTeam = teamsMap.get(fixture.homeTeamId);
            const awayTeam = teamsMap.get(fixture.awayTeamId);
            if (!homeTeam || !awayTeam) return null;

            return (
              <MiniFixtureCard
                key={fixture.id}
                fixture={fixture}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
              />
            );
          })}
        </div>

        <div className="mt-2 text-center">
          <Link
            href="/matchday"
            className="inline-block font-[family-name:var(--font-bangers)] text-comic-black/70 underline decoration-comic-black/30 underline-offset-4 transition-colors hover:text-comic-black"
            style={{ fontSize: "var(--comic-text-sm)" }}
          >
            {remaining > 0 ? `+ ${remaining} MORE MATCHES →` : "ALL MATCHES →"}
          </Link>
        </div>
      </ComicPanel>
    );
  }

  // 오늘 경기가 없는 경우 — 다음 라운드 미리보기
  if (nextRoundFixtures.length > 0) {
    const displayFixtures = nextRoundFixtures.slice(0, 6);

    return (
      <ComicPanel bg="white" className="p-[var(--comic-panel-padding)]">
        <ComicPanelTitle
          title="THIS ROUND"
          subtitle={`GW ${currentGameweek} — Coming up`}
        />

        <div className="space-y-1.5">
          {displayFixtures.map((fixture) => {
            const homeTeam = teamsMap.get(fixture.homeTeamId);
            const awayTeam = teamsMap.get(fixture.awayTeamId);

            return (
              <div
                key={fixture.id}
                className="flex items-center gap-2 rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/20 bg-comic-white px-2 py-1.5"
              >
                {/* 홈팀 */}
                <div className="flex flex-1 items-center gap-2">
                  {homeTeam && (
                    <Image
                      src={homeTeam.logoUrl}
                      alt={homeTeam.shortName}
                      width={20}
                      height={20}
                      className="size-5 object-contain"
                    />
                  )}
                  <span
                    className="font-[family-name:var(--font-bangers)] text-comic-black"
                    style={{ fontSize: "var(--comic-text-xs)" }}
                  >
                    {homeTeam?.shortName ?? "TBD"}
                  </span>
                </div>

                {/* vs */}
                <span
                  className="font-[family-name:var(--font-permanent-marker)] text-comic-black/40"
                  style={{ fontSize: "var(--comic-body-xs)" }}
                >
                  vs
                </span>

                {/* 어웨이팀 */}
                <div className="flex flex-1 flex-row-reverse items-center gap-2">
                  {awayTeam && (
                    <Image
                      src={awayTeam.logoUrl}
                      alt={awayTeam.shortName}
                      width={20}
                      height={20}
                      className="size-5 object-contain"
                    />
                  )}
                  <span
                    className="font-[family-name:var(--font-bangers)] text-comic-black"
                    style={{ fontSize: "var(--comic-text-xs)" }}
                  >
                    {awayTeam?.shortName ?? "TBD"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-2 text-center">
          <Link
            href="/matchday"
            className="inline-block font-[family-name:var(--font-bangers)] text-comic-black/70 underline decoration-comic-black/30 underline-offset-4 transition-colors hover:text-comic-black"
            style={{ fontSize: "var(--comic-text-sm)" }}
          >
            SEE MATCHDAY →
          </Link>
        </div>
      </ComicPanel>
    );
  }

  // 리그 시즌 종료 — 다음 예정 경기 (UCL 결승 등)
  if (upcomingFixtures.length > 0) {
    // 대회명 추출 (첫 경기 기준)
    const firstFixture = upcomingFixtures[0];
    const competition = COMPETITION_BY_ID[firstFixture.leagueId];
    const competitionName = competition?.shortName ?? "MATCH";
    const dateLabel = formatKickoffDate(firstFixture.date);

    return (
      <ComicPanel bg="white" className="p-[var(--comic-panel-padding)]">
        <ComicPanelTitle
          title="COMING UP"
          subtitle={`${competitionName} — ${dateLabel}`}
        />

        <div className="space-y-1.5">
          {upcomingFixtures.map((fixture) => {
            const homeTeam = teamsMap.get(fixture.homeTeamId);
            const awayTeam = teamsMap.get(fixture.awayTeamId);
            if (!homeTeam || !awayTeam) return null;

            return (
              <MiniFixtureCard
                key={fixture.id}
                fixture={fixture}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
              />
            );
          })}
        </div>

        <div className="mt-2 text-center">
          <Link
            href="/matchday"
            className="inline-block font-[family-name:var(--font-bangers)] text-comic-black/70 underline decoration-comic-black/30 underline-offset-4 transition-colors hover:text-comic-black"
            style={{ fontSize: "var(--comic-text-sm)" }}
          >
            SEE MATCHDAY →
          </Link>
        </div>
      </ComicPanel>
    );
  }

  // 예정 경기 없음 — 오프시즌 (월드컵 등 차기 대회 예고)
  return (
    <ComicPanel bg="white" className="p-[var(--comic-panel-padding)]">
      <ComicPanelTitle title="OFF-SEASON" subtitle="Season Complete" />
      <div className="py-6 text-center">
        <p
          className="font-[family-name:var(--font-bangers)] text-comic-black"
          style={{ fontSize: "var(--comic-text-lg)" }}
        >
          WORLD CUP 2026
        </p>
        <p
          className="mt-1 font-[family-name:var(--font-permanent-marker)] text-comic-black/50"
          style={{ fontSize: "var(--comic-body-sm)" }}
        >
          is coming soon!
        </p>
        <Link
          href="/matchday"
          className="mt-3 inline-block rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-yellow px-4 py-2 font-[family-name:var(--font-bangers)] text-comic-black transition-transform hover:scale-105"
          style={{ fontSize: "var(--comic-text-sm)" }}
        >
          SEE MATCHDAY →
        </Link>
      </div>
    </ComicPanel>
  );
}
