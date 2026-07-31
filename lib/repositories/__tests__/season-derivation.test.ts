// 시즌 파생 로직 테스트 — "YYYY/YYYY" 고정폭 문자열 내림차순 = 최신 전제 검증
// 대상: getLatestStandingSeasons, getCurrentGameweek, resolveStatsSeasons

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createInMemorySupabase } from "@/lib/__tests__/in-memory-supabase";
import { createAdminClient } from "@/lib/supabase/admin";

vi.mock("server-only", () => ({}));

const db = createInMemorySupabase();

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => db.client,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => db.client,
}));

import { resolveStatsSeasons } from "@/lib/services/sync/calculate-context";

import { getCurrentGameweek } from "../fixture-repository";
import { getLatestStandingSeasons } from "../standing-repository";

// ─── getLatestStandingSeasons ───────────────────

describe("getLatestStandingSeasons", () => {
  beforeEach(() => db.reset());

  it("대회별 최신 시즌 파생 — UCL 롤오버 시차 반영", async () => {
    db.setRows("standings", [
      { league_id: 2021, season: "2025/2026" },
      { league_id: 2021, season: "2026/2027" },
      // UCL은 아직 25/26만 존재 (롤오버 시차)
      { league_id: 2001, season: "2025/2026" },
    ]);

    const latest = await getLatestStandingSeasons();
    expect(latest.get(2021)).toBe("2026/2027");
    expect(latest.get(2001)).toBe("2025/2026");
  });

  it("빈 테이블 → 빈 Map", async () => {
    db.setRows("standings", []);
    const latest = await getLatestStandingSeasons();
    expect(latest.size).toBe(0);
  });

  it("DB 에러 → throw", async () => {
    db.setError({ message: "connection refused" });
    await expect(getLatestStandingSeasons()).rejects.toThrow(
      "standings 시즌 조회 실패",
    );
  });
});

// ─── getCurrentGameweek ─────────────────────────

describe("getCurrentGameweek", () => {
  beforeEach(() => {
    db.reset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("1순위: LIVE 경기의 gameweek", async () => {
    db.setRows("fixtures", [
      {
        league_id: 2021,
        season: "2026/2027",
        status: "LIVE",
        gameweek: 3,
        date: "2026-08-01T00:30:00Z",
      },
      {
        league_id: 2021,
        season: "2026/2027",
        status: "NS",
        gameweek: 4,
        date: "2026-08-08T19:00:00Z",
      },
    ]);

    expect(await getCurrentGameweek(2021)).toEqual({
      gameweek: 3,
      season: "2026/2027",
    });
  });

  it("2순위: 가장 가까운 미래 NS 경기의 gameweek", async () => {
    db.setRows("fixtures", [
      {
        league_id: 2021,
        season: "2026/2027",
        status: "NS",
        gameweek: 2,
        date: "2026-08-28T19:00:00Z",
      },
      {
        league_id: 2021,
        season: "2026/2027",
        status: "NS",
        gameweek: 1,
        date: "2026-08-21T19:00:00Z",
      },
    ]);

    expect(await getCurrentGameweek(2021)).toEqual({
      gameweek: 1,
      season: "2026/2027",
    });
  });

  it("3순위: 가장 최근 FT 경기의 gameweek", async () => {
    db.setRows("fixtures", [
      {
        league_id: 2021,
        season: "2025/2026",
        status: "FT",
        gameweek: 37,
        date: "2026-05-19T18:30:00Z",
      },
      {
        league_id: 2021,
        season: "2025/2026",
        status: "FT",
        gameweek: 38,
        date: "2026-05-24T15:00:00Z",
      },
    ]);

    expect(await getCurrentGameweek(2021)).toEqual({
      gameweek: 38,
      season: "2025/2026",
    });
  });

  it("구시즌 stuck LIVE 행은 최신 시즌 판별을 가로막지 않음", async () => {
    db.setRows("fixtures", [
      // 구시즌 stuck LIVE (재동기화로 회복 안 되는 잔존 행)
      {
        league_id: 2021,
        season: "2025/2026",
        status: "LIVE",
        gameweek: 37,
        date: "2026-05-19T18:30:00Z",
      },
      // 최신 시즌 개막전 NS
      {
        league_id: 2021,
        season: "2026/2027",
        status: "NS",
        gameweek: 1,
        date: "2026-08-21T19:00:00Z",
      },
    ]);

    expect(await getCurrentGameweek(2021)).toEqual({
      gameweek: 1,
      season: "2026/2027",
    });
  });

  it("데이터 없음 → fallback {gameweek: 1, season: null}", async () => {
    db.setRows("fixtures", []);
    expect(await getCurrentGameweek(2021)).toEqual({
      gameweek: 1,
      season: null,
    });
  });
});

// ─── resolveStatsSeasons ────────────────────────

describe("resolveStatsSeasons", () => {
  beforeEach(() => db.reset());

  const supabase = db.client as ReturnType<typeof createAdminClient>;

  it("최신/직전 시즌 파생", async () => {
    db.setRows("player_season_stats", [
      { season: "2024/2025" },
      { season: "2025/2026" },
      { season: "2026/2027" },
    ]);

    expect(await resolveStatsSeasons(supabase)).toEqual({
      currentSeason: "2026/2027",
      prevSeason: "2025/2026",
    });
  });

  it("시즌 1개뿐 → prevSeason null", async () => {
    db.setRows("player_season_stats", [{ season: "2025/2026" }]);

    expect(await resolveStatsSeasons(supabase)).toEqual({
      currentSeason: "2025/2026",
      prevSeason: null,
    });
  });

  it("빈 테이블 → 둘 다 null", async () => {
    db.setRows("player_season_stats", []);

    expect(await resolveStatsSeasons(supabase)).toEqual({
      currentSeason: null,
      prevSeason: null,
    });
  });

  it("DB 에러 → throw", async () => {
    db.setError({ message: "connection refused" });
    await expect(resolveStatsSeasons(supabase)).rejects.toBeTruthy();
  });
});
