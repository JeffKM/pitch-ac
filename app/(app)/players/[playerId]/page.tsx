import { getPlayerById, getTeamById } from "@/lib/mock";

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ playerId: string }>;
}) {
  const { playerId } = await params;
  const player = getPlayerById(Number(playerId));
  const team = player ? getTeamById(player.teamId) : undefined;

  if (!player) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">선수를 찾을 수 없습니다</h1>
        <p className="text-muted-foreground">선수 ID: {playerId}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{player.name}</h1>
      <p className="text-muted-foreground">
        {team?.name ?? player.teamId} · {player.position} · #{player.number} ·{" "}
        {player.nationality}
      </p>
    </div>
  );
}
