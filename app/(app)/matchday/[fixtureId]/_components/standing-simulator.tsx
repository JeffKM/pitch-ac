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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>순위 시뮬레이터</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div className="grid grid-cols-2 gap-4 font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)]">
          <div className="space-y-1">
            <p className="text-[length:var(--comic-body-xs)] text-comic-black/50">
              {homeTeamName}
            </p>
            <p>
              현재{" "}
              <span className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-sm)]">
                {homeStanding.points}pts
              </span>
            </p>
            {delta && (
              <p className="text-comic-green">
                +{delta.home}pts →{" "}
                <span className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-sm)]">
                  {homeStanding.points + delta.home}pts
                </span>
              </p>
            )}
            <p className="text-[length:var(--comic-body-xs)] text-comic-black/50">
              현재 {homeStanding.position}위
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[length:var(--comic-body-xs)] text-comic-black/50">
              {awayTeamName}
            </p>
            <p>
              현재{" "}
              <span className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-sm)]">
                {awayStanding.points}pts
              </span>
            </p>
            {delta && (
              <p className="text-comic-green">
                +{delta.away}pts →{" "}
                <span className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-sm)]">
                  {awayStanding.points + delta.away}pts
                </span>
              </p>
            )}
            <p className="text-[length:var(--comic-body-xs)] text-comic-black/50">
              현재 {awayStanding.position}위
            </p>
          </div>
        </div>

        {!delta && (
          <p className="text-center font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/50">
            시나리오를 선택하면 예상 포인트를 확인할 수 있습니다.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
