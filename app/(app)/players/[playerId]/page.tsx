import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CURRENT_SEASON_LABEL } from "@/lib/api/sportmonks/constants";
import {
  getMatchStatsByPlayerId,
  getPlayerById,
  getPlayerSeasonStats,
  getTeamsByIds,
} from "@/lib/repositories";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ playerId: string }>;
}): Promise<Metadata> {
  const { playerId } = await params;
  const id = Number(playerId);
  if (isNaN(id) || id <= 0) return { title: "선수 프로필" };

  const player = await getPlayerById(id);
  if (!player) return { title: "선수를 찾을 수 없습니다" };

  const [teamsMap, seasonStats] = await Promise.all([
    getTeamsByIds([player.teamId]),
    getPlayerSeasonStats(id, CURRENT_SEASON_LABEL),
  ]);
  const team = teamsMap.get(player.teamId);

  const title = `${player.name} 프로필`;
  const description = team
    ? `${team.name} ${player.position}${seasonStats ? ` — ${seasonStats.goals}골 ${seasonStats.assists}도움` : ""}`
    : `${player.name} 프리미어리그 시즌 스탯`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | pitch-ac`,
      description,
      ...(player.photoUrl && { images: [{ url: player.photoUrl }] }),
    },
    twitter: {
      card: "summary",
      title: `${title} | pitch-ac`,
      description,
    },
  };
}

import { CompareButton } from "./_components/compare-button";
import {
  PlayerRadarChart,
  RecentFormSparkline,
} from "./_components/player-charts";
import { PlayerHeaderCard } from "./_components/player-header-card";
import { StatContextGrid } from "./_components/stat-context-grid";

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;
  const id = Number(playerId);
  if (isNaN(id) || id <= 0) notFound();

  const player = await getPlayerById(id);
  if (!player) notFound();

  const [teamsMap, seasonStats, matchStats] = await Promise.all([
    getTeamsByIds([player.teamId]),
    getPlayerSeasonStats(id, CURRENT_SEASON_LABEL),
    getMatchStatsByPlayerId(id),
  ]);

  const team = teamsMap.get(player.teamId);
  if (!team) notFound();

  return (
    <div className="space-y-6">
      <PlayerHeaderCard
        player={player}
        team={team}
        seasonStats={seasonStats ?? undefined}
      />

      {seasonStats && <StatContextGrid seasonStats={seasonStats} />}

      {seasonStats && (
        <PlayerRadarChart
          mode="profile"
          radarData={seasonStats.radarData}
          playerName={player.name}
        />
      )}

      {matchStats.length > 0 && <RecentFormSparkline matchStats={matchStats} />}

      <CompareButton playerId={id} />
    </div>
  );
}
