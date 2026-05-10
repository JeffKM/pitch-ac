// ScoutLab Scatter — X/Y 메트릭 산점도
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

export default async function ScatterPage({ searchParams }: PageProps) {
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
          },
        )
      : [];

  return (
    <div className="space-y-4">
      <div className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-thin)] border-comic-black/20 bg-comic-white p-5">
        <h3 className="mb-4 font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-lg)] text-comic-black">
          Scatter Plot
        </h3>
        <ScatterView initialData={scatterData} sampleMetrics={sampleMetrics} />
      </div>
    </div>
  );
}
