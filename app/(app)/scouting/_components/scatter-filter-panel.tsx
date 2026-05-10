// ScoutLab Scatter — X/Y 축 메트릭 선택 + 필터 패널 (Client)
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ScoutlabCategory } from "@/types";
import { SCOUTLAB_CATEGORY_LABELS } from "@/types";

import { formatMetricName } from "../_lib/format-metric";

/** 카테고리 목록 (misc 제외) */
const CATEGORIES: ScoutlabCategory[] = [
  "final_product",
  "shooting",
  "creation",
  "passing",
  "ball_carrying",
  "defending",
  "set_pieces",
  "aerial",
  "possession",
  "vaep_overview",
];

interface ScatterFilterPanelProps {
  /** 선택 가능한 메트릭 키 (카테고리별) */
  metricKeysByCategory: Record<string, string[]>;
  xCategory: ScoutlabCategory;
  yCategory: ScoutlabCategory;
  xMetric: string;
  yMetric: string;
  onXCategoryChange: (cat: ScoutlabCategory) => void;
  onYCategoryChange: (cat: ScoutlabCategory) => void;
  onXMetricChange: (metric: string) => void;
  onYMetricChange: (metric: string) => void;
}

export function ScatterFilterPanel({
  metricKeysByCategory,
  xCategory,
  yCategory,
  xMetric,
  yMetric,
  onXCategoryChange,
  onYCategoryChange,
  onXMetricChange,
  onYMetricChange,
}: ScatterFilterPanelProps) {
  return (
    <div
      className="flex flex-wrap items-end gap-4"
      data-testid="scatter-filter-panel"
    >
      {/* X축 */}
      <div className="space-y-1">
        <span className="text-xs font-medium text-comic-black/60">X축</span>
        <div className="flex gap-2">
          <Select
            value={xCategory}
            onValueChange={(v) => onXCategoryChange(v as ScoutlabCategory)}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {SCOUTLAB_CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={xMetric} onValueChange={onXMetricChange}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(metricKeysByCategory[xCategory] ?? []).map((k) => (
                <SelectItem key={k} value={k}>
                  {formatMetricName(k)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Y축 */}
      <div className="space-y-1">
        <span className="text-xs font-medium text-comic-black/60">Y축</span>
        <div className="flex gap-2">
          <Select
            value={yCategory}
            onValueChange={(v) => onYCategoryChange(v as ScoutlabCategory)}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {SCOUTLAB_CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={yMetric} onValueChange={onYMetricChange}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(metricKeysByCategory[yCategory] ?? []).map((k) => (
                <SelectItem key={k} value={k}>
                  {formatMetricName(k)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
