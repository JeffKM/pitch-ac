// standings 테이블 배치 쿼리
import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import type { TeamStanding } from "@/types";

import { type StandingRow, standingRowToStanding } from "./mappers";

/** 여러 팀 ID의 순위를 한 번에 조회 → Map<teamId, TeamStanding> */
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
      .eq("season", season);

    if (error) throw new Error(`standings 조회 실패: ${error.message}`);

    const map = new Map<number, TeamStanding>();
    for (const row of data as StandingRow[]) {
      map.set(row.team_id, standingRowToStanding(row));
    }
    return map;
  },
);
