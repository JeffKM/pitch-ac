// Supabase upsert (players, metrics, similarity, sync_logs)

import type { SupabaseClient } from "@supabase/supabase-js";

import { logError, logSuccess } from "./logger";
import { parseSimilarPlayerInfo } from "./parsers";
import type { ParsedPlayerInfo, ParsedSimilarPlayer } from "./types";

/** 선수 upsert → scoutlab_players (반환: player id) */
export async function upsertPlayer(
  supabase: SupabaseClient,
  player: ParsedPlayerInfo,
  league: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("scoutlab_players")
    .upsert(
      {
        name: player.name,
        team: player.club,
        league,
        position: player.position,
        season: player.season,
        nationality: player.nationality,
        age: player.age,
        height: player.height,
        minutes_played: player.minutes,
      },
      { onConflict: "name,team,season" },
    )
    .select("id")
    .single();

  if (error) {
    throw new Error(`선수 upsert 실패 (${player.name}): ${error.message}`);
  }

  return data.id;
}

/** 메트릭 upsert → scoutlab_metrics */
export async function upsertMetrics(
  supabase: SupabaseClient,
  playerId: number,
  season: string,
  grouped: Record<
    string,
    Record<string, { value: number; percentile: number }>
  >,
): Promise<void> {
  const { error } = await supabase.from("scoutlab_metrics").upsert(
    {
      player_id: playerId,
      season,
      mode: "per90",
      adjustment: "padj",
      final_product: grouped["final_product"] ?? {},
      shooting: grouped["shooting"] ?? {},
      creation: grouped["creation"] ?? {},
      passing: grouped["passing"] ?? {},
      ball_carrying: grouped["ball_carrying"] ?? {},
      defending: grouped["defending"] ?? {},
      set_pieces: grouped["set_pieces"] ?? {},
      aerial: grouped["aerial"] ?? {},
      possession: grouped["possession"] ?? {},
      vaep_overview: grouped["vaep_overview"] ?? {},
      misc: grouped["misc"] ?? {},
    },
    { onConflict: "player_id,season,mode,adjustment" },
  );

  if (error) {
    throw new Error(
      `메트릭 upsert 실패 (playerId: ${playerId}): ${error.message}`,
    );
  }
}

/** 유사 선수 upsert → scoutlab_similarity */
export async function upsertSimilarity(
  supabase: SupabaseClient,
  playerId: number,
  season: string,
  similar: ParsedSimilarPlayer[],
): Promise<void> {
  const similarPlayers = similar.map((s) => {
    const parsed = parseSimilarPlayerInfo(s.info);
    return {
      rank: s.rank,
      name: s.name,
      team: parsed.team,
      league: "", // Player Card에서는 리그 정보가 별도로 표시되지 않음
      age: parsed.age,
      position: parsed.position,
      score: 0, // 유사도 점수는 별도 탭에서 확인 가능
    };
  });

  const { error } = await supabase.from("scoutlab_similarity").upsert(
    {
      player_id: playerId,
      season,
      similar_players: similarPlayers,
    },
    { onConflict: "player_id,season" },
  );

  if (error) {
    throw new Error(
      `유사 선수 upsert 실패 (playerId: ${playerId}): ${error.message}`,
    );
  }
}

/** 동기화 로그 기록 → scoutlab_sync_logs */
export async function writeSyncLog(
  supabase: SupabaseClient,
  params: {
    scraper: string;
    season: string;
    league: string;
    status: "success" | "error";
    recordsSynced: number;
    recordsFailed: number;
    errorMessage?: string;
    durationMs: number;
  },
): Promise<void> {
  const { error } = await supabase.from("scoutlab_sync_logs").insert({
    scraper: params.scraper,
    season: params.season,
    league: params.league,
    status: params.status,
    records_synced: params.recordsSynced,
    records_failed: params.recordsFailed,
    error_message: params.errorMessage ?? null,
    duration_ms: params.durationMs,
  });

  if (error) {
    logError("동기화 로그 기록 실패", error);
  } else {
    logSuccess("동기화 로그 기록 완료");
  }
}
