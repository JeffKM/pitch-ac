// ScoutLab Summary — 카테고리별 평균 백분위 요약 페이지
import { SearchX } from "lucide-react";
import { Suspense } from "react";

import {
  getDefaultScoutlabPlayer,
  getScoutlabMetrics,
  getScoutlabPlayerById,
} from "@/lib/repositories/scoutlab-repository";

import { CategoryPercentileBars } from "../_components/category-percentile-bars";
import { MetricContextSubtitle } from "../_components/metric-context-subtitle";
import { PlayerCardHeader } from "../_components/player-card-header";
import { ScoutlabFilterSection } from "../_components/scoutlab-filter-section";
import {
  MetricRowsSkeleton,
  PlayerCardHeaderSkeleton,
  ScoutlabFilterSectionSkeleton,
} from "../_components/scoutlab-skeletons";
import { positionToComparisonPosition } from "../_lib/scoutlab-constants";
import { parseScoutlabParams } from "../_lib/scoutlab-search-params";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function SummaryPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-4">
      <Suspense fallback={<ScoutlabFilterSectionSkeleton />}>
        <ScoutlabFilterSection searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<SummarySkeleton />}>
        <SummaryContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

/** 선수 카드 + 카테고리 백분위 — searchParams 의존 데이터 영역 */
async function SummaryContent({ searchParams }: PageProps) {
  const params = parseScoutlabParams(await searchParams);

  const selectedPlayer = params.playerId
    ? await getScoutlabPlayerById(params.playerId)
    : await getDefaultScoutlabPlayer(params.season);

  const effectiveComparisonPosition =
    params.isComparisonPositionExplicit || !selectedPlayer
      ? params.comparisonPosition
      : positionToComparisonPosition(selectedPlayer.position);

  const metrics = selectedPlayer
    ? await getScoutlabMetrics(
        selectedPlayer.id,
        params.season,
        params.mode,
        params.adjustment,
        effectiveComparisonPosition,
      )
    : null;

  if (!selectedPlayer || !metrics) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <SearchX className="mx-auto size-10 text-comic-black/20" />
          <p className="mt-3 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-lg)] text-comic-black/50">
            {!selectedPlayer
              ? "Player Card 탭에서 선수를 선택하세요."
              : "해당 시즌/모드에 대한 메트릭 데이터가 없습니다."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.5fr]"
      data-testid="summary-layout"
    >
      {/* 좌: 선수 카드 헤더 */}
      <div className="space-y-2">
        <PlayerCardHeader player={selectedPlayer} />
        <MetricContextSubtitle
          comparisonPosition={effectiveComparisonPosition}
          mode={params.mode}
          adjustment={params.adjustment}
        />
      </div>

      {/* 우: 카테고리 백분위 바 */}
      <div className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/20 bg-comic-white p-5">
        <h3 className="mb-4 font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-lg)] text-comic-black">
          Category Overview
        </h3>
        <CategoryPercentileBars metrics={metrics} />
      </div>
    </div>
  );
}

/** Summary 본문 fallback — 실제 2열 레이아웃과 동일한 그리드 유지 */
function SummarySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_1.5fr]">
      <div className="space-y-2">
        <PlayerCardHeaderSkeleton />
        <div className="h-4 w-56 animate-pulse rounded bg-comic-cream" />
      </div>
      <div className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/20 bg-comic-white p-5">
        <div className="mb-4 h-6 w-44 animate-pulse rounded bg-comic-cream" />
        <MetricRowsSkeleton rows={6} />
      </div>
    </div>
  );
}
