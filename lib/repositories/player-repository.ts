// 선수 관련 테이블 쿼리 함수 (맨시티 선수 필터링)
import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";

import { createPublicClient } from "@/lib/supabase/public";
import type { Player, PlayerSeasonStats } from "@/types";

import {
  type PlayerRow,
  playerRowToPlayer,
  type PlayerSeasonStatsRow,
  playerSeasonStatsRowToStats,
} from "./mappers";

/** ID로 선수 단건 조회 */
export const getPlayerById = cache(
  async (id: number): Promise<Player | null> => {
    "use cache";
    cacheLife("hours");
    cacheTag("players");

    const supabase = createPublicClient();

    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`player 조회 실패: ${error.message}`);
    if (!data) return null;

    return playerRowToPlayer(data as PlayerRow);
  },
);

/** 선수의 가장 최신 시즌 스탯 조회 (시즌 라벨 문자열 내림차순 = 최신순) */
export const getLatestPlayerSeasonStats = cache(
  async (playerId: number): Promise<PlayerSeasonStats | null> => {
    "use cache";
    cacheLife("hours");
    cacheTag("players");

    const supabase = createPublicClient();

    const { data, error } = await supabase
      .from("player_season_stats")
      .select("*")
      .eq("player_id", playerId)
      .order("season", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error)
      throw new Error(`player_season_stats 최신 조회 실패: ${error.message}`);
    if (!data) return null;

    return playerSeasonStatsRowToStats(data as PlayerSeasonStatsRow);
  },
);
