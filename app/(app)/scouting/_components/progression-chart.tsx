// ScoutLab 시즌 추이 라인 차트 (Client Component)
"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  COMIC_COLORS,
  COMIC_GRID_PROPS,
  COMIC_TICK_STYLE,
} from "../_lib/chart-theme";
import { formatMetricValue } from "../_lib/format-metric";
import { ChartComicTooltipShell } from "./chart-comic-tooltip";

interface ProgressionDataPoint {
  season: string;
  value: number;
  percentile: number;
}

interface ProgressionChartProps {
  data: ProgressionDataPoint[];
  metricLabel: string;
}

/** 커스텀 Tooltip content */
function ProgressionTooltip({
  active,
  payload,
  metricLabel,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  metricLabel: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as ProgressionDataPoint;

  return (
    <ChartComicTooltipShell>
      <p className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-body-lg)] text-comic-black">
        {point.season}
      </p>
      <p className="text-comic-black/70">
        {metricLabel}: {formatMetricValue(point.value)}
      </p>
      <p className="text-comic-black/50">백분위: {point.percentile}%</p>
    </ChartComicTooltipShell>
  );
}

export function ProgressionChart({ data, metricLabel }: ProgressionChartProps) {
  return (
    <div
      data-testid="progression-chart"
      className="rounded-[var(--comic-panel-radius)] paper-texture p-2"
    >
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid {...COMIC_GRID_PROPS} />
          <XAxis
            dataKey="season"
            tick={{ ...COMIC_TICK_STYLE, fontSize: 12 }}
          />
          <YAxis tick={COMIC_TICK_STYLE} />
          <Tooltip content={<ProgressionTooltip metricLabel={metricLabel} />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={COMIC_COLORS.skyblue}
            strokeWidth={3}
            dot={{
              r: 6,
              fill: COMIC_COLORS.skyblue,
              stroke: COMIC_COLORS.black,
              strokeWidth: 2,
            }}
            activeDot={{
              r: 8,
              fill: COMIC_COLORS.yellow,
              stroke: COMIC_COLORS.black,
              strokeWidth: 3,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
