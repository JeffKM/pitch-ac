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

import { formatMetricValue } from "../_lib/format-metric";

interface ProgressionDataPoint {
  season: string;
  value: number;
  percentile: number;
}

interface ProgressionChartProps {
  data: ProgressionDataPoint[];
  metricLabel: string;
}

export function ProgressionChart({ data, metricLabel }: ProgressionChartProps) {
  return (
    <div data-testid="progression-chart">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-comic-black)"
            strokeOpacity={0.1}
          />
          <XAxis
            dataKey="season"
            tick={{ fontSize: 12, fill: "var(--color-comic-black)" }}
          />
          <YAxis tick={{ fontSize: 11, fill: "var(--color-comic-black)" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-comic-white)",
              border: "1px solid var(--color-comic-black)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(val) => [formatMetricValue(Number(val)), metricLabel]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--color-comic-skyblue)"
            strokeWidth={2.5}
            dot={{
              r: 5,
              fill: "var(--color-comic-skyblue)",
              stroke: "var(--color-comic-white)",
              strokeWidth: 2,
            }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
