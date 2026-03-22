import type { Player, PlayerSeasonStats } from "@/types/player";
import type { Team } from "@/types/team";

import { PlayerCard } from "./player-card";

interface PlayerCardGridProps {
  players: Player[];
  teams: Team[];
  seasonStatsMap: Record<number, PlayerSeasonStats>;
}

export function PlayerCardGrid({
  players,
  teams,
  seasonStatsMap,
}: PlayerCardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {players.map((player) => {
        const team = teams.find((t) => t.id === player.teamId);
        const seasonStats = seasonStatsMap[player.id];
        return (
          <PlayerCard
            key={player.id}
            player={player}
            team={team}
            seasonStats={seasonStats}
          />
        );
      })}
    </div>
  );
}
