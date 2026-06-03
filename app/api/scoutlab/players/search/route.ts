// ScoutLab 선수 검색 API — 리그/팀 필터 + 이름 검색
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const season = searchParams.get("season") ?? "25/26";
  const id = searchParams.get("id");
  const league = searchParams.get("league");
  const team = searchParams.get("team");

  // id 지정 시 단건 조회 (선택된 선수 이름 표시용)
  if (id) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("scoutlab_players")
        .select("id, name, team, league, position")
        .eq("id", parseInt(id, 10))
        .limit(1);

      if (error) {
        return NextResponse.json(
          { error: `선수 조회 실패: ${error.message}` },
          { status: 500 },
        );
      }
      return NextResponse.json(data ?? []);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "서버 오류" },
        { status: 500 },
      );
    }
  }

  // 팀/리그 필터 없이 이름 검색만 할 때는 최소 2자 필요
  if (q.length < 2 && !team && !league) {
    return NextResponse.json([]);
  }

  try {
    const supabase = await createClient();

    let query = supabase
      .from("scoutlab_players")
      .select("id, name, team, league, position")
      .eq("season", season);

    // 리그/팀 필터
    if (league) query = query.eq("league", league);
    if (team) query = query.eq("team", team);

    // 이름 검색 (입력이 있을 때만)
    if (q.length >= 2) {
      query = query.ilike("name", `%${q}%`);
    }

    const { data, error } = await query
      .order("name", { ascending: true })
      .limit(30);

    if (error) {
      return NextResponse.json(
        { error: `선수 검색 실패: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "서버 오류" },
      { status: 500 },
    );
  }
}
