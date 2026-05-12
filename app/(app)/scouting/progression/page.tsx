// ScoutLab Progression — 시즌별 메트릭 추이 차트
import { SearchX } from "lucide-react";

import {
  getScoutlabPlayerById,
  getScoutlabProgression,
} from "@/lib/repositories/scoutlab-repository";

import { PlayerCardHeader } from "../_components/player-card-header";
import { ProgressionView } from "../_components/progression-view";
import { parseScoutlabParams } from "../_lib/scoutlab-search-params";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProgressionPage({ searchParams }: PageProps) {
  const params = parseScoutlabParams(await searchParams);

  const [selectedPlayer, progressionData] = await Promise.all([
    params.playerId ? getScoutlabPlayerById(params.playerId) : null,
    params.playerId
      ? getScoutlabProgression(
          params.playerId,
          params.mode,
          params.adjustment,
          params.comparisonPosition,
        )
      : [],
  ]);

  if (!selectedPlayer) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <SearchX className="mx-auto size-10 text-comic-black/20" />
          <p className="mt-3 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-lg)] text-comic-black/50">
            Player Card 탭에서 선수를 선택하세요.
          </p>
        </div>
      </div>
    );
  }

  if (progressionData.length === 0) {
    return (
      <div className="space-y-4">
        <PlayerCardHeader player={selectedPlayer} />
        <div className="flex min-h-[30vh] items-center justify-center">
          <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-lg)] text-comic-black/50">
            시즌 추이 데이터가 없습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PlayerCardHeader player={selectedPlayer} />

      <div className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/20 bg-comic-white p-5">
        <h3 className="mb-4 font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-lg)] text-comic-black">
          Season Progression
        </h3>
        <ProgressionView progressionData={progressionData} />
      </div>
    </div>
  );
}
