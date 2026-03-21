import { CURRENT_SEASON_LABEL } from "@/lib/api/sportmonks/constants";
import {
  getAllPlayers,
  getAllTeams,
  getPlayerSeasonStatsByIds,
} from "@/lib/repositories";
import type { PlayerSeasonStats } from "@/types";

import { PlayerSearchPage } from "./_components/player-search-page";

export default async function PlayersPage() {
  const [allPlayers, allTeams] = await Promise.all([
    getAllPlayers(),
    getAllTeams(),
  ]);

  const playerIds = allPlayers.map((p) => p.id);
  const seasonStatsMap = await getPlayerSeasonStatsByIds(
    playerIds,
    CURRENT_SEASON_LABEL,
  );

  // Map은 Client Component로 직렬화 불가 → plain object로 변환
  const seasonStatsRecord: Record<number, PlayerSeasonStats> =
    Object.fromEntries(seasonStatsMap);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">선수 검색</h1>
      <PlayerSearchPage
        allPlayers={allPlayers}
        teams={allTeams}
        seasonStatsMap={seasonStatsRecord}
      />
    </div>
  );
}
