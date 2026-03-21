// OG 이미지 동적 생성 API Route
// GET /api/og?p1=[id1]&p2=[id2] → PNG 1200x630

import { ImageResponse } from "next/og";
import { type NextRequest, NextResponse } from "next/server";

import { CURRENT_SEASON_LABEL } from "@/lib/api/sportmonks/constants";
import {
  getPlayerById,
  getPlayerSeasonStats,
  getTeamsByIds,
} from "@/lib/repositories";

import { renderBattleCard } from "./_lib/battle-card";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const p1 = searchParams.get("p1");
  const p2 = searchParams.get("p2");

  if (!p1 || !p2) {
    return NextResponse.json(
      { error: "p1, p2 파라미터 필수" },
      { status: 400 },
    );
  }

  const player1Id = Number(p1);
  const player2Id = Number(p2);

  if (Number.isNaN(player1Id) || Number.isNaN(player2Id)) {
    return NextResponse.json(
      { error: "유효하지 않은 선수 ID" },
      { status: 400 },
    );
  }

  const [player1, player2] = await Promise.all([
    getPlayerById(player1Id),
    getPlayerById(player2Id),
  ]);

  if (!player1 || !player2) {
    return NextResponse.json({ error: "선수를 찾을 수 없음" }, { status: 404 });
  }

  const [stats1, stats2] = await Promise.all([
    getPlayerSeasonStats(player1.id, CURRENT_SEASON_LABEL),
    getPlayerSeasonStats(player2.id, CURRENT_SEASON_LABEL),
  ]);

  if (!stats1 || !stats2) {
    return NextResponse.json({ error: "시즌 스탯 없음" }, { status: 404 });
  }

  const teamIds = [...new Set([player1.teamId, player2.teamId])];
  const teamsMap = await getTeamsByIds(teamIds);
  const team1 = teamsMap.get(player1.teamId) ?? null;
  const team2 = teamsMap.get(player2.teamId) ?? null;

  const jsx = renderBattleCard({
    player1,
    player2,
    stats1,
    stats2,
    team1,
    team2,
  });

  return new ImageResponse(jsx, {
    width: 1200,
    height: 630,
  });
}
