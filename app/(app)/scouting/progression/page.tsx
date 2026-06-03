// ScoutLab Progression — 시즌별 메트릭 추이 차트
import { SearchX } from "lucide-react";

import {
  getDefaultScoutlabPlayer,
  getScoutlabFilterOptions,
  getScoutlabPlayerById,
  getScoutlabProgression,
} from "@/lib/repositories/scoutlab-repository";

import { PlayerCardHeader } from "../_components/player-card-header";
import { ProgressionView } from "../_components/progression-view";
import { ScoutlabFilterBar } from "../_components/scoutlab-filter-bar";
import { ScoutlabGlobalSearch } from "../_components/scoutlab-global-search";
import { positionToComparisonPosition } from "../_lib/scoutlab-constants";
import { parseScoutlabParams } from "../_lib/scoutlab-search-params";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProgressionPage({ searchParams }: PageProps) {
  const params = parseScoutlabParams(await searchParams);

  const [filterOptions, selectedPlayer] = await Promise.all([
    getScoutlabFilterOptions(params.season),
    params.playerId
      ? getScoutlabPlayerById(params.playerId)
      : getDefaultScoutlabPlayer(params.season),
  ]);

  const effectiveComparisonPosition =
    params.isComparisonPositionExplicit || !selectedPlayer
      ? params.comparisonPosition
      : positionToComparisonPosition(selectedPlayer.position);

  const progressionData = selectedPlayer
    ? await getScoutlabProgression(
        selectedPlayer.id,
        params.mode,
        params.adjustment,
        effectiveComparisonPosition,
      )
    : [];

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
      <div className="flex flex-wrap items-center gap-3">
        <ScoutlabFilterBar options={filterOptions} />
        <ScoutlabGlobalSearch />
      </div>
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
