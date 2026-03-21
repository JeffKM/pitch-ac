import type { Metadata } from "next";
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

type CompareSearchParams = Promise<{ p1?: string; p2?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: CompareSearchParams;
}): Promise<Metadata> {
  const { p1, p2 } = await searchParams;

  const baseMetadata: Metadata = {
    title: "선수 비교 | pitch-ac",
    description: "프리미어리그 선수 스탯을 비교해보세요",
  };

  if (!p1 || !p2) return baseMetadata;

  const [player1, player2] = await Promise.all([
    getPlayerById(Number(p1)),
    getPlayerById(Number(p2)),
  ]);

  if (!player1 || !player2) return baseMetadata;

  const title = `${player1.name} vs ${player2.name} | pitch-ac`;
  const description = `${player1.name}과(와) ${player2.name}의 프리미어리그 시즌 스탯 비교`;
  const ogImageUrl = `/api/og?p1=${p1}&p2=${p2}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${player1.name} vs ${player2.name} 비교 카드`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

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
