// ScoutLab Progression — 카테고리/메트릭 선택 드롭다운 (Client Component)
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

import { formatMetricLabel } from "../_lib/format-metric";

/** 카테고리 키 → camelCase 프로퍼티 매핑 (misc 제외) */
const CATEGORY_PROPS: Array<{
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

interface ProgressionMetricSelectProps {
  /** 메트릭 데이터 (메트릭명 추출용) */
  metrics: ScoutlabMetrics;
  selectedCategory: ScoutlabCategory;
  selectedMetric: string;
  onCategoryChange: (category: ScoutlabCategory) => void;
  onMetricChange: (metric: string) => void;
}

export function ProgressionMetricSelect({
  metrics,
  selectedCategory,
  selectedMetric,
  onCategoryChange,
  onMetricChange,
}: ProgressionMetricSelectProps) {
  // 선택된 카테고리의 메트릭 목록
  const metricKeys = useMemo(() => {
    const catProp = CATEGORY_PROPS.find(
      (c) => c.key === selectedCategory,
    )?.prop;
    if (!catProp) return [];
    const categoryMetrics = metrics[catProp] as ScoutlabCategoryMetrics;
    return categoryMetrics ? Object.keys(categoryMetrics) : [];
  }, [metrics, selectedCategory]);

  return (
    <div
      className="flex flex-wrap gap-3"
      data-testid="progression-metric-select"
    >
      {/* 카테고리 선택 */}
      <Select
        value={selectedCategory}
        onValueChange={(v) => {
          onCategoryChange(v as ScoutlabCategory);
        }}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="카테고리" />
        </SelectTrigger>
        <SelectContent>
          {CATEGORY_PROPS.map(({ key }) => (
            <SelectItem key={key} value={key}>
              {SCOUTLAB_CATEGORY_LABELS[key]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 메트릭 선택 */}
      <Select value={selectedMetric} onValueChange={onMetricChange}>
        <SelectTrigger className="w-52">
          <SelectValue placeholder="메트릭" />
        </SelectTrigger>
        <SelectContent>
          {metricKeys.map((key) => (
            <SelectItem key={key} value={key}>
              {formatMetricLabel(key)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
