import { notFound } from "next/navigation";

import {
  getMatchStatsByPlayer,
  getPlayerById,
  getPlayerSeasonStats,
  getTeamById,
} from "@/lib/mock";

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

  const player = getPlayerById(id);
  if (!player) notFound();

  const team = getTeamById(player.teamId);
  if (!team) notFound();

  const seasonStats = getPlayerSeasonStats(id);
  const matchStats = getMatchStatsByPlayer(id);

  return (
    <div className="space-y-6">
      <PlayerHeaderCard player={player} team={team} seasonStats={seasonStats} />

      {seasonStats && <StatContextGrid seasonStats={seasonStats} />}

      {matchStats.length > 0 && <RecentFormSparkline matchStats={matchStats} />}

      <CompareButton playerId={id} />
    </div>
  );
}
