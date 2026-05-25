// ScoutLab Progression — 클라이언트 뷰 (카테고리/메트릭 선택 + 차트)
"use client";

import { useMemo, useState } from "react";

import type {
  ScoutlabCategory,
  ScoutlabCategoryMetrics,
  ScoutlabMetrics,
} from "@/types";

import { formatMetricLabel } from "../_lib/format-metric";
import { ProgressionMetricSelect } from "./progression-metric-select";
import { DynamicProgressionChart } from "./scoutlab-charts";

/** 카테고리 키 → camelCase 프로퍼티 매핑 */
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

interface ProgressionViewProps {
  /** 여러 시즌 메트릭 배열 (시즌 오름차순) */
  progressionData: ScoutlabMetrics[];
}

export function ProgressionView({ progressionData }: ProgressionViewProps) {
  const [category, setCategory] = useState<ScoutlabCategory>("final_product");

  // 첫 시즌 메트릭에서 메트릭 키 목록 추출
  const firstMetrics = progressionData[0];
  const defaultMetric = useMemo(() => {
    if (!firstMetrics) return "";
    const catProp = CATEGORY_PROP_MAP[category];
    const catMetrics = firstMetrics[catProp] as ScoutlabCategoryMetrics;
    const keys = catMetrics ? Object.keys(catMetrics) : [];
    return keys[0] ?? "";
  }, [firstMetrics, category]);

  const [metric, setMetric] = useState(defaultMetric);

  // 카테고리 변경 시 메트릭 초기화
  const handleCategoryChange = (newCategory: ScoutlabCategory) => {
    setCategory(newCategory);
    const catProp = CATEGORY_PROP_MAP[newCategory];
    const catMetrics = firstMetrics?.[catProp] as
      | ScoutlabCategoryMetrics
      | undefined;
    const keys = catMetrics ? Object.keys(catMetrics) : [];
    setMetric(keys[0] ?? "");
  };

  // 차트 데이터 생성
  const chartData = useMemo(() => {
    const catProp = CATEGORY_PROP_MAP[category];
    return progressionData.map((m) => {
      const catMetrics = m[catProp] as ScoutlabCategoryMetrics;
      const metricData = catMetrics?.[metric];
      return {
        season: m.season,
        value: metricData?.value ?? 0,
        percentile: metricData?.percentile ?? 0,
      };
    });
  }, [progressionData, category, metric]);

  if (!firstMetrics) {
    return (
      <p className="py-10 text-center text-comic-black/50">
        추이 데이터가 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <ProgressionMetricSelect
        metrics={firstMetrics}
        selectedCategory={category}
        selectedMetric={metric}
        onCategoryChange={handleCategoryChange}
        onMetricChange={setMetric}
      />

      <DynamicProgressionChart
        data={chartData}
        metricLabel={formatMetricLabel(metric)}
      />
    </div>
  );
}
