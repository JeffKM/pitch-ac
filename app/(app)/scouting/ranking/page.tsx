// ScoutLab Ranking — 메트릭별 선수 랭킹 테이블
import { Suspense } from "react";

import {
  getRankingData,
  getSampleMetrics,
} from "@/lib/repositories/scoutlab-repository";
import type { ScoutlabCategoryMetrics } from "@/types";

import { RankingView } from "../_components/ranking-view";
import { parseScoutlabParams } from "../_lib/scoutlab-search-params";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function RankingPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-4">
      <h1 className="sr-only">ScoutLab Ranking</h1>
      <div className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/20 bg-comic-white p-5">
        <h2 className="mb-4 font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-lg)] text-comic-black">
          Player Ranking
        </h2>
        <Suspense fallback={<RankingSkeleton />}>
          <RankingContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

/** 랭킹 데이터 조회 — searchParams 의존 영역 */
async function RankingContent({ searchParams }: PageProps) {
  const params = parseScoutlabParams(await searchParams);

  const initialCategory = "final_product" as const;

  // sampleMetrics에서 실제 첫 번째 메트릭 키를 추출
  const sampleMetrics = await getSampleMetrics(
    params.season,
    params.mode,
    params.adjustment,
  );
  const firstMetricKey = sampleMetrics?.finalProduct
    ? (Object.keys(sampleMetrics.finalProduct as ScoutlabCategoryMetrics)[0] ??
      "")
    : "";

  const rankingData = firstMetricKey
    ? await getRankingData(firstMetricKey, initialCategory, {
        season: params.season,
        league: params.league ?? undefined,
      })
    : [];

  return (
    <RankingView
      initialEntries={rankingData}
      sampleMetrics={sampleMetrics}
      initialCategory={initialCategory}
      initialMetric={firstMetricKey}
    />
  );
}

/** 랭킹 fallback — 필터 패널 + 테이블 행 */
function RankingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="h-9 w-40 animate-pulse rounded-md bg-comic-cream" />
        <div className="h-9 w-40 animate-pulse rounded-md bg-comic-cream" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="h-10 w-full animate-pulse rounded bg-comic-cream"
          />
        ))}
      </div>
    </div>
  );
}
