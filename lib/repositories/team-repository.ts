// teams 테이블 배치 쿼리

import { createClient } from "@/lib/supabase/server";
import type { Team } from "@/types";

import { type TeamRow, teamRowToTeam } from "./mappers";

/** 전체 팀 목록 조회 (이름순 정렬) */
export async function getAllTeams(): Promise<Team[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(`teams 전체 조회 실패: ${error.message}`);

  return (data as TeamRow[]).map(teamRowToTeam);
}

/** 여러 팀 ID를 한 번에 조회 → Map<id, Team> */
export async function getTeamsByIds(ids: number[]): Promise<Map<number, Team>> {
  if (ids.length === 0) return new Map();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .in("id", ids);

  if (error) throw new Error(`teams 조회 실패: ${error.message}`);

  const map = new Map<number, Team>();
  for (const row of data as TeamRow[]) {
    map.set(row.id, teamRowToTeam(row));
  }
  return map;
}
