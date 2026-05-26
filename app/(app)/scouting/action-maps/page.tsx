// ScoutLab Action Maps — 피치 위 액션 경로 시각화
import { SearchX } from "lucide-react";

import {
  getDefaultScoutlabPlayer,
  getScoutlabActionMaps,
  getScoutlabPlayerById,
} from "@/lib/repositories/scoutlab-repository";

import { ActionMapGrid } from "../_components/action-map-grid";
import { PlayerCardHeader } from "../_components/player-card-header";
import { parseScoutlabParams } from "../_lib/scoutlab-search-params";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ActionMapsPage({ searchParams }: PageProps) {
  const params = parseScoutlabParams(await searchParams);

  // 선수 조회 (기본: Haaland)
  const selectedPlayer = params.playerId
    ? await getScoutlabPlayerById(params.playerId)
    : await getDefaultScoutlabPlayer(params.season);

  const actionMaps = selectedPlayer
    ? await getScoutlabActionMaps(selectedPlayer.id, params.season)
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

  return (
    <div className="space-y-4">
      <PlayerCardHeader player={selectedPlayer} />

      <div className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/20 bg-comic-white p-5">
        <h3 className="mb-4 font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-lg)] text-comic-black">
          Action Maps
        </h3>
        {actionMaps.length > 0 ? (
          <ActionMapGrid actionMaps={actionMaps} />
        ) : (
          <p className="py-10 text-center font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-lg)] text-comic-black/50">
            액션맵 데이터가 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
