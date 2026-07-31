import "server-only";

import { COMPETITION_BY_ID, type LeagueConfig } from "@/lib/constants/football";
import { createAdminClient } from "@/lib/supabase/admin";

/** 킥오프 후 결과 반영까지 대기 시간 (2.5시간 = 150분) */
const KICKOFF_OFFSET_MINUTES = 150;

/**
 * 결과 동기화가 필요한 리그 목록 조회
 *
 * 조건: status='NS' AND date < now() - 2.5h AND 해당 리그의 최신 시즌
 * → 킥오프 시간이 2.5시간 이상 지났지만 아직 NS 상태인 경기가 있는 리그
 * → 구시즌 잔존 NS 행은 현시즌 동기화로 해소되지 않으므로 제외 (무한 재시도 방지)
 * → 빈 배열이면 동기화 불필요 (cron 조기 종료, 0 API 호출)
 */
export async function getPendingResultLeagues(): Promise<LeagueConfig[]> {
  const supabase = createAdminClient();

  const cutoff = new Date(Date.now() - KICKOFF_OFFSET_MINUTES * 60 * 1000);

  const { data, error } = await supabase
    .from("fixtures")
    .select("league_id, season")
    .eq("status", "NS")
    .lt("date", cutoff.toISOString());

  if (error) {
    console.error("[getPendingResultLeagues] DB 조회 실패:", error.message);
    return [];
  }

  if (!data || data.length === 0) return [];

  // 리그별 pending 시즌 집합
  const pendingSeasonsByLeague = new Map<number, Set<string>>();
  for (const row of data) {
    const seasons = pendingSeasonsByLeague.get(row.league_id) ?? new Set();
    seasons.add(row.season);
    pendingSeasonsByLeague.set(row.league_id, seasons);
  }

  // 리그별 최신 시즌 조회는 서로 독립 — 병렬 실행 (최대 6개 리그)
  const leagueResults = await Promise.all(
    [...pendingSeasonsByLeague].map(
      async ([leagueId, pendingSeasons]): Promise<LeagueConfig | null> => {
        const league = COMPETITION_BY_ID[leagueId];
        if (!league) return null;

        // 리그 최신 시즌 파생 — "YYYY/YYYY" 고정폭 문자열 내림차순 = 최신
        const { data: latestRows, error: latestError } = await supabase
          .from("fixtures")
          .select("season")
          .eq("league_id", leagueId)
          .order("season", { ascending: false })
          .limit(1);

        const latestSeason = latestRows?.[0]?.season;

        // 최신 시즌 조회 실패 시 기존 동작 유지 (fail-open: 동기화 시도)
        if (latestError || !latestSeason || pendingSeasons.has(latestSeason)) {
          return league;
        }

        console.warn(
          `[getPendingResultLeagues] ${league.code}: 구시즌 잔존 NS 행 스킵 ` +
            `(잔존 시즌 ${[...pendingSeasons].join(", ")} / 최신 시즌 ${latestSeason})`,
        );
        return null;
      },
    ),
  );
  const leagues = leagueResults.filter((l): l is LeagueConfig => l !== null);

  return leagues;
}
