// ScoutLab Compare — 비교 선수 검색 Combobox (Client)
"use client";

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
import type { ScoutlabPlayer } from "@/types";

import { useScoutlabParams } from "../_lib/use-scoutlab-params";

interface ScoutlabCompareSearchProps {
  players: ScoutlabPlayer[];
}

export function ScoutlabCompareSearch({ players }: ScoutlabCompareSearchProps) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const { setParams } = useScoutlabParams();

  const handleSelect = useCallback(
    (id: number) => {
      startTransition(() => {
        setParams({ compareId: id });
      });
      setOpen(false);
    },
    [setParams],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[220px] justify-between border-comic-black/20 bg-comic-white text-sm"
        >
          <span className="flex items-center gap-2 text-comic-black/50">
            <Search className="size-3.5" />
            비교 선수 검색...
          </span>
          <ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <Command>
          <CommandInput placeholder="선수 이름..." />
          <CommandList>
            <CommandEmpty>결과 없음</CommandEmpty>
            <CommandGroup>
              {players.map((player) => (
                <CommandItem
                  key={player.id}
                  value={`${player.name} ${player.team}`}
                  onSelect={() => handleSelect(player.id)}
                >
                  <Check className="mr-2 size-3.5 opacity-0" />
                  <span className="flex-1 truncate text-sm">{player.name}</span>
                  <span className="text-xs text-comic-black/40">
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
