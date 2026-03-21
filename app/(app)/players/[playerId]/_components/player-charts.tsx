"use client";

// 차트 컴포넌트 동적 로딩 래퍼 — recharts를 초기 번들에서 분리하기 위한 Client Component

import dynamic from "next/dynamic";

export const PlayerRadarChart = dynamic(
  () =>
    import("@/components/charts/player-radar-chart").then(
      (m) => m.PlayerRadarChart,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] animate-pulse rounded-xl border bg-muted" />
    ),
  },
);

export const RecentFormSparkline = dynamic(
  () => import("./recent-form-sparkline").then((m) => m.RecentFormSparkline),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border bg-card p-6">
        <div className="mb-4 h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-[120px] animate-pulse rounded bg-muted" />
      </div>
    ),
  },
);
