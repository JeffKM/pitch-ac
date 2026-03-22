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
      <Card className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-white">
        <CardHeader className="pb-2">
          <CardTitle className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-sm)] text-comic-black">
            H2H 전적
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            H2H 데이터가 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  // 통산 전적 계산 (homeTeamId 기준)
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
    <Card className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-white">
      <CardHeader className="pb-2">
        <CardTitle className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-sm)] text-comic-black">
          H2H 전적
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {results.map((result) => {
          // 경기별 팀명 구성
          const homeIsOurHome = result.homeTeamId === homeTeamId;
          const leftName = homeIsOurHome ? homeTeamName : awayTeamName;
          const rightName = homeIsOurHome ? awayTeamName : homeTeamName;
          const formResult = getResult(result, homeTeamId);

          return (
            <div
              key={result.fixtureId}
              className="flex items-center justify-between gap-2 text-sm"
            >
              {/* 날짜 */}
              <span className="w-24 shrink-0 text-xs text-muted-foreground">
                {formatH2HDate(result.date)}
              </span>

              {/* 스코어 */}
              <span className="flex-1 text-center font-medium tabular-nums">
                {leftName} {result.homeScore} – {result.awayScore} {rightName}
              </span>

              {/* 결과 배지 */}
              <TeamFormBadge result={formResult} />
            </div>
          );
        })}

        <Separator className="my-2" />

        {/* 통산 요약 */}
        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
          <span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {wins}승
            </span>{" "}
            ({homeTeamName})
          </span>
          <span className="font-semibold text-yellow-600 dark:text-yellow-400">
            {draws}무
          </span>
          <span>
            <span className="font-semibold text-red-600 dark:text-red-400">
              {losses}패
            </span>{" "}
            ({homeTeamName})
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
