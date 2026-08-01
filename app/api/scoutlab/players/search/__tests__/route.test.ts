// ScoutLab 선수 검색 API 테스트 — 악센트 무관(diacritics-insensitive) 매칭 검증

import { beforeEach, describe, expect, it, vi } from "vitest";

import { createInMemorySupabase } from "@/lib/__tests__/in-memory-supabase";

vi.mock("server-only", () => ({}));

const db = createInMemorySupabase();

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => db.client,
}));

const { GET } = await import("../route");

const SEASON = "25/26";

describe("GET /api/scoutlab/players/search", () => {
  beforeEach(() => {
    db.reset();
    db.setRows("scoutlab_players", [
      {
        id: 1,
        name: "Ousmane Dembélé",
        team: "Paris Saint-Germain",
        league: "Ligue 1",
        position: "FW",
        season: SEASON,
      },
      {
        id: 2,
        name: "Alexander Sørloth",
        team: "Atlético Madrid",
        league: "La Liga",
        position: "FW",
        season: SEASON,
      },
      {
        id: 3,
        name: "Wojciech Szczęsny",
        team: "Barcelona",
        league: "La Liga",
        position: "GK",
        season: SEASON,
      },
    ]);
  });

  it("악센트 없는 검색어로 악센트가 포함된 선수명을 찾는다 (Dembele → Dembélé)", async () => {
    const res = await GET(
      new Request(
        `http://localhost/api/scoutlab/players/search?q=Dembele&season=${SEASON}`,
      ),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0].name).toBe("Ousmane Dembélé");
  });

  it("ø가 포함된 이름을 o로 검색해도 찾는다 (Sorloth → Sørloth)", async () => {
    const res = await GET(
      new Request(
        `http://localhost/api/scoutlab/players/search?q=Sorloth&season=${SEASON}`,
      ),
    );
    const body = await res.json();

    expect(body).toHaveLength(1);
    expect(body[0].name).toBe("Alexander Sørloth");
  });

  it("ę가 포함된 이름을 e로 검색해도 찾는다 (Szczesny → Szczęsny)", async () => {
    const res = await GET(
      new Request(
        `http://localhost/api/scoutlab/players/search?q=Szczesny&season=${SEASON}`,
      ),
    );
    const body = await res.json();

    expect(body).toHaveLength(1);
    expect(body[0].name).toBe("Wojciech Szczęsny");
  });

  it("일치하지 않는 검색어는 빈 배열을 반환한다", async () => {
    const res = await GET(
      new Request(
        `http://localhost/api/scoutlab/players/search?q=Messi&season=${SEASON}`,
      ),
    );
    const body = await res.json();

    expect(body).toHaveLength(0);
  });

  it("검색어에 40건 이상 매칭돼도 응답은 정확히 30건이다 (필터 후 slice)", async () => {
    const rows = Array.from({ length: 45 }, (_, i) => ({
      id: 100 + i,
      name: `Match Player ${String(i).padStart(2, "0")}`,
      team: "Test FC",
      league: "Test League",
      position: "FW",
      season: SEASON,
    }));
    db.setRows("scoutlab_players", rows);

    const res = await GET(
      new Request(
        `http://localhost/api/scoutlab/players/search?q=Match&season=${SEASON}`,
      ),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveLength(30);
    // name 오름차순 정렬 기준 앞 30건("Match Player 00" ~ "Match Player 29")이어야 한다
    expect(body[0].name).toBe("Match Player 00");
    expect(body[29].name).toBe("Match Player 29");
  });

  it("PostgREST db-max-rows(1,000행) 상한을 넘는 위치의 선수도 페이지네이션으로 찾는다", async () => {
    // 숫자로만 구성된 이름은 알파벳 이름보다 사전순으로 앞서므로,
    // 1,005개의 더미 행을 만들어 목표 선수를 1,000행 상한 너머(1006번째)에 배치한다
    const dummyRows = Array.from({ length: 1005 }, (_, i) => ({
      id: i,
      name: String(i).padStart(7, "0"),
      team: "Dummy FC",
      league: "Dummy League",
      position: "FW",
      season: SEASON,
    }));
    db.setRows("scoutlab_players", [
      ...dummyRows,
      {
        id: 9999,
        name: "Alexander Sørloth",
        team: "Atlético Madrid",
        league: "La Liga",
        position: "FW",
        season: SEASON,
      },
    ]);
    db.setMaxRows(1000);

    const res = await GET(
      new Request(
        `http://localhost/api/scoutlab/players/search?q=Sorloth&season=${SEASON}`,
      ),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0].name).toBe("Alexander Sørloth");
  });
});
