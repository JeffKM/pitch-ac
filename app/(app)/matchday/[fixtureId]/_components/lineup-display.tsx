// 포메이션 라인업 시각화 — 초록 피치 배경, 그리드 기반 선수 배치

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Lineup, LineupPlayer } from "@/types";

import { LineupPlayerDot } from "./lineup-player-dot";

interface LineupDisplayProps {
  homeLineup: Lineup;
  awayLineup: Lineup;
  homeTeamName: string;
  awayTeamName: string;
}

/**
 * 그리드 문자열 파싱
 * "row:col" 형식 → { row, col }
 */
function parseGrid(grid: string): { row: number; col: number } {
  const [row, col] = grid.split(":").map(Number);
  return { row, col };
}

/**
 * startXI를 행별로 그룹핑
 */
function groupByRow(players: LineupPlayer[]): Map<number, LineupPlayer[]> {
  const map = new Map<number, LineupPlayer[]>();
  for (const player of players) {
    if (!player.grid) continue;
    const { row } = parseGrid(player.grid);
    if (!map.has(row)) map.set(row, []);
    map.get(row)!.push(player);
  }
  // 각 행 내 col 순 정렬
  for (const row of map.values()) {
    row.sort((a, b) => {
      const aCol = a.grid ? parseGrid(a.grid).col : 0;
      const bCol = b.grid ? parseGrid(b.grid).col : 0;
      return bCol - aCol; // 왼쪽→오른쪽: col 내림차순
    });
  }
  return map;
}

function PitchLineup({
  lineup,
  teamName,
}: {
  lineup: Lineup;
  teamName: string;
}) {
  const rowMap = groupByRow(lineup.startXI);
  const rows = Array.from(rowMap.keys()).sort((a, b) => a - b);

  return (
    <div className="space-y-2">
      <p className="text-center text-sm font-medium">{teamName}</p>
      <p className="text-center text-xs text-muted-foreground">
        {lineup.formation}
      </p>

      {/* 피치 */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gradient-to-b from-green-600 to-green-700">
        {/* 피치 라인 */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/20" />
        <div className="absolute top-1/2 right-1/4 left-1/4 aspect-[4/3] -translate-y-1/2 rounded-full border border-white/20" />

        {/* 선수 배치 — 행별로 균등 분배 */}
        <div className="absolute inset-0 flex flex-col justify-around p-2">
          {rows.map((rowNum) => {
            const playersInRow = rowMap.get(rowNum) ?? [];
            return (
              <div key={rowNum} className="flex items-center justify-around">
                {playersInRow.map((player) => (
                  <LineupPlayerDot key={player.playerId} player={player} />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* 교체 선수 */}
      {lineup.substitutes.length > 0 && (
        <div>
          <p className="mb-1 text-xs text-muted-foreground">교체 선수</p>
          <ul className="space-y-0.5">
            {lineup.substitutes.map((sub) => (
              <li key={sub.playerId} className="flex gap-2 text-xs">
                <span className="w-5 text-right text-muted-foreground">
                  {sub.number}
                </span>
                <span>{sub.playerName}</span>
                <span className="text-muted-foreground">{sub.position}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function LineupDisplay({
  homeLineup,
  awayLineup,
  homeTeamName,
  awayTeamName,
}: LineupDisplayProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">라인업</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <PitchLineup lineup={homeLineup} teamName={homeTeamName} />
          <PitchLineup lineup={awayLineup} teamName={awayTeamName} />
        </div>
      </CardContent>
    </Card>
  );
}
