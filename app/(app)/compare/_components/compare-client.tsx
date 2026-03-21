"use client";

// 선수 비교 페이지 핵심 조율자 — 선수 선택 상태 + URL 파라미터 동기화

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";

const PlayerRadarChart = dynamic(
  () =>
    import("@/components/charts/player-radar-chart").then(
      (m) => m.PlayerRadarChart,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] animate-pulse rounded-xl border bg-muted" />
    ),
  },
);
import type { Player, PlayerSeasonStats, Team } from "@/types";

import { CompareStatTable } from "./compare-stat-table";
import { CompareVerdict } from "./compare-verdict";
import { PlayerSlot } from "./player-slot";
import { ShareButton } from "./share-button";

interface PlayerSlotState {
  player: Player;
  stats: PlayerSeasonStats;
}

interface CompareClientProps {
  allPlayers: Player[];
  teams: Team[];
  seasonStatsMap: Record<number, PlayerSeasonStats>;
  initialPlayer1: Player | undefined;
  initialPlayer2: Player | undefined;
  initialStats1: PlayerSeasonStats | undefined;
  initialStats2: PlayerSeasonStats | undefined;
}

export function CompareClient({
  allPlayers,
  teams,
  seasonStatsMap,
  initialPlayer1,
  initialPlayer2,
  initialStats1,
  initialStats2,
}: CompareClientProps) {
  const router = useRouter();

  const [slot1, setSlot1] = useState<PlayerSlotState | undefined>(
    initialPlayer1 && initialStats1
      ? { player: initialPlayer1, stats: initialStats1 }
      : undefined,
  );
  const [slot2, setSlot2] = useState<PlayerSlotState | undefined>(
    initialPlayer2 && initialStats2
      ? { player: initialPlayer2, stats: initialStats2 }
      : undefined,
  );

  const canCompare = !!(slot1 && slot2);

  const updateUrl = (p1Id?: number, p2Id?: number) => {
    const params = new URLSearchParams();
    if (p1Id) params.set("p1", String(p1Id));
    if (p2Id) params.set("p2", String(p2Id));
    const query = params.toString();
    router.push(`/compare${query ? `?${query}` : ""}`, { scroll: false });
  };

  const handleSelectPlayer1 = (player: Player) => {
    const stats = seasonStatsMap[player.id];
    if (stats) setSlot1({ player, stats });
    updateUrl(player.id, slot2?.player.id);
  };

  const handleSelectPlayer2 = (player: Player) => {
    const stats = seasonStatsMap[player.id];
    if (stats) setSlot2({ player, stats });
    updateUrl(slot1?.player.id, player.id);
  };

  const handleClearPlayer1 = () => {
    setSlot1(undefined);
    updateUrl(undefined, slot2?.player.id);
  };

  const handleClearPlayer2 = () => {
    setSlot2(undefined);
    updateUrl(slot1?.player.id, undefined);
  };

  const teamsById = new Map(teams.map((t) => [t.id, t]));
  const team1 = slot1 ? teamsById.get(slot1.player.teamId) : undefined;
  const team2 = slot2 ? teamsById.get(slot2.player.teamId) : undefined;

  return (
    <div className="space-y-6">
      {/* 선수 선택 슬롯 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PlayerSlot
          label="선수 A"
          player={slot1?.player}
          team={team1}
          allPlayers={allPlayers}
          teams={teams}
          onSelect={handleSelectPlayer1}
          onClear={handleClearPlayer1}
          colorClass="text-chart-1"
        />
        <PlayerSlot
          label="선수 B"
          player={slot2?.player}
          team={team2}
          allPlayers={allPlayers}
          teams={teams}
          onSelect={handleSelectPlayer2}
          onClear={handleClearPlayer2}
          colorClass="text-chart-2"
        />
      </div>

      {/* 비교 결과 — 양 선수 선택 후 표시 */}
      {canCompare && (
        <>
          {/* 레이더 차트 오버레이 */}
          <PlayerRadarChart
            mode="compare"
            player1={{
              name: slot1.player.name,
              data: slot1.stats.radarData.player,
            }}
            player2={{
              name: slot2.player.name,
              data: slot2.stats.radarData.player,
            }}
          />

          {/* 스탯 비교 테이블 */}
          <CompareStatTable
            player1={slot1.player}
            player2={slot2.player}
            stats1={slot1.stats}
            stats2={slot2.stats}
          />

          {/* Verdict */}
          <CompareVerdict
            player1={slot1.player}
            player2={slot2.player}
            stats1={slot1.stats}
            stats2={slot2.stats}
          />
        </>
      )}

      {/* 빈 상태 안내 */}
      {!canCompare && (
        <p className="py-12 text-center text-muted-foreground">
          두 선수를 선택하면 비교 배틀카드가 표시됩니다.
        </p>
      )}

      {/* Share as Image 버튼 */}
      <div className="flex justify-center">
        <ShareButton
          disabled={!canCompare}
          player1Id={slot1?.player.id}
          player2Id={slot2?.player.id}
          player1Name={slot1?.player.name}
          player2Name={slot2?.player.name}
        />
      </div>
    </div>
  );
}
