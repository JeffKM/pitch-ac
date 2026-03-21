// fixtures 테이블 쿼리 함수 및 현재 게임위크 감지

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
export async function getCurrentGameweek(): Promise<number> {
  const supabase = await createClient();

  // 1) LIVE 경기
  const { data: liveFixture } = await supabase
    .from("fixtures")
    .select("gameweek")
    .eq("status", "LIVE")
    .limit(1)
    .maybeSingle();

  if (liveFixture) return liveFixture.gameweek;

  // 2) 가장 가까운 미래 NS 경기
  const { data: nextFixture } = await supabase
    .from("fixtures")
    .select("gameweek")
    .eq("status", "NS")
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (nextFixture) return nextFixture.gameweek;

  // 3) 가장 최근 FT 경기
  const { data: lastFixture } = await supabase
    .from("fixtures")
    .select("gameweek")
    .eq("status", "FT")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastFixture) return lastFixture.gameweek;

  return 1;
}

/** 게임위크별 경기 목록 조회 */
export async function getFixturesByGameweek(
  gameweek: number,
): Promise<Fixture[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fixtures")
    .select("*")
    .eq("gameweek", gameweek)
    .order("date", { ascending: true });

  if (error) throw new Error(`fixtures 조회 실패: ${error.message}`);

  return (data as FixtureRow[]).map(fixtureRowToFixture);
}
