import "server-only";

import {
  getCompetitionScorers,
  getCompetitionTeams,
  mapFdSquadPlayerToPlayer,
  mapFdSquadPlayerToScoutlabRow,
  mapFdTeamToTeam,
} from "@/lib/api/football-data";
import {
  CURRENT_SEASON,
  CURRENT_SEASON_LABEL,
  toScoutlabSeason,
} from "@/lib/constants/football";
import { createAdminClient } from "@/lib/supabase/admin";

import { playerToDbRow, teamToDbRow } from "./db-mappers";
import { extractErrorMessage, type SyncResult, writeSyncLog } from "./log";

const LEAGUE = "Premier League";
const LEAGUE_CODE = "PL";
const SEASON_LABEL = CURRENT_SEASON_LABEL;
const SCOUTLAB_SEASON = toScoutlabSeason(SEASON_LABEL);

/**
 * PL 선수 동기화 — /competitions/PL/teams의 squad 데이터를
 * players + scoutlab_players 테이블에 적재
 */
export async function syncPlayers(): Promise<SyncResult> {
  const supabase = createAdminClient();

  try {
    // 1. 팀 + squad 데이터 조회
    const teamsRes = await getCompetitionTeams(LEAGUE_CODE, CURRENT_SEASON);

    // 2. 득점자 정보 조회 (등번호 + 출전경기수 보강용)
    const scorersRes = await getCompetitionScorers(LEAGUE_CODE, CURRENT_SEASON);

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
      const team = mapFdTeamToTeam(raw, SEASON_LABEL);
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
    const { error: playerError } = await supabase
      .from("players")
      .upsert(playerRows, { onConflict: "id" });

    if (playerError) throw playerError;

    // 8. scoutlab_players — 새 선수만 삽입
    if (scoutlabNewRows.length > 0) {
      const { error: scoutlabError } = await supabase
        .from("scoutlab_players")
        .upsert(scoutlabNewRows, { onConflict: "name,team,season" });

      if (scoutlabError) throw scoutlabError;
    }

    // 9. 기존 선수 pitch_ac_player_id 일괄 업데이트
    if (pitchAcIdUpdates.length > 0) {
      const { error: updateError } = await supabase
        .from("scoutlab_players")
        .upsert(pitchAcIdUpdates, { onConflict: "id" });

      if (updateError) throw updateError;
    }

    // 10. 결과 로그
    const result: SyncResult = {
      entity: "players",
      status: "success",
      recordsSynced: playerRows.length,
    };
    await writeSyncLog(supabase, result);

    console.log(
      `[syncPlayers] 완료: players=${playerRows.length}, scoutlab 신규=${scoutlabNewRows.length}, pitch_ac_id 업데이트=${pitchAcIdUpdates.length}`,
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
