// ScoutLab Scatter — recharts ScatterChart (Client Component)
"use client";

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import type { ScoutlabLeague, ScoutlabScatterPoint } from "@/types";

import {
  COMIC_AXIS_LABEL_STYLE,
  COMIC_GRID_PROPS,
  COMIC_TICK_STYLE,
} from "../_lib/chart-theme";
import { ChartComicTooltipShell } from "./chart-comic-tooltip";

interface ScatterPlotProps {
  data: ScoutlabScatterPoint[];
  xLabel: string;
  yLabel: string;
}

// 리그별 색상 매핑
const LEAGUE_COLORS: Record<ScoutlabLeague, string> = {
  "Premier League": "var(--color-comic-skyblue)",
  "La Liga": "var(--color-comic-yellow)",
  "Serie A": "var(--color-comic-green)",
  Bundesliga: "var(--color-comic-pink)",
  "Ligue 1": "var(--color-comic-black)",
};

const LEAGUE_KEYS: ScoutlabLeague[] = [
  "Premier League",
  "La Liga",
  "Serie A",
  "Bundesliga",
  "Ligue 1",
];

/** 커스텀 Tooltip */
function ScatterTooltip({
  active,
  payload,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
}) {
  if (!active || !payload?.[0]) return null;
  const point = payload[0].payload as ScoutlabScatterPoint;

  return (
    <ChartComicTooltipShell>
      <p className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-body-lg)] text-comic-black">
        {point.name}
      </p>
      <p className="text-comic-black/60">{point.team}</p>
      <p className="text-comic-black/60">
        x: {point.x.toFixed(2)} / y: {point.y.toFixed(2)}
      </p>
    </ChartComicTooltipShell>
  );
}

export function ScatterPlot({ data, xLabel, yLabel }: ScatterPlotProps) {
  // 리그별 데이터 분리
  const leagueData = LEAGUE_KEYS.reduce(
    (acc, league) => {
      acc[league] = data.filter((p) => p.league === league);
      return acc;
    },
    {} as Record<ScoutlabLeague, ScoutlabScatterPoint[]>,
  );

  return (
    <div
      data-testid="scatter-plot"
      className="rounded-[var(--comic-panel-radius)] paper-texture p-2"
    >
      <ResponsiveContainer width="100%" height={450}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
          <CartesianGrid {...COMIC_GRID_PROPS} />
          <XAxis
            dataKey="x"
            type="number"
            name={xLabel}
            tick={COMIC_TICK_STYLE}
            label={{
              value: xLabel,
              position: "bottom",
              offset: 10,
              ...COMIC_AXIS_LABEL_STYLE,
            }}
          />
          <YAxis
            dataKey="y"
            type="number"
            name={yLabel}
            tick={COMIC_TICK_STYLE}
            label={{
              value: yLabel,
              angle: -90,
              position: "insideLeft",
              offset: 0,
              ...COMIC_AXIS_LABEL_STYLE,
            }}
          />
          <ZAxis range={[30, 30]} />
          <Tooltip content={<ScatterTooltip />} />

          {LEAGUE_KEYS.map((league) =>
            leagueData[league].length > 0 ? (
              <Scatter
                key={league}
                name={league}
                data={leagueData[league]}
                fill={LEAGUE_COLORS[league]}
                fillOpacity={0.7}
              />
            ) : null,
          )}
        </ScatterChart>
      </ResponsiveContainer>

      {/* 리그 범례 */}
      <div className="mt-2 flex flex-wrap justify-center gap-4">
        {LEAGUE_KEYS.map((league) => (
          <span
            key={league}
            className="flex items-center gap-1.5 font-[family-name:var(--font-permanent-marker)] text-xs text-comic-black/70"
          >
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ backgroundColor: LEAGUE_COLORS[league] }}
            />
            {league}
          </span>
        ))}
      </div>
    </div>
  );
}
