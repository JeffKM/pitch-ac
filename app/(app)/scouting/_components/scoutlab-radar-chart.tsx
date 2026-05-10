// ScoutLab 레이더 차트 — recharts RadarChart (Client Component)
"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { ScoutlabRadarAxis } from "@/types";

interface ScoutlabRadarChartProps {
  axes: ScoutlabRadarAxis[];
  /** 비교 모드: 두 번째 선수 축 데이터 */
  compareAxes?: ScoutlabRadarAxis[];
  compareName?: string;
  playerName?: string;
}

export function ScoutlabRadarChart({
  axes,
  compareAxes,
  compareName,
  playerName,
}: ScoutlabRadarChartProps) {
  // 데이터를 recharts 형식으로 변환
  const data = axes.map((axis, i) => ({
    label: axis.label,
    value: axis.percentile,
    compareValue: compareAxes?.[i]?.percentile ?? 0,
  }));

  return (
    <div data-testid="scoutlab-radar-chart">
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="var(--color-comic-black)" strokeOpacity={0.15} />
          <PolarAngleAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--color-comic-black)" }}
          />
          <PolarRadiusAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "var(--color-comic-black)" }}
            tickCount={5}
            axisLine={false}
          />

          {/* 비교 선수 레이더 (있으면 먼저 렌더) */}
          {compareAxes && (
            <Radar
              name={compareName ?? "Compare"}
              dataKey="compareValue"
              stroke="var(--color-comic-pink)"
              fill="var(--color-comic-pink)"
              fillOpacity={0.15}
              strokeWidth={2}
            />
          )}

          {/* 메인 선수 레이더 */}
          <Radar
            name={playerName ?? "Player"}
            dataKey="value"
            stroke="var(--color-comic-skyblue)"
            fill="var(--color-comic-skyblue)"
            fillOpacity={0.25}
            strokeWidth={2}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-comic-white)",
              border: "1px solid var(--color-comic-black)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(val) => [`${val}%`, "백분위"]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
