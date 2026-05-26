"use client";

// ScoutLab 선수 검색 Combobox

import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useCallback, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ScoutlabPlayer } from "@/types";

import { positionToComparisonPosition } from "../_lib/scoutlab-constants";
import { useScoutlabParams } from "../_lib/use-scoutlab-params";

interface ScoutlabPlayerSearchProps {
  players: ScoutlabPlayer[];
  selectedPlayer: ScoutlabPlayer | null;
}

export function ScoutlabPlayerSearch({
  players,
  selectedPlayer,
}: ScoutlabPlayerSearchProps) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const { setParams } = useScoutlabParams();

  const handleSelect = useCallback(
    (id: number) => {
      const player = players.find((p) => p.id === id);
      const comparisonPosition = player
        ? positionToComparisonPosition(player.position)
        : undefined;
      startTransition(() => {
        setParams({ playerId: id, comparisonPosition });
      });
      setOpen(false);
    },
    [players, setParams],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[280px] justify-between border-comic-black/20 bg-comic-white font-[family-name:var(--font-permanent-marker)] text-[length:var(--comic-body-base)]"
        >
          {selectedPlayer ? (
            <span className="truncate">
              {selectedPlayer.name}{" "}
              <span className="text-comic-black/40">
                ({selectedPlayer.team})
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-2 text-comic-black/50">
              <Search className="size-4" />
              선수 검색...
            </span>
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder="선수 이름 검색..." />
          <CommandList>
            <CommandEmpty>결과 없음</CommandEmpty>
            <CommandGroup>
              {players.map((player) => (
                <CommandItem
                  key={player.id}
                  value={`${player.name} ${player.team}`}
                  onSelect={() => handleSelect(player.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      selectedPlayer?.id === player.id
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <span className="flex-1 truncate">{player.name}</span>
                  <span className="text-[length:var(--comic-body-xs)] text-comic-black/40">
                    {player.team}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
