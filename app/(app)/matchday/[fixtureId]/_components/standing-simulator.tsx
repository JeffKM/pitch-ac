"use client";

// 순위 시뮬레이터 — 승/무/패 선택 시 예상 포인트 변화 표시

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TeamStanding } from "@/types";

type Scenario = "home_win" | "draw" | "away_win" | null;

interface StandingSimulatorProps {
  homeTeamName: string;
  awayTeamName: string;
  homeStanding: TeamStanding;
  awayStanding: TeamStanding;
}

const SCENARIO_LABELS = {
  home_win: "홈팀 승",
  draw: "무승부",
  away_win: "원정팀 승",
} as const;

function getPointsDelta(
  scenario: Scenario,
): { home: number; away: number } | null {
  if (!scenario) return null;
  if (scenario === "home_win") return { home: 3, away: 0 };
  if (scenario === "draw") return { home: 1, away: 1 };
  return { home: 0, away: 3 };
}

export function StandingSimulator({
  homeTeamName,
  awayTeamName,
  homeStanding,
  awayStanding,
}: StandingSimulatorProps) {
  const [scenario, setScenario] = useState<Scenario>(null);
  const delta = getPointsDelta(scenario);

  return (
    <Card className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-white">
      <CardHeader className="pb-2">
        <CardTitle className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-sm)] text-comic-black">
          순위 시뮬레이터
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 시나리오 선택 버튼 */}
        <div className="flex gap-2">
          {(["home_win", "draw", "away_win"] as const).map((s) => (
            <Button
              key={s}
              variant={scenario === s ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setScenario((prev) => (prev === s ? null : s))}
            >
              {SCENARIO_LABELS[s]}
            </Button>
          ))}
        </div>

        {/* 결과 표시 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{homeTeamName}</p>
            <p className="font-medium">
              현재 <span className="font-bold">{homeStanding.points}pts</span>
            </p>
            {delta && (
              <p className="text-green-600 dark:text-green-400">
                +{delta.home}pts →{" "}
                <span className="font-bold">
                  {homeStanding.points + delta.home}pts
                </span>
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              현재 {homeStanding.position}위
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{awayTeamName}</p>
            <p className="font-medium">
              현재 <span className="font-bold">{awayStanding.points}pts</span>
            </p>
            {delta && (
              <p className="text-green-600 dark:text-green-400">
                +{delta.away}pts →{" "}
                <span className="font-bold">
                  {awayStanding.points + delta.away}pts
                </span>
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              현재 {awayStanding.position}위
            </p>
          </div>
        </div>

        {!delta && (
          <p className="text-center text-xs text-muted-foreground">
            시나리오를 선택하면 예상 포인트를 확인할 수 있습니다.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
