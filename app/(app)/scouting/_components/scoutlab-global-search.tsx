"use client";

// ScoutLab 글로벌 선수 검색 — 리그/팀 필터 연동

import { Loader2, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

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
import type { ScoutlabComparisonPosition, ScoutlabPosition } from "@/types";

import { positionToComparisonPosition } from "../_lib/scoutlab-constants";
import { useScoutlabParams } from "../_lib/use-scoutlab-params";

interface SearchResult {
  id: number;
  name: string;
  team: string;
  league: string;
  position: ScoutlabPosition;
}

export function ScoutlabGlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();
  const { playerId, season, league, team, setParams } = useScoutlabParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // 현재 선택된 선수 정보 (playerId 변경 시 fetch)
  const [selectedPlayer, setSelectedPlayer] = useState<SearchResult | null>(
    null,
  );
  const prevPlayerIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (playerId === prevPlayerIdRef.current) return;
    prevPlayerIdRef.current = playerId;

    if (!playerId) {
      setSelectedPlayer(null);
      return;
    }

    // 이미 검색 결과에서 선택한 선수라면 API 호출 불필요
    const fromResults = results.find((r) => r.id === playerId);
    if (fromResults) {
      setSelectedPlayer(fromResults);
      return;
    }

    // playerId로 선수 이름 조회
    fetch(
      `/api/scoutlab/players/search?q=&season=${encodeURIComponent(season)}&id=${playerId}`,
    )
      .then((res) => res.json())
      .then((data: SearchResult[]) => {
        if (data.length > 0) setSelectedPlayer(data[0]);
      })
      .catch(() => {});
  }, [playerId, season, results]);

  /** API 검색 URL 빌드 (league/team 필터 포함) */
  const buildSearchUrl = useCallback(
    (q: string) => {
      const params = new URLSearchParams({
        q,
        season,
      });
      if (league) params.set("league", league);
      if (team) params.set("team", team);
      return `/api/scoutlab/players/search?${params.toString()}`;
    },
    [season, league, team],
  );

  // 팀/리그가 선택된 상태에서 popover 열면 바로 후보 목록 로드
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (nextOpen && results.length === 0 && (team || league)) {
        setLoading(true);
        fetch(buildSearchUrl(""))
          .then((res) => res.json())
          .then((data: SearchResult[]) => setResults(data))
          .catch(() => {})
          .finally(() => setLoading(false));
      }
    },
    [results.length, team, league, buildSearchUrl],
  );

  // debounce 검색
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // 팀/리그가 선택된 경우에는 빈 쿼리도 허용 (필터링용)
    const hasFilter = !!team || !!league;
    if (query.length < 2 && !hasFilter) {
      setResults([]);
      setLoading(false);
      return;
    }

    // 빈 쿼리 + 필터가 있는 경우 (이미 popover open 시 로드됨) 건너뜀
    if (query.length === 0 && hasFilter) {
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(buildSearchUrl(query));
        if (res.ok) {
          const data: SearchResult[] = await res.json();
          setResults(data);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, buildSearchUrl]);

  // 리그/팀 변경 시 후보 목록 갱신
  const prevLeagueRef = useRef(league);
  const prevTeamRef = useRef(team);
  useEffect(() => {
    if (league === prevLeagueRef.current && team === prevTeamRef.current)
      return;
    prevLeagueRef.current = league;
    prevTeamRef.current = team;

    // popover가 열려있을 때만 갱신
    if (!open) {
      setResults([]);
      return;
    }

    if (team || league) {
      setLoading(true);
      fetch(buildSearchUrl(query))
        .then((res) => res.json())
        .then((data: SearchResult[]) => setResults(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      if (query.length < 2) setResults([]);
    }
  }, [league, team, open, buildSearchUrl, query]);

  const handleSelect = useCallback(
    (player: SearchResult) => {
      setSelectedPlayer(player);
      prevPlayerIdRef.current = player.id;
      const comparisonPosition: ScoutlabComparisonPosition =
        positionToComparisonPosition(player.position);
      startTransition(() => {
        setParams({ playerId: player.id, comparisonPosition });
      });
      setOpen(false);
      setQuery("");
    },
    [setParams],
  );

  const handleClear = useCallback(() => {
    setSelectedPlayer(null);
    prevPlayerIdRef.current = null;
    startTransition(() => {
      setParams({ playerId: null });
    });
  }, [setParams]);

  const hasFilter = !!team || !!league;
  const showEmpty =
    !loading && results.length === 0 && (query.length >= 2 || hasFilter);

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={handleOpenChange}>
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
