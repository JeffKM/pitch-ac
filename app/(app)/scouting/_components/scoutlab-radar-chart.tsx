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

import { COMIC_FONTS, COMIC_TICK_STYLE } from "../_lib/chart-theme";
import { ChartComicTooltipShell } from "./chart-comic-tooltip";

interface ScoutlabRadarChartProps {
  axes: ScoutlabRadarAxis[];
  /** 비교 모드: 두 번째 선수 축 데이터 */
  compareAxes?: ScoutlabRadarAxis[];
  compareName?: string;
  playerName?: string;
}

/** 커스텀 Tooltip content */
function RadarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
}) {
  if (!active || !payload?.length) return null;

  const label = payload[0]?.payload?.label as string | undefined;

  return (
    <ChartComicTooltipShell>
      {label && (
        <p className="mb-0.5 font-[family-name:var(--font-bangers)] text-[length:var(--comic-body-lg)]">
          {label}
        </p>
      )}
      {payload.map((entry, i) => (
        <p key={i} className="text-comic-black/70">
          {entry.name}: {entry.value}%
        </p>
      ))}
    </ChartComicTooltipShell>
  );
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
    <div
      data-testid="scoutlab-radar-chart"
      className="rounded-[var(--comic-panel-radius)] paper-texture p-2"
    >
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="var(--color-comic-black)" strokeOpacity={0.15} />
          <PolarAngleAxis
            dataKey="label"
            tick={{
              ...COMIC_TICK_STYLE,
              fontFamily: COMIC_FONTS.heading,
            }}
          />
          <PolarRadiusAxis
            domain={[0, 100]}
            tick={{
              ...COMIC_TICK_STYLE,
              fontSize: 10,
              fontFamily: COMIC_FONTS.ui,
            }}
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

          <Tooltip content={<RadarTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
