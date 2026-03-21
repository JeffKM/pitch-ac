"use client";

// 선수 능력치 레이더 차트 — 프로필 모드(선수 vs 포지션 평균), 비교 모드(선수 vs 선수)

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RadarData, RadarDataPoint, RadarDimension } from "@/types";

// 차원별 한국어 레이블 매핑
const DIMENSION_LABELS: Record<RadarDimension, string> = {
  pace: "스피드",
  shooting: "슈팅",
  passing: "패스",
  dribbling: "드리블",
  defending: "수비",
  physical: "피지컬",
};

// 프로필 모드용 차트 데이터 포인트
interface ProfileChartDataPoint {
  dimension: string;
  label: string;
  player: number;
  positionAvg: number;
}

// 비교 모드용 차트 데이터 포인트
interface CompareChartDataPoint {
  dimension: string;
  label: string;
  player1: number;
  player2: number;
}

// 프로필 모드: 선수 1명 vs 포지션 평균
interface ProfileModeProps {
  mode: "profile";
  radarData: RadarData;
  playerName: string;
}

// 비교 모드: 선수 2명 직접 비교
interface CompareModeProps {
  mode: "compare";
  player1: { name: string; data: RadarDataPoint[] };
  player2: { name: string; data: RadarDataPoint[] };
}

export type PlayerRadarChartProps = ProfileModeProps | CompareModeProps;

function toProfileChartData(radarData: RadarData): ProfileChartDataPoint[] {
  const minLen = Math.min(
    radarData.player.length,
    radarData.positionAverage.length,
  );
  return radarData.player.slice(0, minLen).map((p, i) => ({
    dimension: p.dimension,
    label: p.label,
    player: p.value,
    positionAvg: radarData.positionAverage[i].value,
  }));
}

function toCompareChartData(
  data1: RadarDataPoint[],
  data2: RadarDataPoint[],
): CompareChartDataPoint[] {
  const minLen = Math.min(data1.length, data2.length);
  return data1.slice(0, minLen).map((p, i) => ({
    dimension: p.dimension,
    label: p.label,
    player1: p.value,
    player2: data2[i].value,
  }));
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function RadarTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border bg-popover p-2 text-xs shadow-md">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((entry) => (
        <p
          key={entry.name}
          className="tabular-nums"
          style={{ color: entry.color }}
        >
          {entry.name}:{" "}
          <span className="font-semibold text-foreground">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

interface StrengthWeaknessLabelsProps {
  radarData: RadarData;
}

function StrengthWeaknessLabels({ radarData }: StrengthWeaknessLabelsProps) {
  return (
    <div className="mt-4 space-y-2">
      <div className="flex flex-wrap gap-1.5" data-testid="strength-labels">
        {radarData.strengths.map((dim) => (
          <Badge
            key={dim}
            className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
          >
            강점: {DIMENSION_LABELS[dim]}
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5" data-testid="weakness-labels">
        {radarData.weaknesses.map((dim) => (
          <Badge key={dim} variant="outline" className="text-destructive">
            약점: {DIMENSION_LABELS[dim]}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function PlayerRadarChart(props: PlayerRadarChartProps) {
  const isProfile = props.mode === "profile";

  // 차트 데이터 및 레이블 구성 (recharts가 union 타입을 처리할 수 있도록 unknown 경유 타입 단언)
  const chartData = (isProfile
    ? toProfileChartData(props.radarData)
    : toCompareChartData(
        props.player1.data,
        props.player2.data,
      )) as unknown as Record<string, unknown>[];

  const dataset1Name = isProfile ? props.playerName : props.player1.name;
  const dataset2Name = isProfile ? "포지션 평균" : props.player2.name;
  const dataset1Key = isProfile ? "player" : "player1";
  const dataset2Key = isProfile ? "positionAvg" : "player2";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          {isProfile ? "능력치 레이더" : "능력치 비교"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 반응형 높이: 모바일 250px → 태블릿 300px → 데스크탑 350px */}
        <div
          className="h-[250px] sm:h-[300px] lg:h-[350px]"
          data-testid="radar-chart-container"
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="var(--border)" strokeOpacity={0.6} />
              <PolarAngleAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />

              {/* 뒤쪽 레이어: 포지션 평균 또는 player2 */}
              <Radar
                name={dataset2Name}
                dataKey={dataset2Key}
                stroke="var(--chart-2)"
                fill="var(--chart-2)"
                fillOpacity={0.15}
                strokeWidth={1.5}
                dot={false}
              />

              {/* 앞쪽 레이어: 선수 본인 또는 player1 */}
              <Radar
                name={dataset1Name}
                dataKey={dataset1Key}
                stroke="var(--chart-1)"
                fill="var(--chart-1)"
                fillOpacity={0.25}
                strokeWidth={2}
                dot={{ r: 3, fill: "var(--chart-1)", strokeWidth: 0 }}
              />

              <Tooltip content={<RadarTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: "8px" }}
                iconType="circle"
                iconSize={8}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 강점/약점 라벨 — 프로필 모드에서만 표시 */}
        {isProfile && <StrengthWeaknessLabels radarData={props.radarData} />}
      </CardContent>
    </Card>
  );
}
