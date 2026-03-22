"use client";

// 최근 경기 폼 스파크라인 차트

import { TrendingDown, TrendingUp } from "lucide-react";
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlayerMatchStats } from "@/types";

interface RecentFormSparklineProps {
  matchStats: PlayerMatchStats[];
}

interface ChartDataPoint {
  match: string;
  rating: number;
  goals: number;
  assists: number;
}

function prepareChartData(stats: PlayerMatchStats[]): ChartDataPoint[] {
  return [...stats]
    .sort((a, b) => a.fixtureId - b.fixtureId)
    .slice(-10)
    .map((s, i) => ({
      match: `M${i + 1}`,
      rating: s.rating,
      goals: s.goals,
      assists: s.assists,
    }));
}

function calculateTrend(data: ChartDataPoint[]): {
  direction: "up" | "down" | "stable";
  text: string;
} {
  if (data.length < 4) return { direction: "stable", text: "데이터 부족" };

  const mid = Math.floor(data.length / 2);
  const avg = (arr: ChartDataPoint[]) =>
    arr.reduce((sum, d) => sum + d.rating, 0) / arr.length;

  const diff = avg(data.slice(mid)) - avg(data.slice(0, mid));

  if (diff > 0.2)
    return { direction: "up", text: `상승세 (+${diff.toFixed(1)})` };
  if (diff < -0.2)
    return { direction: "down", text: `하락세 (${diff.toFixed(1)})` };
  return { direction: "stable", text: "폼 유지" };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: ChartDataPoint }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  return (
    <div className="rounded-md border bg-popover p-2 text-xs shadow-md">
      <p className="font-medium">{label}</p>
      <p className="tabular-nums">
        평점: <span className="font-semibold">{data.rating.toFixed(1)}</span>
      </p>
      {data.goals > 0 && (
        <p className="text-muted-foreground">골 {data.goals}</p>
      )}
      {data.assists > 0 && (
        <p className="text-muted-foreground">어시스트 {data.assists}</p>
      )}
    </div>
  );
}

export function RecentFormSparkline({ matchStats }: RecentFormSparklineProps) {
  const chartData = prepareChartData(matchStats);
  const trend = calculateTrend(chartData);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            최근 폼 ({chartData.length}경기)
          </CardTitle>
          <Badge
            variant={
              trend.direction === "up"
                ? "default"
                : trend.direction === "down"
                  ? "destructive"
                  : "secondary"
            }
            className="gap-1"
          >
            {trend.direction === "up" && <TrendingUp className="size-3" />}
            {trend.direction === "down" && <TrendingDown className="size-3" />}
            {trend.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart
            data={chartData}
            margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
          >
            <XAxis
              dataKey="match"
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[
                (dataMin: number) => Math.max(0, Math.floor(dataMin) - 1),
                (dataMax: number) => Math.min(10, Math.ceil(dataMax) + 1),
              ]}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              tickCount={3}
            />
            <ReferenceLine
              y={7}
              stroke="var(--muted-foreground)"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="rating"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--primary)", strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
