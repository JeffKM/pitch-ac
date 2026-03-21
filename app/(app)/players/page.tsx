import { mockPlayers, mockTeams } from "@/lib/mock";

import { PlayerSearchPage } from "./_components/player-search-page";

export default function PlayersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">선수 검색</h1>
      <PlayerSearchPage allPlayers={mockPlayers} teams={mockTeams} />
    </div>
  );
}
