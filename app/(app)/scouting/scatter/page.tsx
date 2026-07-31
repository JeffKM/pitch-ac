// ScoutLab Scatter — X/Y 메트릭 산점도
import { Suspense } from "react";

import {
  getSampleMetrics,
  getScatterData,
} from "@/lib/repositories/scoutlab-repository";
import type { ScoutlabCategoryMetrics } from "@/types";

import { ScatterView } from "../_components/scatter-view";
import { parseScoutlabParams } from "../_lib/scoutlab-search-params";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function ScatterPage({ searchParams }: PageProps) {
  return (
    <div className="space-y-4">
      <h1 className="sr-only">ScoutLab Scatter</h1>
      <div className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/20 bg-comic-white p-5">
        <h2 className="mb-4 font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-lg)] text-comic-black">
          Scatter Plot
        </h2>
        <Suspense fallback={<ScatterSkeleton />}>
          <ScatterContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

/** 산점도 데이터 조회 — searchParams 의존 영역 */
async function ScatterContent({ searchParams }: PageProps) {
  const params = parseScoutlabParams(await searchParams);

  // sampleMetrics에서 실제 첫 번째 메트릭 키를 추출
  const sampleMetrics = await getSampleMetrics(
    params.season,
    params.mode,
    params.adjustment,
  );

  const xMetricKey = sampleMetrics?.finalProduct
    ? (Object.keys(sampleMetrics.finalProduct as ScoutlabCategoryMetrics)[0] ??
      "")
    : "";
  const yMetricKey = sampleMetrics?.creation
    ? (Object.keys(sampleMetrics.creation as ScoutlabCategoryMetrics)[0] ?? "")
    : "";

  const scatterData =
    xMetricKey && yMetricKey
      ? await getScatterData(
          xMetricKey,
          yMetricKey,
          "final_product",
          "creation",
          {
            season: params.season,
            league: params.league ?? undefined,
          },
        )
      : [];

  return (
    <ScatterView initialData={scatterData} sampleMetrics={sampleMetrics} />
  );
}

/** 산점도 fallback — 필터 패널 + 차트 영역 */
function ScatterSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="h-9 w-40 animate-pulse rounded-md bg-comic-cream" />
        <div className="h-9 w-40 animate-pulse rounded-md bg-comic-cream" />
        <div className="h-9 w-40 animate-pulse rounded-md bg-comic-cream" />
      </div>
      <div className="h-96 w-full animate-pulse rounded bg-comic-cream" />
    </div>
  );
}
