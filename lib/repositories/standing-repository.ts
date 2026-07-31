// standings 테이블 배치 쿼리
import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";

import { ALL_COMPETITIONS, TOP5_LEAGUE_IDS } from "@/lib/constants/football";
import { createPublicClient } from "@/lib/supabase/public";
import type { TeamStanding } from "@/types";

import { type StandingRow, standingRowToStanding } from "./mappers";

/**
 * 대회별 최신 시즌 라벨 조회 → Map<leagueId, season>
 * 시즌 라벨은 "YYYY/YYYY" 형식이라 문자열 내림차순 = 최신순이다.
 */
export const getLatestStandingSeasons = cache(
  async (): Promise<Map<number, string>> => {
    "use cache";
    cacheLife("hours");
    cacheTag("standings");

    const supabase = createPublicClient();
    const leagueIds = ALL_COMPETITIONS.map((c) => c.id);

    const { data, error } = await supabase
      .from("standings")
      .select("league_id, season")
      .in("league_id", leagueIds)
      .order("season", { ascending: false });

    if (error) throw new Error(`standings 시즌 조회 실패: ${error.message}`);

    const latest = new Map<number, string>();
    for (const row of data as Array<{ league_id: number; season: string }>) {
      if (!latest.has(row.league_id)) latest.set(row.league_id, row.season);
    }
    return latest;
  },
);

/** 전체 대회 최신 시즌 순위 조회 (5대 리그 + UCL) → Map<leagueId, TeamStanding[]> */
export const getAllLeagueStandings = cache(
  async (): Promise<Map<number, TeamStanding[]>> => {
    "use cache";
    cacheLife("hours");
    cacheTag("standings");

    const latestSeasons = await getLatestStandingSeasons();
    if (latestSeasons.size === 0) return new Map();

    const supabase = createPublicClient();
    const leagueIds = ALL_COMPETITIONS.map((c) => c.id);
    // 대회마다 최신 시즌이 다를 수 있어(UCL 시차) 등장하는 시즌을 모두 조회한 뒤 대회별로 걸러낸다
    const seasons = Array.from(new Set(latestSeasons.values()));

    const { data, error } = await supabase
      .from("standings")
      .select("*")
      .in("league_id", leagueIds)
      .in("season", seasons)
      .order("position", { ascending: true });

    if (error)
      throw new Error(`standings 전체 대회 조회 실패: ${error.message}`);

    const map = new Map<number, TeamStanding[]>();
    for (const row of data as StandingRow[]) {
      if (latestSeasons.get(row.league_id) !== row.season) continue;
      const list = map.get(row.league_id) ?? [];
      list.push(standingRowToStanding(row));
      map.set(row.league_id, list);
    }
    return map;
  },
);

/** 여러 팀 ID의 국내 리그 최신 시즌 순위를 한 번에 조회 → Map<teamId, TeamStanding>
 *  UCL standings가 덮어쓰지 않도록 TOP5_LEAGUE_IDS로 필터 */
export const getStandingsByTeamIds = cache(
  async (teamIds: number[]): Promise<Map<number, TeamStanding>> => {
    "use cache";
    cacheLife("hours");
    cacheTag("standings");

    if (teamIds.length === 0) return new Map();

    const supabase = createPublicClient();

    const { data, error } = await supabase
      .from("standings")
      .select("*")
      .in("team_id", teamIds)
      .in("league_id", Array.from(TOP5_LEAGUE_IDS));

    if (error) throw new Error(`standings 조회 실패: ${error.message}`);

    // 팀별로 가장 최신 시즌 행만 남긴다
    const latestByTeam = new Map<number, string>();
    const map = new Map<number, TeamStanding>();
    for (const row of data as StandingRow[]) {
      const current = latestByTeam.get(row.team_id);
      if (current && current >= row.season) continue;
      latestByTeam.set(row.team_id, row.season);
      map.set(row.team_id, standingRowToStanding(row));
    }
    return map;
  },
);
