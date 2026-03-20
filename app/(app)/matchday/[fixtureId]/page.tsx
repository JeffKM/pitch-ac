import { getFixtureById, getTeamById } from "@/lib/mock";

export default async function FixtureDetailPage({
  params,
}: {
  params: Promise<{ fixtureId: string }>;
}) {
  const { fixtureId } = await params;
  const fixture = getFixtureById(Number(fixtureId));

  if (!fixture) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">경기를 찾을 수 없습니다</h1>
        <p className="text-muted-foreground">경기 ID: {fixtureId}</p>
      </div>
    );
  }

  const homeTeam = getTeamById(fixture.homeTeamId);
  const awayTeam = getTeamById(fixture.awayTeamId);
  const scoreText =
    fixture.homeScore !== null && fixture.awayScore !== null
      ? `${fixture.homeScore} - ${fixture.awayScore}`
      : "vs";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        {homeTeam?.name ?? fixture.homeTeamId} {scoreText}{" "}
        {awayTeam?.name ?? fixture.awayTeamId}
      </h1>
      <p className="text-muted-foreground">
        GW{fixture.gameweek} · {fixture.status}
        {fixture.minute !== null ? ` ${fixture.minute}'` : ""}
      </p>
    </div>
  );
}
