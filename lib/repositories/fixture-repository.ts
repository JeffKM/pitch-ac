// fixtures 테이블 쿼리 함수 및 현재 게임위크 감지 (맨시티 경기 필터링)
import "server-only";

import { cache } from "react";

import { MCITY_TEAM_ID } from "@/lib/api/sportmonks/constants";
import { createClient } from "@/lib/supabase/server";
import type { Fixture } from "@/types";

import { type FixtureRow, fixtureRowToFixture } from "./mappers";

/**
 * 현재 게임위크 감지:
 * 1) LIVE 경기가 있는 gameweek
 * 2) 가장 가까운 미래 NS 경기의 gameweek
 * 3) 가장 최근 종료된 FT 경기의 gameweek
 * 4) fallback: 1
 */
export const getCurrentGameweek = cache(async (): Promise<number> => {
  const supabase = await createClient();

  // 맨시티 PL 경기만 대상 (POSTP 제외, gameweek NOT NULL)
  const mcityFilter = `home_team_id.eq.${MCITY_TEAM_ID},away_team_id.eq.${MCITY_TEAM_ID}`;
  const [liveResult, nextResult, lastResult] = await Promise.all([
    // 1) LIVE 경기
    supabase
      .from("fixtures")
      .select("gameweek")
      .eq("status", "LIVE")
      .not("gameweek", "is", null)
      .or(mcityFilter)
      .limit(1)
      .maybeSingle(),
    // 2) 가장 가까운 미래 NS 경기 (POSTP 제외)
    supabase
      .from("fixtures")
      .select("gameweek")
      .eq("status", "NS")
      .not("gameweek", "is", null)
      .or(mcityFilter)
      .gte("date", new Date().toISOString())
      .order("date", { ascending: true })
      .limit(1)
      .maybeSingle(),
    // 3) 가장 최근 FT 경기
    supabase
      .from("fixtures")
      .select("gameweek")
      .eq("status", "FT")
      .not("gameweek", "is", null)
      .or(mcityFilter)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  // 우선순위: LIVE > NS(미래) > FT(과거) > fallback(1)
  if (liveResult.data?.gameweek) return liveResult.data.gameweek;
  if (nextResult.data?.gameweek) return nextResult.data.gameweek;
  if (lastResult.data?.gameweek) return lastResult.data.gameweek;

  return 1;
});

/** ID로 경기 상세 조회 */
export const getFixtureById = cache(
  async (id: number): Promise<Fixture | null> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("fixtures")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`fixture 조회 실패: ${error.message}`);
    if (!data) return null;

    return fixtureRowToFixture(data as FixtureRow);
  },
);

/** 게임위크별 맨시티 경기 조회 */
export async function getFixturesByGameweek(
  gameweek: number,
): Promise<Fixture[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fixtures")
    .select("*")
    .eq("gameweek", gameweek)
    .or(`home_team_id.eq.${MCITY_TEAM_ID},away_team_id.eq.${MCITY_TEAM_ID}`)
    .order("date", { ascending: true });

  if (error) throw new Error(`fixtures 조회 실패: ${error.message}`);

  return (data as FixtureRow[]).map(fixtureRowToFixture);
}
