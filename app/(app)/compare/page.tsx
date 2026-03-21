import { Suspense } from "react";

import { CURRENT_SEASON_LABEL } from "@/lib/api/sportmonks/constants";
import {
  getAllPlayers,
  getAllTeams,
  getPlayerById,
  getPlayerSeasonStats,
  getPlayerSeasonStatsByIds,
} from "@/lib/repositories";
import type { PlayerSeasonStats } from "@/types";

import { CompareClient } from "./_components/compare-client";

// searchParams를 Suspense 내부에서 await해야 블로킹 없이 스트리밍 가능
async function CompareContent({
  searchParams,
}: {
  searchParams: Promise<{ p1?: string; p2?: string }>;
}) {
  const { p1, p2 } = await searchParams;

  // 1. 전체 선수/팀 + 시즌 스탯 배치 조회 (검색 드롭다운용)
  const [allPlayers, allTeams] = await Promise.all([
    getAllPlayers(),
    getAllTeams(),
  ]);

  const playerIds = allPlayers.map((p) => p.id);
  const seasonStatsMap = await getPlayerSeasonStatsByIds(
    playerIds,
    CURRENT_SEASON_LABEL,
  );
  const seasonStatsRecord: Record<number, PlayerSeasonStats> =
    Object.fromEntries(seasonStatsMap);

  // 2. URL 파라미터로 초기 선수 로드
  const player1Id = p1 ? Number(p1) : undefined;
  const player2Id = p2 ? Number(p2) : undefined;

  const [initialPlayer1, initialPlayer2] = await Promise.all([
    player1Id ? getPlayerById(player1Id) : Promise.resolve(null),
    player2Id ? getPlayerById(player2Id) : Promise.resolve(null),
  ]);

  const [initialStats1, initialStats2] = await Promise.all([
    initialPlayer1
      ? getPlayerSeasonStats(initialPlayer1.id, CURRENT_SEASON_LABEL)
      : Promise.resolve(null),
    initialPlayer2
      ? getPlayerSeasonStats(initialPlayer2.id, CURRENT_SEASON_LABEL)
      : Promise.resolve(null),
  ]);

  return (
    <CompareClient
      allPlayers={allPlayers}
      teams={allTeams}
      seasonStatsMap={seasonStatsRecord}
      initialPlayer1={initialPlayer1 ?? undefined}
      initialPlayer2={initialPlayer2 ?? undefined}
      initialStats1={initialStats1 ?? undefined}
      initialStats2={initialStats2 ?? undefined}
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
