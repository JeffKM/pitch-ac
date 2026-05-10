// ScoutLab Ranking — 카테고리 + 메트릭 선택 필터 (Client)
"use client";

import { useMemo } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ScoutlabCategory,
  ScoutlabCategoryMetrics,
  ScoutlabMetrics,
} from "@/types";
import { SCOUTLAB_CATEGORY_LABELS } from "@/types";

import { formatMetricName } from "../_lib/format-metric";

const CATEGORIES: Array<{
  key: ScoutlabCategory;
  prop: keyof ScoutlabMetrics;
}> = [
  { key: "final_product", prop: "finalProduct" },
  { key: "shooting", prop: "shooting" },
  { key: "creation", prop: "creation" },
  { key: "passing", prop: "passing" },
  { key: "ball_carrying", prop: "ballCarrying" },
  { key: "defending", prop: "defending" },
  { key: "set_pieces", prop: "setPieces" },
  { key: "aerial", prop: "aerial" },
  { key: "possession", prop: "possession" },
  { key: "vaep_overview", prop: "vaepOverview" },
];

interface RankingFilterPanelProps {
  sampleMetrics: ScoutlabMetrics | null;
  selectedCategory: ScoutlabCategory;
  selectedMetric: string;
  onCategoryChange: (category: ScoutlabCategory) => void;
  onMetricChange: (metric: string) => void;
}

export function RankingFilterPanel({
  sampleMetrics,
  selectedCategory,
  selectedMetric,
  onCategoryChange,
  onMetricChange,
}: RankingFilterPanelProps) {
  const metricKeys = useMemo(() => {
    if (!sampleMetrics) return [];
    const catProp = CATEGORIES.find((c) => c.key === selectedCategory)?.prop;
    if (!catProp) return [];
    const catMetrics = sampleMetrics[catProp] as ScoutlabCategoryMetrics;
    return catMetrics ? Object.keys(catMetrics) : [];
  }, [sampleMetrics, selectedCategory]);

  return (
    <div className="flex flex-wrap gap-3" data-testid="ranking-filter-panel">
      <Select
        value={selectedCategory}
        onValueChange={(v) => onCategoryChange(v as ScoutlabCategory)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="카테고리" />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map(({ key }) => (
            <SelectItem key={key} value={key}>
              {SCOUTLAB_CATEGORY_LABELS[key]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedMetric} onValueChange={onMetricChange}>
        <SelectTrigger className="w-52">
          <SelectValue placeholder="메트릭" />
        </SelectTrigger>
        <SelectContent>
          {metricKeys.map((key) => (
            <SelectItem key={key} value={key}>
              {formatMetricName(key)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
