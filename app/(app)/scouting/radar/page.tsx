// ScoutLab Radar — 카테고리별 백분위 레이더 차트
import { SearchX } from "lucide-react";

import {
  getDefaultScoutlabPlayer,
  getScoutlabPlayerById,
  getScoutlabRadar,
} from "@/lib/repositories/scoutlab-repository";

import { PlayerCardHeader } from "../_components/player-card-header";
import { DynamicRadarChart } from "../_components/scoutlab-charts";
import { parseScoutlabParams } from "../_lib/scoutlab-search-params";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RadarPage({ searchParams }: PageProps) {
  const params = parseScoutlabParams(await searchParams);

  // 선수 조회 (기본: Haaland)
  const selectedPlayer = params.playerId
    ? await getScoutlabPlayerById(params.playerId)
    : await getDefaultScoutlabPlayer(params.season);

  const radar = selectedPlayer
    ? await getScoutlabRadar(selectedPlayer.id, params.season)
    : null;

  if (!selectedPlayer || !radar) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <SearchX className="mx-auto size-10 text-comic-black/20" />
          <p className="mt-3 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-lg)] text-comic-black/50">
            {!selectedPlayer
              ? "Player Card 탭에서 선수를 선택하세요."
              : "해당 시즌의 레이더 데이터가 없습니다."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PlayerCardHeader player={selectedPlayer} />

      <div className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/20 bg-comic-white p-5">
        <h3 className="mb-2 font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-lg)] text-comic-black">
          Percentile Radar
        </h3>
        <DynamicRadarChart axes={radar.axes} playerName={selectedPlayer.name} />
      </div>
    </div>
  );
}
