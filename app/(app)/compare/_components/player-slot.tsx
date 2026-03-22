"use client";

// 선수 선택 슬롯 — 미선택 시 검색창, 선택 시 미니 프로필 카드

import { X } from "lucide-react";
import Image from "next/image";

import { PlayerSearchCombobox } from "@/components/player-search-combobox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Player, Team } from "@/types";

interface PlayerSlotProps {
  label: string;
  player: Player | undefined;
  team: Team | undefined;
  allPlayers: Player[];
  teams: Team[];
  onSelect: (player: Player) => void;
  onClear: () => void;
  colorClass: string;
}

export function PlayerSlot({
  label,
  player,
  team,
  allPlayers,
  teams,
  onSelect,
  onClear,
  colorClass,
}: PlayerSlotProps) {
  return (
    <Card className="rounded-[var(--comic-panel-radius)] border-[var(--comic-border-width)] border-comic-black bg-comic-white">
      <CardHeader className="pb-2">
        <CardTitle
          className={cn(
            "font-[family-name:var(--font-bangers)] text-[length:var(--comic-text-sm)]",
            colorClass,
          )}
        >
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {player ? (
          // 선수 선택됨 — 미니 프로필 카드
          <div className="flex items-center gap-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-full ring-1 ring-border">
              <Image
                src={player.photoUrl}
                alt={player.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{player.name}</p>
              <p className="text-xs text-muted-foreground">
                {team?.shortName ?? String(player.teamId)} · {player.position}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              className="shrink-0"
              aria-label={`${player.name} 선택 해제`}
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          // 선수 미선택 — 검색 콤보박스
          <PlayerSearchCombobox
            players={allPlayers}
            teams={teams}
            onSelect={onSelect}
            placeholder={`${label} 검색...`}
          />
        )}
      </CardContent>
    </Card>
  );
}
