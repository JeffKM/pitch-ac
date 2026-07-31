// ScoutLab Player Card — 메인 페이지
// 데이터 의존 영역만 Suspense로 감싸 필터 변경 시 정적 셸이 유지되도록 구성
import { SearchX } from "lucide-react";
import { Suspense } from "react";

import {
  getDefaultScoutlabPlayer,
  getScoutlabMetrics,
  getScoutlabPlayerById,
} from "@/lib/repositories/scoutlab-repository";

import { MetricCategoryTable } from "./_components/metric-category-table";
import { MetricContextSubtitle } from "./_components/metric-context-subtitle";
import { PlayerCardHeader } from "./_components/player-card-header";
import { ScoutlabFilterSection } from "./_components/scoutlab-filter-section";
import { ScoutlabModeToggle } from "./_components/scoutlab-mode-toggle";
import { ScoutlabPositionFilter } from "./_components/scoutlab-position-filter";
import {
  MetricRowsSkeleton,
  PlayerCardHeaderSkeleton,
  ScoutlabControlRowSkeleton,
  ScoutlabFilterSectionSkeleton,
} from "./_components/scoutlab-skeletons";
import { positionToComparisonPosition } from "./_lib/scoutlab-constants";
import { parseScoutlabParams } from "./_lib/scoutlab-search-params";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function ScoutingPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-4">
      {/* 탭 내비게이션에 시각적 타이틀이 있으므로 헤딩 구조용 sr-only h1 */}
      <h1 className="sr-only">ScoutLab Player Card</h1>

      {/* 필터 바 + 선수 검색 (한 줄) */}
      <Suspense fallback={<ScoutlabFilterSectionSkeleton />}>
        <ScoutlabFilterSection searchParams={searchParams} />
      </Suspense>

      {/* 포지션 필터 + 모드 토글 */}
      <Suspense fallback={<ScoutlabControlRowSkeleton />}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ScoutlabPositionFilter />
          <ScoutlabModeToggle />
        </div>
      </Suspense>

      {/* 메인 콘텐츠 */}
      <Suspense fallback={<PlayerCardSkeleton />}>
        <PlayerCardContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

/** 선수 카드 + 메트릭 테이블 — searchParams 의존 데이터 영역 */
async function PlayerCardContent({ searchParams }: PageProps) {
  const params = parseScoutlabParams(await searchParams);

  const selectedPlayer = params.playerId
    ? await getScoutlabPlayerById(params.playerId)
    : await getDefaultScoutlabPlayer(params.season);

  if (!selectedPlayer) {
    return <EmptyState message="상단 검색창에서 선수를 선택하세요." />;
  }

  // 선수 포지션 기반 comparisonPosition 결정
  // URL에 명시적으로 지정되지 않았으면 선수의 실제 포지션으로 자동 매핑
  const effectiveComparisonPosition = params.isComparisonPositionExplicit
    ? params.comparisonPosition
    : positionToComparisonPosition(selectedPlayer.position);

  const metrics = await getScoutlabMetrics(
    selectedPlayer.id,
    params.season,
    params.mode,
    params.adjustment,
    effectiveComparisonPosition,
  );

  return (
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
  );
}

/** 선수 카드 영역 fallback */
function PlayerCardSkeleton() {
  return (
    <div className="space-y-4">
      <PlayerCardHeaderSkeleton />
      <div className="h-4 w-64 animate-pulse rounded bg-comic-cream" />
      <MetricRowsSkeleton />
    </div>
  );
}

/** 빈 상태 표시 */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[30vh] items-center justify-center">
      <div className="text-center">
        <SearchX className="mx-auto size-10 text-comic-black/20" />
        <p className="mt-3 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-lg)] text-comic-black/60">
          {message}
        </p>
      </div>
    </div>
  );
}
