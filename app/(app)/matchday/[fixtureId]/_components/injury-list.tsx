// 양팀 부상/결장 선수 목록

import { AlertCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InjuredPlayer } from "@/types";

import { PlayerNameLink } from "./player-name-link";

interface InjuryListProps {
  homeTeamName: string;
  awayTeamName: string;
  homeInjuries: InjuredPlayer[];
  awayInjuries: InjuredPlayer[];
}

function TeamInjuries({
  teamName,
  injuries,
}: {
  teamName: string;
  injuries: InjuredPlayer[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{teamName}</p>
      {injuries.length === 0 ? (
        <p className="text-sm text-muted-foreground">부상자 없음</p>
      ) : (
        <ul className="space-y-1.5">
          {injuries.map((player) => (
            <li key={player.playerId} className="flex items-start gap-1.5">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-red-500" />
              <div className="min-w-0">
                <PlayerNameLink
                  playerId={player.playerId}
                  playerName={player.playerName}
                  className="text-sm font-medium"
                />
                <p className="text-xs text-muted-foreground">{player.reason}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function InjuryList({
  homeTeamName,
  awayTeamName,
  homeInjuries,
  awayInjuries,
}: InjuryListProps) {
  return (
    <Card className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-white">
      <CardHeader className="pb-2">
        <CardTitle className="font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-sm)] text-comic-black">
          부상/결장
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <TeamInjuries teamName={homeTeamName} injuries={homeInjuries} />
          <TeamInjuries teamName={awayTeamName} injuries={awayInjuries} />
        </div>
      </CardContent>
    </Card>
  );
}
