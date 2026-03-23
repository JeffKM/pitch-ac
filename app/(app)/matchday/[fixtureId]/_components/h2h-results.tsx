// H2H(맞대결) 최근 전적 카드

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatH2HDate } from "@/lib/date-utils";
import type { H2HResult } from "@/types";

import { TeamFormBadge } from "./team-form-badge";

interface H2HResultsProps {
  results: H2HResult[];
  homeTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
}

function getResult(
  result: H2HResult,
  perspectiveTeamId: number,
): "W" | "D" | "L" {
  const isHome = result.homeTeamId === perspectiveTeamId;
  const scored = isHome ? result.homeScore : result.awayScore;
  const conceded = isHome ? result.awayScore : result.homeScore;
  if (scored > conceded) return "W";
  if (scored === conceded) return "D";
  return "L";
}

export function H2HResults({
  results,
  homeTeamId,
  homeTeamName,
  awayTeamName,
}: H2HResultsProps) {
  if (results.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>H2H Records</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)] text-comic-black/50">
            No H2H data available.
          </p>
        </CardContent>
      </Card>
    );
  }

  let wins = 0,
    draws = 0,
    losses = 0;
  for (const r of results) {
    const result = getResult(r, homeTeamId);
    if (result === "W") wins++;
    else if (result === "D") draws++;
    else losses++;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>H2H Records</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {results.map((result) => {
          const homeIsOurHome = result.homeTeamId === homeTeamId;
          const leftName = homeIsOurHome ? homeTeamName : awayTeamName;
          const rightName = homeIsOurHome ? awayTeamName : homeTeamName;
          const formResult = getResult(result, homeTeamId);

          return (
            <div
              key={result.fixtureId}
              className="flex items-center justify-between gap-2 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)]"
            >
              <span className="w-24 shrink-0 text-[length:var(--comic-body-xs)] text-comic-black/50">
                {formatH2HDate(result.date)}
              </span>

              <span className="flex-1 text-center tabular-nums">
                {leftName} {result.homeScore} – {result.awayScore} {rightName}
              </span>

              <TeamFormBadge result={formResult} />
            </div>
          );
        })}

        <Separator className="my-2" />

        <div className="flex justify-center gap-4 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/50">
          <span>
            <span className="text-comic-green">{wins}W</span> ({homeTeamName})
          </span>
          <span className="text-comic-yellow">{draws}D</span>
          <span>
            <span className="text-comic-red">{losses}L</span> ({homeTeamName})
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
