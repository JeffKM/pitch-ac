import { mockPlayers } from "@/lib/mock";
import { getTeamById } from "@/lib/mock";

export default function PlayersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">선수 검색</h1>
      <ul className="space-y-2">
        {mockPlayers.map((player) => {
          const team = getTeamById(player.teamId);
          return (
            <li key={player.id} className="rounded-lg border p-4">
              <span className="font-medium">{player.name}</span>
              <span className="ml-2 text-sm text-muted-foreground">
                {team?.shortName ?? player.teamId} · {player.position} ·{" "}
                {player.nationality}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
