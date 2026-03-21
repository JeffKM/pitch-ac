import "server-only";

import { getFixturesByRound, getSeasonRounds } from "@/lib/api/sportmonks";
import {
  mapSmFixtureToFixture,
  mapSmTeamToTeam,
} from "@/lib/api/sportmonks/mappers";
import type { SmFixtureParticipant } from "@/lib/api/sportmonks/types";
import { createAdminClient } from "@/lib/supabase/admin";

import { fixtureToDbRow, teamToDbRow } from "./db-mappers";
import { extractErrorMessage, type SyncResult, writeSyncLog } from "./log";

const SEASON_LABEL = "2025/2026";

/**
 * 시즌 전체 경기 동기화
 * getSeasonFixtures의 season/league 필터가 Starter 플랜 미지원 →
 * getSeasonRounds(38라운드) → getFixturesByRound 방식으로 대체
 * 총 API 요청: 1(라운드 목록) + 38(라운드별 경기) = 39 요청
 */
export async function syncFixtures(): Promise<SyncResult> {
  const supabase = createAdminClient();
  let totalSynced = 0;
  const seenTeamIds = new Set<number>();

  try {
    const rounds = await getSeasonRounds();

    for (const round of rounds) {
      const fixtures = await getFixturesByRound(round.id);

      // participants에서 팀 정보 추출 → 누락 팀 upsert
      const newParticipants: SmFixtureParticipant[] = [];
      for (const raw of fixtures) {
        for (const p of raw.participants ?? []) {
          if (!seenTeamIds.has(p.id)) {
            seenTeamIds.add(p.id);
            newParticipants.push(p);
          }
        }
      }

      if (newParticipants.length > 0) {
        const teamRows = newParticipants.map((p) =>
          teamToDbRow(mapSmTeamToTeam(p, SEASON_LABEL)),
        );
        const { error: teamError } = await supabase
          .from("teams")
          .upsert(teamRows, { onConflict: "id" });
        if (teamError) throw teamError;
      }

      // 경기 upsert
      const fixtureRows = fixtures
        .map((raw) => {
          const fixture = mapSmFixtureToFixture(raw);
          if (fixture.gameweek === 0) return null;
          return fixtureToDbRow(fixture);
        })
        .filter(Boolean);

      if (fixtureRows.length > 0) {
        const { error } = await supabase
          .from("fixtures")
          .upsert(fixtureRows, { onConflict: "id" });
        if (error) throw error;
        totalSynced += fixtureRows.length;
      }
    }

    const result: SyncResult = {
      entity: "fixtures",
      status: "success",
      recordsSynced: totalSynced,
    };
    await writeSyncLog(supabase, result);
    return result;
  } catch (error) {
    const result: SyncResult = {
      entity: "fixtures",
      status: "error",
      recordsSynced: totalSynced,
      errorMessage: extractErrorMessage(error),
    };
    await writeSyncLog(supabase, result);
    return result;
  }
}
