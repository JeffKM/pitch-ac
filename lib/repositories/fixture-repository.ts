// fixtures 테이블 쿼리 함수 및 현재 게임위크 감지 (리그별 필터링)
import "server-only";

import { cache } from "react";

import { ALL_COMPETITION_IDS, PL_LEAGUE_ID } from "@/lib/constants/football";
import { createClient } from "@/lib/supabase/server";
import type { Fixture } from "@/types";

import { type FixtureRow, fixtureRowToFixture } from "./mappers";

/** 현재 게임위크 판별 결과 — 기준 경기의 시즌을 함께 반환 */
export interface CurrentGameweek {
  gameweek: number;
  /** 기준 경기의 시즌 라벨 (해당 리그 데이터가 없으면 null) */
  season: string | null;
}

/**
 * 현재 게임위크 감지 (리그별):
 * 1) LIVE 경기가 있는 gameweek
 * 2) 가장 가까운 미래 NS 경기의 gameweek
 * 3) 가장 최근 종료된 FT 경기의 gameweek
 * 4) fallback: 1 (시즌 미상)
 */
export const getCurrentGameweek = cache(
  async (leagueId: number = PL_LEAGUE_ID): Promise<CurrentGameweek> => {
    const supabase = await createClient();

    // 리그의 최신 시즌을 먼저 구해 LIVE/NS/FT 조회 전부를 해당 시즌으로 한정한다.
    // 이렇게 하지 않으면 이전 시즌의 stuck LIVE/NS 행(재동기화로도 회복 안 되는
    // 경기 데이터 오류)이 최신 시즌 게임위크 판별을 영구적으로 가로막을 수 있다.
    const { data: latestSeasonRow } = await supabase
      .from("fixtures")
      .select("season")
      .eq("league_id", leagueId)
      .not("season", "is", null)
      .order("season", { ascending: false })
      .limit(1)
      .maybeSingle();

    const latestSeason = (latestSeasonRow as { season: string } | null)?.season;

    if (!latestSeason) {
      return { gameweek: 1, season: null };
    }

    const [liveResult, nextResult, lastResult] = await Promise.all([
      // 1) LIVE 경기
      supabase
        .from("fixtures")
        .select("gameweek, season")
        .eq("status", "LIVE")
        .eq("league_id", leagueId)
        .eq("season", latestSeason)
        .not("gameweek", "is", null)
        .limit(1)
        .maybeSingle(),
      // 2) 가장 가까운 미래 NS 경기 (POSTP 제외)
      supabase
        .from("fixtures")
        .select("gameweek, season")
        .eq("status", "NS")
        .eq("league_id", leagueId)
        .eq("season", latestSeason)
        .not("gameweek", "is", null)
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true })
        .limit(1)
        .maybeSingle(),
      // 3) 가장 최근 FT 경기
      supabase
        .from("fixtures")
        .select("gameweek, season")
        .eq("status", "FT")
        .eq("league_id", leagueId)
        .eq("season", latestSeason)
        .not("gameweek", "is", null)
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    // 우선순위: LIVE > NS(미래) > FT(과거) > fallback(1)
    for (const result of [liveResult, nextResult, lastResult]) {
      const row = result.data as {
        gameweek: number | null;
        season: string;
      } | null;
      if (row?.gameweek) {
        return { gameweek: row.gameweek, season: row.season };
      }
    }

    return { gameweek: 1, season: null };
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

/** 게임위크별 리그 전체 경기 조회 (기본값: PL, season 지정 시 해당 시즌만) */
export async function getFixturesByGameweek(
  gameweek: number,
  leagueId: number = PL_LEAGUE_ID,
  season?: string,
): Promise<Fixture[]> {
  const supabase = await createClient();

  let query = supabase
    .from("fixtures")
    .select("*")
    .eq("gameweek", gameweek)
    .eq("league_id", leagueId);

  // 시즌 미지정 시 과거 시즌의 같은 라운드가 섞일 수 있으므로 가능한 항상 지정한다
  if (season) query = query.eq("season", season);

  const { data, error } = await query.order("date", { ascending: true });

  if (error) throw new Error(`fixtures 조회 실패: ${error.message}`);

  return (data as FixtureRow[]).map(fixtureRowToFixture);
}

/** 전체 대회에서 다음 예정(NS) 경기 조회 (시즌 종료 시 UCL 결승 등 표시용) */
export async function getUpcomingFixtures(
  limit: number = 6,
): Promise<Fixture[]> {
  const supabase = await createClient();

  const leagueIds = Array.from(ALL_COMPETITION_IDS);

  const { data, error } = await supabase
    .from("fixtures")
    .select("*")
    .in("league_id", leagueIds)
    .eq("status", "NS")
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true })
    .limit(limit);

  if (error) throw new Error(`upcoming fixtures 조회 실패: ${error.message}`);

  return (data as FixtureRow[]).map(fixtureRowToFixture);
}

/** KST 날짜 기준 전체 대회 경기 조회 (5대 리그 + UCL) */
export async function getFixturesByDate(dateStr: string): Promise<Fixture[]> {
  const supabase = await createClient();

  // KST 00:00~23:59:59 → UTC 변환
  const startKST = new Date(`${dateStr}T00:00:00+09:00`);
  const endKST = new Date(`${dateStr}T23:59:59.999+09:00`);

  const leagueIds = Array.from(ALL_COMPETITION_IDS);

  const { data, error } = await supabase
    .from("fixtures")
    .select("*")
    .in("league_id", leagueIds)
    .gte("date", startKST.toISOString())
    .lte("date", endKST.toISOString())
    .order("date", { ascending: true });

  if (error) throw new Error(`fixtures 조회 실패: ${error.message}`);

  return (data as FixtureRow[]).map(fixtureRowToFixture);
}
