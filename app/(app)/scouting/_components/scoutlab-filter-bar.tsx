"use client";

// ScoutLab 시즌/리그/팀 필터 바

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ScoutlabFilterOptions, ScoutlabLeague } from "@/types";

import { useScoutlabParams } from "../_lib/use-scoutlab-params";

interface ScoutlabFilterBarProps {
  options: ScoutlabFilterOptions;
}

export function ScoutlabFilterBar({ options }: ScoutlabFilterBarProps) {
  const { season, league, team, setParams } = useScoutlabParams();

  // 리그 선택 시 해당 리그 팀만, 미선택 시 전체
  const filteredTeams = league
    ? (options.teamsByLeague?.[league] ?? [])
    : options.teams;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* 시즌 */}
      <Select value={season} onValueChange={(v) => setParams({ season: v })}>
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="시즌" />
        </SelectTrigger>
        <SelectContent>
          {options.seasons.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 리그 — 변경 시 팀 선택 초기화 */}
      <Select
        value={league ?? "all"}
        onValueChange={(v) =>
          setParams({
            league: v === "all" ? null : (v as ScoutlabLeague),
            team: null,
          })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="리그" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">모든 리그</SelectItem>
          {options.leagues.map((l) => (
            <SelectItem key={l} value={l}>
              {l}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 팀 */}
      <Select
        value={team ?? "all"}
        onValueChange={(v) => setParams({ team: v === "all" ? null : v })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="팀" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">모든 팀</SelectItem>
          {filteredTeams.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
