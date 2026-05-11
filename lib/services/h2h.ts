// H2H(맞대결) 데이터 조회 서비스 — DB 쿼리 기반
import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { H2HResult } from "@/types";

/**
 * 두 팀 간 H2H 최근 5경기 결과 조회
 * fixtures 테이블에서 status='FT' AND 양 팀 조건으로 DB 직접 쿼리
 */
export async function fetchH2HResults(
  teamIdA: number,
  teamIdB: number,
): Promise<H2HResult[]> {
  const supabase = await createClient();

  // 양 팀이 맞붙은 FT 경기를 최근순 5개 조회
  const { data, error } = await supabase
    .from("fixtures")
    .select("id, date, home_team_id, away_team_id, home_score, away_score")
    .eq("status", "FT")
    .or(
      `and(home_team_id.eq.${teamIdA},away_team_id.eq.${teamIdB}),and(home_team_id.eq.${teamIdB},away_team_id.eq.${teamIdA})`,
    )
    .order("date", { ascending: false })
    .limit(5);

  if (error) throw new Error(`H2H 조회 실패: ${error.message}`);
  if (!data) return [];

  return data.map((row) => ({
    fixtureId: row.id,
    date: row.date,
    homeTeamId: row.home_team_id,
    awayTeamId: row.away_team_id,
    homeScore: row.home_score,
    awayScore: row.away_score,
  }));
}
