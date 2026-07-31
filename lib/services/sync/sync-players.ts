import "server-only";

import {
  deriveSeasonLabel,
  getCompetitionScorers,
  getCompetitionTeams,
  mapFdSquadPlayerToPlayer,
  mapFdSquadPlayerToScoutlabRow,
  mapFdTeamToTeam,
} from "@/lib/api/football-data";
import { SCOUTLAB_ACTIVE_SEASON } from "@/lib/constants/scoutlab";
import { createAdminClient } from "@/lib/supabase/admin";

import { playerToDbRow, teamToDbRow } from "./db-mappers";
import { extractErrorMessage, type SyncResult, writeSyncLog } from "./log";

const LEAGUE = "Premier League";
const LEAGUE_CODE = "PL";
// ScoutLab 데이터 수집은 아직 25/26 기준 — Phase SR04에서 전환한다
const SCOUTLAB_SEASON: string = SCOUTLAB_ACTIVE_SEASON;

/**
 * PL 선수 동기화 — /competitions/PL/teams의 squad 데이터를
 * players + scoutlab_players 테이블에 적재
 */
export async function syncPlayers(): Promise<SyncResult> {
  const supabase = createAdminClient();

  try {
    // 1. 팀 + squad 데이터 조회
    const teamsRes = await getCompetitionTeams(LEAGUE_CODE);
    const seasonLabel = deriveSeasonLabel(teamsRes.season);

    // 2. 득점자 정보 조회 (등번호 + 출전경기수 보강용)
    const scorersRes = await getCompetitionScorers(LEAGUE_CODE);

    // 3. scorers Map: playerId → { shirtNumber, playedMatches, section }
    const scorersMap = new Map<
      number,
      {
        shirtNumber: number | null;
        playedMatches: number;
        section: string | null;
      }
    >();
    for (const scorer of scorersRes.scorers) {
      scorersMap.set(scorer.player.id, {
        shirtNumber: scorer.player.shirtNumber,
        playedMatches: scorer.playedMatches,
        section: scorer.player.section ?? null,
      });
    }

    // 4. teams 테이블 upsert (FK 보장)
    const teamRows = teamsRes.teams.map((raw) => {
      const team = mapFdTeamToTeam(raw, seasonLabel);
      return teamToDbRow(team);
    });

    const { error: teamError } = await supabase
      .from("teams")
      .upsert(teamRows, { onConflict: "id" });

    if (teamError) throw teamError;

    // 5. 기존 scoutlab 선수 조회 (팀명 차이로 인한 중복 방지)
    const { data: existingScoutlab } = await supabase
      .from("scoutlab_players")
      .select("id, name, pitch_ac_player_id")
      .eq("season", SCOUTLAB_SEASON)
      .eq("league", LEAGUE);

    // name → { id, pitch_ac_player_id } 매핑 (이름 기준 중복 판별)
    const existingByName = new Map(
      (existingScoutlab ?? []).map((p) => [
        p.name,
        {
          id: p.id as number,
          pitchAcPlayerId: p.pitch_ac_player_id as number | null,
        },
      ]),
    );

    // 6. 전체 squad 순회 → players + scoutlab_players
    const playerRows: ReturnType<typeof playerToDbRow>[] = [];
    const scoutlabNewRows: Array<{
      name: string;
      team: string;
      league: string;
      position: string;
      season: string;
      nationality: string | null;
      age: number | null;
      minutes_played: number;
      pitch_ac_player_id: number;
    }> = [];
    // 기존 선수에 pitch_ac_player_id만 업데이트할 대상
    const pitchAcIdUpdates: Array<{ id: number; pitch_ac_player_id: number }> =
      [];

    for (const team of teamsRes.teams) {
      for (const squadPlayer of team.squad) {
        // 6a. players 테이블 (GK 포함)
        const player = mapFdSquadPlayerToPlayer(squadPlayer, team.id);

        // scorers에서 등번호 보강
        const scorerInfo = scorersMap.get(squadPlayer.id);
        if (scorerInfo?.shirtNumber) {
          player.number = scorerInfo.shirtNumber;
        }

        playerRows.push(playerToDbRow(player));

        // 6b. scoutlab_players 테이블 (GK 제외)
        const positionOverride = scorerInfo?.section ?? null;
        const scoutlabRow = mapFdSquadPlayerToScoutlabRow(
          squadPlayer,
          team.name,
          LEAGUE,
          SCOUTLAB_SEASON,
          positionOverride,
        );

        if (scoutlabRow) {
          if (scorerInfo) {
            scoutlabRow.minutes_played = scorerInfo.playedMatches * 90;
          }

          // 중복 방지: 이름이 같은 기존 선수가 있으면 pitch_ac_player_id만 업데이트
          const existing = existingByName.get(scoutlabRow.name);
          if (existing) {
            if (!existing.pitchAcPlayerId) {
              pitchAcIdUpdates.push({
                id: existing.id,
                pitch_ac_player_id: scoutlabRow.pitch_ac_player_id,
              });
            }
          } else {
            scoutlabNewRows.push(scoutlabRow);
          }
        }
      }
    }

    // 7. players 테이블 일괄 upsert
    // 시즌 초반 이적 선수가 신구 두 구단 스쿼드에 동시 등재되어 응답에 동일 id가
    // 중복 포함될 수 있다 (실측: Rogers, Garnacho, Diop). 배치 내 동일 id 중복은
    // ON CONFLICT 21000으로 upsert 전체를 실패시키므로 id 기준 중복 제거 후
    // 적재한다 (Map은 순회 순서를 보존하므로 마지막 등재 = 최신 소속 구단 채택).
    const dedupedPlayerRows = Array.from(
      new Map(playerRows.map((row) => [row.id, row])).values(),
    );

    const { error: playerError } = await supabase
      .from("players")
      .upsert(dedupedPlayerRows, { onConflict: "id" });

    if (playerError) throw playerError;

    // 8. scoutlab_players — 새 선수만 삽입
    // name+team+season 조합이 배치 내 중복되면 동일한 ON CONFLICT 위험이 있으므로
    // 방어적으로 중복 제거한다 (마지막 등재 채택)
    const dedupedScoutlabNewRows = Array.from(
      new Map(
        scoutlabNewRows.map((row) => [
          `${row.name}|${row.team}|${row.season}`,
          row,
        ]),
      ).values(),
    );

    if (dedupedScoutlabNewRows.length > 0) {
      const { error: scoutlabError } = await supabase
        .from("scoutlab_players")
        .upsert(dedupedScoutlabNewRows, { onConflict: "name,team,season" });

      if (scoutlabError) throw scoutlabError;
    }

    // 9. 기존 선수 pitch_ac_player_id 일괄 업데이트
    // 이적 선수가 신구 스쿼드에 중복 등재되면 이름 기준 매칭으로 동일 existing.id가
    // 두 번 push되어 여기서도 동일한 21000 위험이 발생하므로 id 기준 중복 제거한다
    // (내용이 동일하므로 마지막 등재를 채택해도 무해하다)
    const dedupedPitchAcIdUpdates = Array.from(
      new Map(pitchAcIdUpdates.map((row) => [row.id, row])).values(),
    );

    if (dedupedPitchAcIdUpdates.length > 0) {
      const { error: updateError } = await supabase
        .from("scoutlab_players")
        .upsert(dedupedPitchAcIdUpdates, { onConflict: "id" });

      if (updateError) throw updateError;
    }

    // 10. 결과 로그
    const result: SyncResult = {
      entity: "players",
      status: "success",
      recordsSynced: dedupedPlayerRows.length,
    };
    await writeSyncLog(supabase, result);

    console.log(
      `[syncPlayers] 완료: players=${dedupedPlayerRows.length}, scoutlab 신규=${dedupedScoutlabNewRows.length}, pitch_ac_id 업데이트=${dedupedPitchAcIdUpdates.length}`,
    );

    return result;
  } catch (error) {
    const result: SyncResult = {
      entity: "players",
      status: "error",
      recordsSynced: 0,
      errorMessage: extractErrorMessage(error),
    };
    await writeSyncLog(supabase, result);
    return result;
  }
}
