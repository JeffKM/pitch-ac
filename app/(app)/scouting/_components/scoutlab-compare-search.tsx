// ScoutLab Compare — 비교 선수 검색 (API 기반 async 검색)
"use client";

import { Loader2, Search } from "lucide-react";
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

import { useScoutlabParams } from "../_lib/use-scoutlab-params";

interface SearchResult {
  id: number;
  name: string;
  team: string;
  league: string;
  position: string;
}

export function ScoutlabCompareSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();
  const { season, setParams } = useScoutlabParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // debounce 검색
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/scoutlab/players/search?q=${encodeURIComponent(query)}&season=${encodeURIComponent(season)}`,
        );
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
  }, [query, season]);

  const handleSelect = useCallback(
    (id: number) => {
      startTransition(() => {
        setParams({ compareId: id });
      });
      setOpen(false);
      setQuery("");
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
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="선수 이름..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="size-4 animate-spin text-comic-black/40" />
              </div>
            )}
            {!loading && query.length >= 2 && results.length === 0 && (
              <CommandEmpty>결과 없음</CommandEmpty>
            )}
            {!loading && results.length > 0 && (
              <CommandGroup>
                {results.map((player) => (
                  <CommandItem
                    key={player.id}
                    value={String(player.id)}
                    onSelect={() => handleSelect(player.id)}
                  >
                    <span className="flex-1 truncate text-sm">
                      {player.name}
                    </span>
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
  );
}
