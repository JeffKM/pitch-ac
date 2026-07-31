"use client";

// ScoutLab 글로벌 선수 검색 — 리그/팀 필터 연동

import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, X } from "lucide-react";
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
import type { ScoutlabComparisonPosition } from "@/types";

import { positionToComparisonPosition } from "../_lib/scoutlab-constants";
import { useDebouncedValue } from "../_lib/use-debounced-value";
import { useScoutlabParams } from "../_lib/use-scoutlab-params";
import {
  type PlayerSearchResult,
  scoutlabPlayerQueryKey,
  useScoutlabPlayerById,
  useScoutlabPlayerSearch,
} from "../_lib/use-scoutlab-player-search";

export function ScoutlabGlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();
  const { playerId, season, league, team, setParams } = useScoutlabParams();
  const queryClient = useQueryClient();

  // 디바운스된 검색어를 queryKey에 넣어 타이핑 중 요청을 억제
  const debouncedQuery = useDebouncedValue(query);
  // 2자 미만 검색어는 서버가 무시하므로 빈 문자열로 정규화 (캐시 키 중복 방지)
  const effectiveQuery = debouncedQuery.length >= 2 ? debouncedQuery : "";

  // 팀/리그가 선택된 경우에는 빈 검색어도 허용 (필터링용 후보 목록)
  const hasFilter = !!team || !!league;
  const searchEnabled = open && (effectiveQuery !== "" || hasFilter);

  const { data: searchData, isFetching } = useScoutlabPlayerSearch(
    { query: effectiveQuery, season, league, team },
    { enabled: searchEnabled },
  );
  const results = searchEnabled ? (searchData ?? []) : [];

  // 선택된 선수: 검색 결과에 있으면 그대로 쓰고, 없을 때만 단건 조회
  const playerFromResults = results.find((r) => r.id === playerId) ?? null;
  const { data: fetchedPlayer } = useScoutlabPlayerById(playerId, season, {
    enabled: playerFromResults === null,
  });
  const selectedPlayer = playerFromResults ?? fetchedPlayer ?? null;

  const handleSelect = useCallback(
    (player: PlayerSearchResult) => {
      // 단건 조회 캐시를 미리 채워 팝오버가 닫힌 뒤 재조회가 발생하지 않게 한다
      queryClient.setQueryData(
        scoutlabPlayerQueryKey(player.id, season),
        player,
      );
      const comparisonPosition: ScoutlabComparisonPosition =
        positionToComparisonPosition(player.position);
      startTransition(() => {
        setParams({ playerId: player.id, comparisonPosition });
      });
      setOpen(false);
      setQuery("");
    },
    [queryClient, season, setParams],
  );

  const handleClear = useCallback(() => {
    startTransition(() => {
      setParams({ playerId: null });
    });
  }, [setParams]);

  const loading = searchEnabled && (isFetching || query !== debouncedQuery);
  const showEmpty =
    !loading && results.length === 0 && (query.length >= 2 || hasFilter);

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[220px] justify-between border-comic-black/20 bg-comic-white text-sm"
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
                <Search className="size-3.5" />
                {team ? `${team} 선수...` : "선수 검색..."}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={team ? `${team} 선수 검색...` : "선수 이름 검색..."}
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {loading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="size-4 animate-spin text-comic-black/40" />
                </div>
              )}
              {showEmpty && <CommandEmpty>결과 없음</CommandEmpty>}
              {!loading && results.length > 0 && (
                <CommandGroup>
                  {results.map((player) => (
                    <CommandItem
                      key={player.id}
                      value={String(player.id)}
                      onSelect={() => handleSelect(player)}
                    >
                      <span className="flex-1 truncate">{player.name}</span>
                      <span className="text-xs text-comic-black/40">
                        {player.team}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedPlayer && (
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-comic-black/40 hover:text-comic-black"
          onClick={handleClear}
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
