// ScoutLab Action Maps — 피치 위 액션 경로 시각화
import { SearchX } from "lucide-react";
import { Suspense } from "react";

import {
  getDefaultScoutlabPlayer,
  getScoutlabActionMaps,
  getScoutlabPlayerById,
} from "@/lib/repositories/scoutlab-repository";

import { ActionMapGrid } from "../_components/action-map-grid";
import { PlayerCardHeader } from "../_components/player-card-header";
import { ScoutlabFilterSection } from "../_components/scoutlab-filter-section";
import {
  PlayerCardHeaderSkeleton,
  ScoutlabFilterSectionSkeleton,
  ScoutlabPanelSkeleton,
} from "../_components/scoutlab-skeletons";
import { parseScoutlabParams } from "../_lib/scoutlab-search-params";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function ActionMapsPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-4">
      <Suspense fallback={<ScoutlabFilterSectionSkeleton />}>
        <ScoutlabFilterSection searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<ActionMapsSkeleton />}>
        <ActionMapsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

/** 선수 카드 + 액션맵 그리드 — searchParams 의존 데이터 영역 */
async function ActionMapsContent({ searchParams }: PageProps) {
  const params = parseScoutlabParams(await searchParams);

  const selectedPlayer = params.playerId
    ? await getScoutlabPlayerById(params.playerId)
    : await getDefaultScoutlabPlayer(params.season);

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

  const actionMaps = await getScoutlabActionMaps(
    selectedPlayer.id,
    params.season,
  );

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

/** Action Maps 본문 fallback */
function ActionMapsSkeleton() {
  return (
    <div className="space-y-4">
      <PlayerCardHeaderSkeleton />
      <ScoutlabPanelSkeleton bodyClassName="h-96" />
    </div>
  );
}
