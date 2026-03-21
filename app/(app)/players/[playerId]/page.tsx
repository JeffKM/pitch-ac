import { notFound } from "next/navigation";

import { PlayerRadarChart } from "@/components/charts/player-radar-chart";
import { CURRENT_SEASON_LABEL } from "@/lib/api/sportmonks/constants";
import {
  getMatchStatsByPlayerId,
  getPlayerById,
  getPlayerSeasonStats,
  getTeamsByIds,
} from "@/lib/repositories";

import { CompareButton } from "./_components/compare-button";
import { PlayerHeaderCard } from "./_components/player-header-card";
import { RecentFormSparkline } from "./_components/recent-form-sparkline";
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
