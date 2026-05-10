// ScoutLab 차트 dynamic import 래퍼 (Client Component, SSR 비활성화)
"use client";

import dynamic from "next/dynamic";

const ChartSpinner = () => (
  <div className="flex h-[400px] items-center justify-center">
    <div className="size-8 animate-spin rounded-full border-4 border-comic-skyblue border-t-transparent" />
  </div>
);

export const DynamicRadarChart = dynamic(
  () =>
    import("./scoutlab-radar-chart").then((mod) => ({
      default: mod.ScoutlabRadarChart,
    })),
  { ssr: false, loading: ChartSpinner },
);

export const DynamicProgressionChart = dynamic(
  () =>
    import("./progression-chart").then((mod) => ({
      default: mod.ProgressionChart,
    })),
  { ssr: false, loading: ChartSpinner },
);

export const DynamicScatterPlot = dynamic(
  () =>
    import("./scatter-plot").then((mod) => ({
      default: mod.ScatterPlot,
    })),
  { ssr: false, loading: ChartSpinner },
);
