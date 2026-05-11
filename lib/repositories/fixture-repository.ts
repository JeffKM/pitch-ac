// fixtures 테이블 쿼리 함수 및 현재 게임위크 감지 (리그별 필터링)
import "server-only";

import { cache } from "react";

import { PL_LEAGUE_ID } from "@/lib/constants/football";
import { createClient } from "@/lib/supabase/server";
import type { Fixture } from "@/types";

import { type FixtureRow, fixtureRowToFixture } from "./mappers";

/**
 * 현재 게임위크 감지 (리그별):
 * 1) LIVE 경기가 있는 gameweek
 * 2) 가장 가까운 미래 NS 경기의 gameweek
 * 3) 가장 최근 종료된 FT 경기의 gameweek
 * 4) fallback: 1
 */
export const getCurrentGameweek = cache(
  async (leagueId: number = PL_LEAGUE_ID): Promise<number> => {
    const supabase = await createClient();

    const [liveResult, nextResult, lastResult] = await Promise.all([
      // 1) LIVE 경기
      supabase
        .from("fixtures")
        .select("gameweek")
        .eq("status", "LIVE")
        .eq("league_id", leagueId)
        .not("gameweek", "is", null)
        .limit(1)
        .maybeSingle(),
      // 2) 가장 가까운 미래 NS 경기 (POSTP 제외)
      supabase
        .from("fixtures")
        .select("gameweek")
        .eq("status", "NS")
        .eq("league_id", leagueId)
        .not("gameweek", "is", null)
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true })
        .limit(1)
        .maybeSingle(),
      // 3) 가장 최근 FT 경기
      supabase
        .from("fixtures")
        .select("gameweek")
        .eq("status", "FT")
        .eq("league_id", leagueId)
        .not("gameweek", "is", null)
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    // 우선순위: LIVE > NS(미래) > FT(과거) > fallback(1)
    if (liveResult.data?.gameweek) return liveResult.data.gameweek;
    if (nextResult.data?.gameweek) return nextResult.data.gameweek;
    if (lastResult.data?.gameweek) return lastResult.data.gameweek;

    return 1;
  },
);

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

/** 게임위크별 리그 전체 경기 조회 (기본값: PL) */
export async function getFixturesByGameweek(
  gameweek: number,
  leagueId: number = PL_LEAGUE_ID,
): Promise<Fixture[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fixtures")
    .select("*")
    .eq("gameweek", gameweek)
    .eq("league_id", leagueId)
    .order("date", { ascending: true });

  if (error) throw new Error(`fixtures 조회 실패: ${error.message}`);

  return (data as FixtureRow[]).map(fixtureRowToFixture);
}
