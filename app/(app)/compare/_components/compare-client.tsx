"use client";

// 선수 비교 페이지 핵심 조율자 — 선수 선택 상태 + URL 파라미터 동기화

import { useRouter } from "next/navigation";
import { useState } from "react";

import { PlayerRadarChart } from "@/components/charts/player-radar-chart";
import { getPlayerSeasonStats, getTeamById } from "@/lib/mock";
import type { Player, PlayerSeasonStats, Team } from "@/types";

import { CompareStatTable } from "./compare-stat-table";
import { CompareVerdict } from "./compare-verdict";
import { PlayerSlot } from "./player-slot";
import { ShareButton } from "./share-button";

interface CompareClientProps {
  allPlayers: Player[];
  teams: Team[];
  initialPlayer1: Player | undefined;
  initialPlayer2: Player | undefined;
  initialStats1: PlayerSeasonStats | undefined;
  initialStats2: PlayerSeasonStats | undefined;
}

export function CompareClient({
  allPlayers,
  teams,
  initialPlayer1,
  initialPlayer2,
  initialStats1,
  initialStats2,
}: CompareClientProps) {
  const router = useRouter();

  const [player1, setPlayer1] = useState<Player | undefined>(initialPlayer1);
  const [player2, setPlayer2] = useState<Player | undefined>(initialPlayer2);
  const [stats1, setStats1] = useState<PlayerSeasonStats | undefined>(
    initialStats1,
  );
  const [stats2, setStats2] = useState<PlayerSeasonStats | undefined>(
    initialStats2,
  );

  const canCompare = !!(player1 && player2 && stats1 && stats2);

  const updateUrl = (p1Id?: number, p2Id?: number) => {
    const params = new URLSearchParams();
    if (p1Id) params.set("p1", String(p1Id));
    if (p2Id) params.set("p2", String(p2Id));
    const query = params.toString();
    router.push(`/compare${query ? `?${query}` : ""}`, { scroll: false });
  };

  const handleSelectPlayer1 = (player: Player) => {
    const s = getPlayerSeasonStats(player.id);
    setPlayer1(player);
    setStats1(s);
    updateUrl(player.id, player2?.id);
  };

  const handleSelectPlayer2 = (player: Player) => {
    const s = getPlayerSeasonStats(player.id);
    setPlayer2(player);
    setStats2(s);
    updateUrl(player1?.id, player.id);
  };

  const handleClearPlayer1 = () => {
    setPlayer1(undefined);
    setStats1(undefined);
    updateUrl(undefined, player2?.id);
  };

  const handleClearPlayer2 = () => {
    setPlayer2(undefined);
    setStats2(undefined);
    updateUrl(player1?.id, undefined);
  };

  const team1 = player1 ? getTeamById(player1.teamId) : undefined;
  const team2 = player2 ? getTeamById(player2.teamId) : undefined;

  return (
    <div className="space-y-6">
      {/* 선수 선택 슬롯 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PlayerSlot
          label="선수 A"
          player={player1}
          team={team1}
          allPlayers={allPlayers}
          teams={teams}
          onSelect={handleSelectPlayer1}
          onClear={handleClearPlayer1}
          colorClass="text-chart-1"
        />
        <PlayerSlot
          label="선수 B"
          player={player2}
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
            player1={{ name: player1.name, data: stats1.radarData.player }}
            player2={{ name: player2.name, data: stats2.radarData.player }}
          />

          {/* 스탯 비교 테이블 */}
          <CompareStatTable
            player1={player1}
            player2={player2}
            stats1={stats1}
            stats2={stats2}
          />

          {/* Verdict */}
          <CompareVerdict
            player1={player1}
            player2={player2}
            stats1={stats1}
            stats2={stats2}
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
        <ShareButton disabled={!canCompare} />
      </div>
    </div>
  );
}
