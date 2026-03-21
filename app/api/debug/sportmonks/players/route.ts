// 디버그 API — 선수 검색 (?q=Salah) (개발 환경 전용)

import { NextRequest, NextResponse } from "next/server";

import { searchPlayers } from "@/lib/api/sportmonks";
import {
  mapSmPlayerToPlayer,
  mapSmPlayerToSeasonStats,
} from "@/lib/api/sportmonks/mappers";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 },
    );
  }

  const query = request.nextUrl.searchParams.get("q");
  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      { error: "검색어를 2자 이상 입력하세요. (?q=Salah)" },
      { status: 400 },
    );
  }

  try {
    const rawPlayers = await searchPlayers(query.trim());

    const results = rawPlayers.map((raw) => ({
      player: mapSmPlayerToPlayer(raw),
      seasonStats: mapSmPlayerToSeasonStats(raw, "2025/2026"),
      _raw: {
        id: raw.id,
        name: raw.name,
        position_id: raw.position_id,
        statistics_count: raw.statistics?.length ?? 0,
      },
    }));

    return NextResponse.json({ query, count: results.length, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
