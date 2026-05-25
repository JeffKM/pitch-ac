// standings 테이블 배치 쿼리
import "server-only";

import { cache } from "react";

import { ALL_COMPETITIONS, TOP5_LEAGUE_IDS } from "@/lib/constants/football";
import { createClient } from "@/lib/supabase/server";
import type { TeamStanding } from "@/types";

import { type StandingRow, standingRowToStanding } from "./mappers";

/** 시즌 전체 순위 조회 (position 오름차순) */
export const getAllStandings = cache(
  async (season: string): Promise<TeamStanding[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("standings")
      .select("*")
      .eq("season", season)
      .order("position", { ascending: true });

    if (error) throw new Error(`standings 전체 조회 실패: ${error.message}`);

    return (data as StandingRow[]).map(standingRowToStanding);
  },
);

/** 전체 대회 순위 조회 (5대 리그 + UCL) → Map<leagueId, TeamStanding[]> */
export const getAllLeagueStandings = cache(
  async (season: string): Promise<Map<number, TeamStanding[]>> => {
    const supabase = await createClient();
    const leagueIds = ALL_COMPETITIONS.map((c) => c.id);

    const { data, error } = await supabase
      .from("standings")
      .select("*")
      .in("league_id", leagueIds)
      .eq("season", season)
      .order("position", { ascending: true });

    if (error)
      throw new Error(`standings 전체 대회 조회 실패: ${error.message}`);

    const map = new Map<number, TeamStanding[]>();
    for (const row of data as StandingRow[]) {
      const standing = standingRowToStanding(row);
      const list = map.get(row.league_id) ?? [];
      list.push(standing);
      map.set(row.league_id, list);
    }
    return map;
  },
);

/** 여러 팀 ID의 국내 리그 순위를 한 번에 조회 → Map<teamId, TeamStanding>
 *  UCL standings가 덮어쓰지 않도록 TOP5_LEAGUE_IDS로 필터 */
export const getStandingsByTeamIds = cache(
  async (
    teamIds: number[],
    season: string,
  ): Promise<Map<number, TeamStanding>> => {
    if (teamIds.length === 0) return new Map();

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("standings")
      .select("*")
      .in("team_id", teamIds)
      .in("league_id", Array.from(TOP5_LEAGUE_IDS))
      .eq("season", season);

    if (error) throw new Error(`standings 조회 실패: ${error.message}`);

    const map = new Map<number, TeamStanding>();
    for (const row of data as StandingRow[]) {
      map.set(row.team_id, standingRowToStanding(row));
    }
    return map;
  },
);
