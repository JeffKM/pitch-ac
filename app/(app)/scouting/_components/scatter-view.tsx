// ScoutLab Scatter — 클라이언트 뷰 (필터 + 차트)
"use client";

import { useCallback, useMemo, useState } from "react";

import type {
  ScoutlabCategory,
  ScoutlabCategoryMetrics,
  ScoutlabMetrics,
  ScoutlabScatterPoint,
} from "@/types";

import { formatMetricName } from "../_lib/format-metric";
import { ScatterFilterPanel } from "./scatter-filter-panel";
import { DynamicScatterPlot } from "./scoutlab-charts";

/** 카테고리 → camelCase 프로퍼티 매핑 */
const CATEGORY_PROP_MAP: Record<ScoutlabCategory, keyof ScoutlabMetrics> = {
  final_product: "finalProduct",
  shooting: "shooting",
  creation: "creation",
  passing: "passing",
  ball_carrying: "ballCarrying",
  defending: "defending",
  set_pieces: "setPieces",
  aerial: "aerial",
  possession: "possession",
  vaep_overview: "vaepOverview",
  misc: "misc",
};

interface ScatterViewProps {
  /** 전체 산점도 데이터 (서버에서 초기 조회) */
  initialData: ScoutlabScatterPoint[];
  /** 메트릭 키 추출용 샘플 데이터 */
  sampleMetrics: ScoutlabMetrics | null;
}

export function ScatterView({ initialData, sampleMetrics }: ScatterViewProps) {
  const [xCategory, setXCategory] = useState<ScoutlabCategory>("final_product");
  const [yCategory, setYCategory] = useState<ScoutlabCategory>("creation");

  // 카테고리별 메트릭 키 맵
  const metricKeysByCategory = useMemo(() => {
    if (!sampleMetrics) return {};
    const map: Record<string, string[]> = {};
    for (const [catKey, prop] of Object.entries(CATEGORY_PROP_MAP)) {
      const catMetrics = sampleMetrics[prop] as ScoutlabCategoryMetrics;
      map[catKey] = catMetrics ? Object.keys(catMetrics) : [];
    }
    return map;
  }, [sampleMetrics]);

  const getDefaultMetric = useCallback(
    (cat: ScoutlabCategory) => metricKeysByCategory[cat]?.[0] ?? "",
    [metricKeysByCategory],
  );

  const [xMetric, setXMetric] = useState(() => getDefaultMetric(xCategory));
  const [yMetric, setYMetric] = useState(() => getDefaultMetric(yCategory));

  const handleXCategoryChange = (cat: ScoutlabCategory) => {
    setXCategory(cat);
    setXMetric(metricKeysByCategory[cat]?.[0] ?? "");
  };

  const handleYCategoryChange = (cat: ScoutlabCategory) => {
    setYCategory(cat);
    setYMetric(metricKeysByCategory[cat]?.[0] ?? "");
  };

  return (
    <div className="space-y-4">
      <ScatterFilterPanel
        metricKeysByCategory={metricKeysByCategory}
        xCategory={xCategory}
        yCategory={yCategory}
        xMetric={xMetric}
        yMetric={yMetric}
        onXCategoryChange={handleXCategoryChange}
        onYCategoryChange={handleYCategoryChange}
        onXMetricChange={setXMetric}
        onYMetricChange={setYMetric}
      />

      <DynamicScatterPlot
        data={initialData}
        xLabel={formatMetricName(xMetric)}
        yLabel={formatMetricName(yMetric)}
      />
    </div>
  );
}
