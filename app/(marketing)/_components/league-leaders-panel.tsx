// 5대 리그 각 1위 팀 표시 패널

import Image from "next/image";
import Link from "next/link";

import { LEAGUE_BY_ID, TOP5_LEAGUES } from "@/lib/constants/football";
import type { Team, TeamStanding } from "@/types";

import { ComicPanel, ComicPanelTitle } from "./comic-panel";

interface LeagueLeadersPanelProps {
  standingsMap: Map<number, TeamStanding[]>;
  teamsMap: Map<number, Team>;
}

export function LeagueLeadersPanel({
  standingsMap,
  teamsMap,
}: LeagueLeadersPanelProps) {
  // 각 리그의 1위 팀 추출
  const leaders = TOP5_LEAGUES.map((league) => {
    const standings = standingsMap.get(league.id);
    const leader = standings?.[0]; // position 오름차순이므로 첫 번째가 1위
    const team = leader ? teamsMap.get(leader.teamId) : undefined;
    return { league, leader, team };
  });

  const hasData = leaders.some((l) => l.leader && l.team);

  if (!hasData) {
    return (
      <ComicPanel bg="cream" className="p-[var(--comic-panel-padding)]">
        <ComicPanelTitle title="LEAGUE LEADERS" />
        <p
          className="py-6 text-center font-[family-name:var(--font-bangers)] text-comic-black/40"
          style={{ fontSize: "var(--comic-text-base)" }}
        >
          STANDINGS COMING SOON
        </p>
      </ComicPanel>
    );
  }

  return (
    <ComicPanel bg="cream" className="p-[var(--comic-panel-padding)]">
      <ComicPanelTitle title="LEAGUE LEADERS" subtitle="TOP OF THE TABLE" />

      <div className="space-y-2">
        {leaders.map(({ league, leader, team }) => {
          if (!leader || !team) return null;

          const leagueConfig = LEAGUE_BY_ID[league.id];

          return (
            <Link
              key={league.id}
              href={`/ranking?league=${leagueConfig?.slug ?? "epl"}`}
              className="flex items-center gap-3 rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/30 bg-comic-white px-3 py-2 transition-colors hover:bg-comic-cream"
            >
              {/* 리그 축약명 */}
              <span
                className="w-12 shrink-0 font-[family-name:var(--font-permanent-marker)] text-comic-black/50"
                style={{ fontSize: "var(--comic-body-xs)" }}
              >
                {league.shortName}
              </span>

              {/* 팀 로고 + 이름 */}
              <Image
                src={team.logoUrl}
                alt={team.name}
                width={24}
                height={24}
                className="size-6 object-contain"
              />
              <span
                className="flex-1 font-[family-name:var(--font-bangers)] text-comic-black"
                style={{ fontSize: "var(--comic-text-xs)" }}
              >
                {team.shortName}
              </span>

              {/* 승점 */}
              <span
                className="font-[family-name:var(--font-bangers)] text-comic-black"
                style={{ fontSize: "var(--comic-text-sm)" }}
              >
                {leader.points}
                <span className="text-comic-black/50"> pts</span>
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-3 text-center">
        <Link
          href="/ranking"
          className="inline-block font-[family-name:var(--font-bangers)] text-comic-black/70 underline decoration-comic-black/30 underline-offset-4 transition-colors hover:text-comic-black"
          style={{ fontSize: "var(--comic-text-sm)" }}
        >
          FULL STANDINGS →
        </Link>
      </div>
    </ComicPanel>
  );
}
