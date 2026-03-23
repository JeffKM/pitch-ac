// 맨시티 스쿼드 페이지 — 맨시티 선수만 표시

import type { Metadata } from "next";

import { getAllPlayers, getAllTeams } from "@/lib/repositories";

import { PlayerSearchPage } from "./_components/player-search-page";

export const metadata: Metadata = {
  title: "Squad",
  description: "Manchester City squad — player profiles and season stats",
};

export default async function SquadPage() {
  const [allPlayers, allTeams] = await Promise.all([
    getAllPlayers(),
    getAllTeams(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-3xl)] leading-[var(--comic-leading-snug)] tracking-[var(--comic-tracking-wide)] text-comic-black">
          Squad
        </h1>
        <p className="mt-1 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)] tracking-[var(--comic-tracking-wide)] text-comic-black/60">
          Manchester City — {allPlayers.length} Players
        </p>
      </div>
      <PlayerSearchPage allPlayers={allPlayers} teams={allTeams} />
    </div>
  );
}
