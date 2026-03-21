import { Suspense } from "react";

import {
  getPlayerById,
  getPlayerSeasonStats,
  mockPlayers,
  mockTeams,
} from "@/lib/mock";

import { CompareClient } from "./_components/compare-client";

// searchParams를 Suspense 내부에서 await해야 블로킹 없이 스트리밍 가능
async function CompareContent({
  searchParams,
}: {
  searchParams: Promise<{ p1?: string; p2?: string }>;
}) {
  const { p1, p2 } = await searchParams;

  const player1Id = p1 ? Number(p1) : undefined;
  const player2Id = p2 ? Number(p2) : undefined;

  const initialPlayer1 = player1Id ? getPlayerById(player1Id) : undefined;
  const initialPlayer2 = player2Id ? getPlayerById(player2Id) : undefined;
  const initialStats1 = initialPlayer1
    ? getPlayerSeasonStats(initialPlayer1.id)
    : undefined;
  const initialStats2 = initialPlayer2
    ? getPlayerSeasonStats(initialPlayer2.id)
    : undefined;

  return (
    <CompareClient
      allPlayers={mockPlayers}
      teams={mockTeams}
      initialPlayer1={initialPlayer1}
      initialPlayer2={initialPlayer2}
      initialStats1={initialStats1}
      initialStats2={initialStats2}
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
