// ScoutLab Ranking — 클라이언트 뷰 (필터 + 테이블)
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import type {
  ScoutlabCategory,
  ScoutlabCategoryMetrics,
  ScoutlabMetrics,
  ScoutlabPlayer,
} from "@/types";

import { formatMetricLabel } from "../_lib/format-metric";
import { useScoutlabParams } from "../_lib/use-scoutlab-params";
import { RankingFilterPanel } from "./ranking-filter-panel";
import { RankingTable } from "./ranking-table";

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

interface RankingEntry {
  player: ScoutlabPlayer;
  value: number;
  percentile: number;
}

interface RankingViewProps {
  initialEntries: RankingEntry[];
  sampleMetrics: ScoutlabMetrics | null;
  initialCategory: ScoutlabCategory;
  initialMetric: string;
}

export function RankingView({
  initialEntries,
  sampleMetrics,
  initialCategory,
  initialMetric,
}: RankingViewProps) {
  const { league } = useScoutlabParams();
  const [category, setCategory] = useState(initialCategory);
  const [metric, setMetric] = useState(initialMetric);
  const [entries, setEntries] = useState(initialEntries);
  const [isPending, startTransition] = useTransition();

  // 카테고리에서 첫 번째 메트릭 키 가져오기
  const getDefaultMetric = useCallback(
    (cat: ScoutlabCategory) => {
      if (!sampleMetrics) return "";
      const prop = CATEGORY_PROP_MAP[cat];
      const catMetrics = sampleMetrics[prop] as ScoutlabCategoryMetrics;
      const keys = catMetrics ? Object.keys(catMetrics) : [];
      return keys[0] ?? "";
    },
    [sampleMetrics],
  );

  const handleCategoryChange = (newCategory: ScoutlabCategory) => {
    setCategory(newCategory);
    setMetric(getDefaultMetric(newCategory));
  };

  // 메트릭 라벨
  const metricLabel = useMemo(() => formatMetricLabel(metric), [metric]);

  // 카테고리/메트릭/리그 변경 시 서버에서 랭킹 데이터 재조회
  useEffect(() => {
    if (!metric) return;

    startTransition(async () => {
      try {
        const params = new URLSearchParams({
          category,
          metric,
        });
        if (league) params.set("league", league);

        const response = await fetch(`/api/scoutlab/ranking?${params}`);
        if (response.ok) {
          const data = await response.json();
          setEntries(data);
        }
      } catch {
        // 에러 시 기존 데이터 유지
      }
    });
  }, [category, metric, league]);

  return (
    <div className="space-y-4">
      <RankingFilterPanel
        sampleMetrics={sampleMetrics}
        selectedCategory={category}
        selectedMetric={metric}
        onCategoryChange={handleCategoryChange}
        onMetricChange={setMetric}
      />

      <div className={isPending ? "opacity-50 transition-opacity" : ""}>
        <RankingTable
          entries={entries}
          metricLabel={metricLabel}
          metricKey={metric}
        />
      </div>
    </div>
  );
}
