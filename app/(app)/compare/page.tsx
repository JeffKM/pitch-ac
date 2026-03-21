import { Suspense } from "react";

import { PlayerRadarChart } from "@/components/charts/player-radar-chart";
import { getPlayerById, getPlayerSeasonStats } from "@/lib/mock";

interface CompareContentProps {
  searchParams: Promise<{ p1?: string; p2?: string }>;
}

async function CompareContent({ searchParams }: CompareContentProps) {
  const { p1, p2 } = await searchParams;

  const player1Id = p1 ? Number(p1) : undefined;
  const player2Id = p2 ? Number(p2) : undefined;

  const player1 = player1Id ? getPlayerById(player1Id) : undefined;
  const player2 = player2Id ? getPlayerById(player2Id) : undefined;
  const stats1 = player1Id ? getPlayerSeasonStats(player1Id) : undefined;
  const stats2 = player2Id ? getPlayerSeasonStats(player2Id) : undefined;

  const canCompare = player1 && player2 && stats1 && stats2;

  if (!canCompare) {
    return (
      <p className="text-muted-foreground">
        두 선수를 선택하면 능력치 비교 차트가 표시됩니다.
      </p>
    );
  }

  return (
    <PlayerRadarChart
      mode="compare"
      player1={{ name: player1.name, data: stats1.radarData.player }}
      player2={{ name: player2.name, data: stats2.radarData.player }}
    />
  );
}

export default function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ p1?: string; p2?: string }>;
}) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">선수 비교</h1>
      <Suspense fallback={<p className="text-muted-foreground">로딩 중...</p>}>
        <CompareContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
