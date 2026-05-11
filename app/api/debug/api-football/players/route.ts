// GET /api/debug/api-football/players?q=Haaland — 선수 검색 확인

import { type NextRequest, NextResponse } from "next/server";

import {
  mapAfPlayerToPlayer,
  mapAfPlayerToSeasonStats,
  searchPlayers,
} from "@/lib/api/api-football";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "디버그 전용" }, { status: 403 });
  }

  const query = request.nextUrl.searchParams.get("q") ?? "Haaland";
  const rawPlayers = await searchPlayers(query);

  const results = rawPlayers.map((raw) => ({
    player: mapAfPlayerToPlayer(raw),
    seasonStats: mapAfPlayerToSeasonStats(raw, "2025/2026"),
  }));

  return NextResponse.json({ query, total: results.length, results });
}
