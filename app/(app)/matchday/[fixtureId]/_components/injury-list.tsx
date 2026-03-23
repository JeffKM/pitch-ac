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
      <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/50">
        {teamName}
      </p>
      {injuries.length === 0 ? (
        <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)] text-comic-black/50">
          No injuries
        </p>
      ) : (
        <ul className="space-y-1.5">
          {injuries.map((player) => (
            <li key={player.playerId} className="flex items-start gap-1.5">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-comic-red" />
              <div className="min-w-0">
                <PlayerNameLink
                  playerId={player.playerId}
                  playerName={player.playerName}
                  className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)]"
                />
                <p className="font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-xs)] text-comic-black/50">
                  {player.reason}
                </p>
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Injuries</CardTitle>
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
