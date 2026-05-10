// ScoutLab Ranking — 메트릭별 선수 랭킹 테이블
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

export default async function RankingPage({ searchParams }: PageProps) {
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
      })
    : [];

  return (
    <div className="space-y-4">
      <div className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/20 bg-comic-white p-5">
        <h3 className="mb-4 font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-lg)] text-comic-black">
          Player Ranking
        </h3>
        <RankingView
          initialEntries={rankingData}
          sampleMetrics={sampleMetrics}
          initialCategory={initialCategory}
          initialMetric={firstMetricKey}
        />
      </div>
    </div>
  );
}
