// ScoutLab 선수 검색 API — 리그/팀 필터 + 이름 검색
import { NextResponse } from "next/server";

import { SCOUTLAB_ACTIVE_SEASON } from "@/lib/constants/scoutlab";
import { matchesSearchQuery } from "@/lib/search-utils";
import { createClient } from "@/lib/supabase/server";

// PostgREST의 db-max-rows 상한(기본 1000) 이하로 맞춘 페이지 크기.
// 상한보다 크게 요청해도 PostgREST가 앞부분만 잘라 반환하므로 반드시
// 이 크기 이하로 나눠 range 페이지네이션해야 전량을 받을 수 있다.
const PAGE_SIZE = 1000;

interface ScoutlabPlayerRow {
  id: number;
  name: string;
  team: string;
  league: string;
  position: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const season = searchParams.get("season") ?? SCOUTLAB_ACTIVE_SEASON;
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

    // season/league/team 필터가 적용된 쿼리를 매 페이지마다 새로 구성한다.
    // Supabase 쿼리 빌더는 한 번 await되면 재사용할 수 없고, 체이닝된 필터가
    // 누적되므로 range()만 바꿔 재사용하는 방식은 쓸 수 없다.
    function buildQuery() {
      let builder = supabase
        .from("scoutlab_players")
        .select("id, name, team, league, position")
        .eq("season", season);
      if (league) builder = builder.eq("league", league);
      if (team) builder = builder.eq("team", team);
      return builder;
    }

    // 이름 검색은 DB ilike 대신 애플리케이션 레벨에서 악센트 무관(diacritics-insensitive)
    // 매칭을 수행한다. Postgres ilike는 대소문자만 무시하고 악센트는 구분하므로
    // "Dembele"로 "Dembélé"를 찾지 못하는 문제가 있었다.
    //
    // PostgREST의 db-max-rows 상한(기본 1000) 때문에 range 없이 한 번에 조회하면
    // 앞쪽 1000행만 반환되어 name 오름차순 정렬상 뒤쪽 선수들이 검색에서 누락된다.
    // 선수 풀은 시즌당 수천 명 규모이므로 PAGE_SIZE 단위로 나눠 전량을 받는다.
    const allRows: ScoutlabPlayerRow[] = [];
    let offset = 0;
    for (;;) {
      const { data: page, error } = await buildQuery()
        .order("name", { ascending: true })
        .order("id", { ascending: true }) // 동명이인 tie-break — 페이지 경계에서 중복·누락 방지
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) {
        return NextResponse.json(
          { error: `선수 검색 실패: ${error.message}` },
          { status: 500 },
        );
      }

      const rows = (page ?? []) as ScoutlabPlayerRow[];
      allRows.push(...rows);
      if (rows.length < PAGE_SIZE) break;
      offset += PAGE_SIZE;
    }

    const filtered =
      q.length >= 2
        ? allRows.filter((player) => matchesSearchQuery(player.name, q))
        : allRows;
    const result = filtered.slice(0, 30);

    // 선수 풀은 동기화 주기가 길어 CDN 캐시로 검색 반복 호출 흡수 (URL 단위 캐시)
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "서버 오류" },
      { status: 500 },
    );
  }
}
