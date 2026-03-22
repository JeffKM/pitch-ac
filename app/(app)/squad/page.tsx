// 맨시티 스쿼드 페이지 — 맨시티 선수만 표시

import type { Metadata } from "next";

import { CURRENT_SEASON_LABEL } from "@/lib/api/sportmonks/constants";
import {
  getAllPlayers,
  getAllTeams,
  getPlayerSeasonStatsByIds,
} from "@/lib/repositories";
import type { PlayerSeasonStats } from "@/types";

import { PlayerSearchPage } from "./_components/player-search-page";

export const metadata: Metadata = {
  title: "스쿼드",
  description: "맨체스터 시티 스쿼드 — 선수 프로필과 시즌 스탯",
};

export default async function SquadPage() {
  const [allPlayers, allTeams] = await Promise.all([
    getAllPlayers(),
    getAllTeams(),
  ]);

  const playerIds = allPlayers.map((p) => p.id);
  const seasonStatsMap = await getPlayerSeasonStatsByIds(
    playerIds,
    CURRENT_SEASON_LABEL,
  );

  const seasonStatsRecord: Record<number, PlayerSeasonStats> =
    Object.fromEntries(seasonStatsMap);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-3xl)] leading-[var(--comic-leading-snug)] tracking-[var(--comic-tracking-wide)] text-comic-black">
          스쿼드
        </h1>
        <p className="mt-1 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)] tracking-[var(--comic-tracking-wide)] text-comic-black/60">
          맨체스터 시티 {allPlayers.length}명의 선수
        </p>
      </div>
      <PlayerSearchPage
        allPlayers={allPlayers}
        teams={allTeams}
        seasonStatsMap={seasonStatsRecord}
      />
    </div>
  );
}
