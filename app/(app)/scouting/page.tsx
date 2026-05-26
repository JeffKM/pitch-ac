// ScoutLab Player Card — 메인 페이지
import { SearchX } from "lucide-react";

import {
  getDefaultScoutlabPlayer,
  getScoutlabFilterOptions,
  getScoutlabMetrics,
  getScoutlabPlayerById,
  searchScoutlabPlayers,
} from "@/lib/repositories/scoutlab-repository";

import { MetricCategoryTable } from "./_components/metric-category-table";
import { MetricContextSubtitle } from "./_components/metric-context-subtitle";
import { PlayerCardHeader } from "./_components/player-card-header";
import { ScoutlabFilterBar } from "./_components/scoutlab-filter-bar";
import { ScoutlabModeToggle } from "./_components/scoutlab-mode-toggle";
import { ScoutlabPlayerSearch } from "./_components/scoutlab-player-search";
import { ScoutlabPositionFilter } from "./_components/scoutlab-position-filter";
import { positionToComparisonPosition } from "./_lib/scoutlab-constants";
import { parseScoutlabParams } from "./_lib/scoutlab-search-params";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ScoutingPage({ searchParams }: PageProps) {
  const params = parseScoutlabParams(await searchParams);

  // 필터 옵션 + 선수 목록 + 선택된 선수 데이터 병렬 조회
  const [filterOptions, players, selectedPlayer] = await Promise.all([
    getScoutlabFilterOptions(params.season),
    searchScoutlabPlayers({
      season: params.season,
      league: params.league ?? undefined,
      team: params.team ?? undefined,
    }),
    params.playerId
      ? getScoutlabPlayerById(params.playerId)
      : getDefaultScoutlabPlayer(params.season),
  ]);

  // 선수 포지션 기반 comparisonPosition 결정
  // URL에 명시적으로 지정되지 않았으면 선수의 실제 포지션으로 자동 매핑
  const effectiveComparisonPosition =
    params.isComparisonPositionExplicit || !selectedPlayer
      ? params.comparisonPosition
      : positionToComparisonPosition(selectedPlayer.position);

  // 선수가 선택된 경우 메트릭 조회
  const metrics = selectedPlayer
    ? await getScoutlabMetrics(
        selectedPlayer.id,
        params.season,
        params.mode,
        params.adjustment,
        effectiveComparisonPosition,
      )
    : null;

  return (
    <div className="space-y-4">
      {/* 필터 바 */}
      <div className="flex flex-wrap items-center gap-3">
        <ScoutlabPlayerSearch
          players={players}
          selectedPlayer={selectedPlayer}
        />
        <ScoutlabFilterBar options={filterOptions} />
      </div>

      {/* 포지션 필터 + 모드 토글 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ScoutlabPositionFilter />
        <ScoutlabModeToggle />
      </div>

      {/* 메인 콘텐츠 */}
      {selectedPlayer ? (
        <div className="space-y-4">
          <PlayerCardHeader player={selectedPlayer} />
          <MetricContextSubtitle
            comparisonPosition={effectiveComparisonPosition}
            mode={params.mode}
            adjustment={params.adjustment}
          />
          {metrics ? (
            <MetricCategoryTable metrics={metrics} />
          ) : (
            <EmptyState message="선택한 시즌/모드에 해당하는 메트릭 데이터가 없습니다." />
          )}
        </div>
      ) : (
        <EmptyState message="좌측 검색창에서 선수를 선택하세요." />
      )}
    </div>
  );
}

/** 빈 상태 표시 */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[30vh] items-center justify-center">
      <div className="text-center">
        <SearchX className="mx-auto size-10 text-comic-black/20" />
        <p className="mt-3 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-lg)] text-comic-black/50">
          {message}
        </p>
      </div>
    </div>
  );
}
