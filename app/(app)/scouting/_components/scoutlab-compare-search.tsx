// ScoutLab Compare — 비교 선수 검색 (API 기반 async 검색)
"use client";

import { Loader2, Search } from "lucide-react";
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

import { useDebouncedValue } from "../_lib/use-debounced-value";
import { useScoutlabParams } from "../_lib/use-scoutlab-params";
import { useScoutlabPlayerSearch } from "../_lib/use-scoutlab-player-search";

export function ScoutlabCompareSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();
  const { season, setParams } = useScoutlabParams();

  // 디바운스된 검색어를 queryKey에 넣어 타이핑 중 요청을 억제
  const debouncedQuery = useDebouncedValue(query);
  const isSearchable = debouncedQuery.length >= 2;

  const { data, isFetching } = useScoutlabPlayerSearch(
    { query: debouncedQuery, season },
    { enabled: isSearchable },
  );

  // 입력·디바운스 값 중 하나라도 2자 미만이면 직전 결과를 노출하지 않는다
  const results = query.length >= 2 && isSearchable ? (data ?? []) : [];
  const loading = query.length >= 2 && (isFetching || query !== debouncedQuery);

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
          <span className="flex items-center gap-2 text-comic-black/60">
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
                <Loader2 className="size-4 animate-spin text-comic-black/60" />
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
                    <span className="text-xs text-comic-black/60">
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
