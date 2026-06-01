// Supabase upsert (players, metrics, similarity, sync_logs)

import type { SupabaseClient } from "@supabase/supabase-js";

import { logError, logSuccess } from "./logger";
import { parseSimilarPlayerInfo } from "./parsers";
import type {
  ParsedActionMap,
  ParsedPlayerInfo,
  ParsedSimilarPlayer,
} from "./types";

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
  mode: "per90" | "total" = "per90",
  adjustment: "padj" | "raw" = "padj",
  comparisonPosition: string = "AM/W",
): Promise<void> {
  const { error } = await supabase.from("scoutlab_metrics").upsert(
    {
      player_id: playerId,
      season,
      mode,
      adjustment,
      comparison_position: comparisonPosition,
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
    {
      onConflict: "player_id,season,mode,adjustment,comparison_position",
    },
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
      score: s.score ?? 0,
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

/**
 * ScoutLab Action Maps 이미지를 다운로드하여 Supabase Storage에 업로드
 * 반환: public URL (업로드 실패 시 원본 URL 반환)
 */
async function uploadActionMapImage(
  supabase: SupabaseClient,
  imageUrl: string,
  playerId: number,
  season: string,
): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      logError(`이미지 다운로드 실패: ${response.status}`, null);
      return imageUrl;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const fileName = `${playerId}_${season.replace("/", "-")}.png`;

    const { error: uploadError } = await supabase.storage
      .from("scoutlab-action-maps")
      .upload(fileName, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      logError(`Storage 업로드 실패: ${uploadError.message}`, null);
      return imageUrl;
    }

    const { data: publicUrlData } = supabase.storage
      .from("scoutlab-action-maps")
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (e) {
    logError(
      `이미지 업로드 중 오류: ${e instanceof Error ? e.message : "unknown"}`,
      null,
    );
    return imageUrl;
  }
}

/** 액션 맵 upsert → scoutlab_action_maps (이미지 다운로드 + Storage 업로드 포함) */
export async function upsertActionMaps(
  supabase: SupabaseClient,
  playerId: number,
  season: string,
  actionMaps: ParsedActionMap[],
): Promise<void> {
  // 이미지 URL이 있으면 Storage에 업로드 (1회만)
  let storedImageUrl: string | null = null;
  const firstImageUrl = actionMaps.find((m) => m.imageUrl)?.imageUrl;
  if (firstImageUrl) {
    storedImageUrl = await uploadActionMapImage(
      supabase,
      firstImageUrl,
      playerId,
      season,
    );
  }

  for (const map of actionMaps) {
    const { error } = await supabase.from("scoutlab_action_maps").upsert(
      {
        player_id: playerId,
        season,
        action_type: map.actionType,
        lines: map.lines,
        total_count: map.totalCount,
        per90: map.per90,
        image_url: storedImageUrl,
      },
      { onConflict: "player_id,season,action_type" },
    );

    if (error) {
      throw new Error(
        `액션 맵 upsert 실패 (playerId: ${playerId}, ${map.actionType}): ${error.message}`,
      );
    }
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
