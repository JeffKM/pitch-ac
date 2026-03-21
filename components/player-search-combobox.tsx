"use client";

import { Clock, Search, UserSearch } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Player } from "@/types/player";
import type { Team } from "@/types/team";

import { Button } from "./ui/button";

interface PlayerSearchComboboxProps {
  players: Player[];
  teams: Team[];
  /** 선수 선택 시 호출 */
  onSelect: (player: Player) => void;
  /** Enter 키 또는 전체 검색 시 호출 */
  onSearch?: (query: string) => void;
  placeholder?: string;
  recentSearches?: string[];
  /** 최근 검색어 항목 클릭 시 호출 */
  onRecentClick?: (term: string) => void;
}

export function PlayerSearchCombobox({
  players,
  teams,
  onSelect,
  onSearch,
  placeholder = "선수 이름, 팀, 포지션으로 검색...",
  recentSearches = [],
  onRecentClick,
}: PlayerSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const getTeam = (teamId: number) => teams.find((t) => t.id === teamId);

  const handleSelect = (player: Player) => {
    onSelect(player);
    setInputValue("");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() && onSearch) {
      onSearch(inputValue.trim());
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-10 w-full justify-start gap-2 text-muted-foreground"
          onClick={() => setOpen(true)}
        >
          <Search className="size-4 shrink-0" />
          <span className="truncate">{placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <Command>
          <CommandInput
            ref={inputRef}
            placeholder={placeholder}
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={handleKeyDown}
          />
          <CommandList>
            <CommandEmpty>
              <div className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
                <UserSearch className="size-6" />
                <p className="text-sm">결과 없음</p>
              </div>
            </CommandEmpty>

            {/* 최근 검색어 — 입력 없을 때만 표시 */}
            {recentSearches.length > 0 && !inputValue && (
              <>
                <CommandGroup heading="최근 검색어">
                  {recentSearches.map((term) => (
                    <CommandItem
                      key={term}
                      value={`__recent__${term}`}
                      onSelect={() => {
                        onRecentClick?.(term);
                        setOpen(false);
                      }}
                    >
                      <Clock className="mr-2 size-3.5 text-muted-foreground" />
                      {term}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {/* 선수 목록 */}
            <CommandGroup heading="선수">
              {players.map((player) => {
                const team = getTeam(player.teamId);
                return (
                  <CommandItem
                    key={player.id}
                    // cmdk 내장 필터가 이 value로 fuzzy 검색
                    value={`${player.name} ${team?.name ?? ""} ${team?.shortName ?? ""} ${player.position} ${player.nationality}`}
                    onSelect={() => handleSelect(player)}
                  >
                    <Image
                      src={player.photoUrl}
                      alt={player.name}
                      width={32}
                      height={32}
                      className="size-8 shrink-0 rounded-full object-cover"
                      unoptimized
                    />
                    <div className="ml-2 min-w-0">
                      <p className="truncate font-medium">{player.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {team?.shortName ?? player.teamId} · {player.position}
                      </p>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
