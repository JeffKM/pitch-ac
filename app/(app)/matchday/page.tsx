import { getFixturesByGameweek } from "@/lib/mock";
import { getTeamById } from "@/lib/mock";

const CURRENT_GAMEWEEK = 28;

export default function MatchdayPage() {
  const fixtures = getFixturesByGameweek(CURRENT_GAMEWEEK);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gameweek {CURRENT_GAMEWEEK}</h1>
      <ul className="space-y-2">
        {fixtures.map((fixture) => {
          const homeTeam = getTeamById(fixture.homeTeamId);
          const awayTeam = getTeamById(fixture.awayTeamId);
          const scoreText =
            fixture.homeScore !== null && fixture.awayScore !== null
              ? `${fixture.homeScore} - ${fixture.awayScore}`
              : "vs";

          return (
            <li key={fixture.id} className="rounded-lg border p-4">
              <span className="font-medium">
                {homeTeam?.name ?? fixture.homeTeamId} {scoreText}{" "}
                {awayTeam?.name ?? fixture.awayTeamId}
              </span>
              <span className="ml-2 text-sm text-muted-foreground">
                [{fixture.status}
                {fixture.minute !== null ? ` ${fixture.minute}'` : ""}]
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
