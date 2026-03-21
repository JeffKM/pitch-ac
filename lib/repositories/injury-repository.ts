// injuries 테이블 쿼리 함수
import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { InjuredPlayer } from "@/types";

import { type InjuryRow, injuryRowToInjuredPlayer } from "./mappers";

/** 팀 ID로 부상/결장 선수 목록 조회 */
export async function getInjuriesByTeamId(
  teamId: number,
): Promise<InjuredPlayer[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("injuries")
    .select("*")
    .eq("team_id", teamId);

  if (error) throw new Error(`injuries 조회 실패: ${error.message}`);

  return (data as InjuryRow[]).map(injuryRowToInjuredPlayer);
}
