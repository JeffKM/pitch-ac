// getPendingResultLeagues 테스트 — 시즌 인식 (구시즌 잔존 NS 행 제외)

import { beforeEach, describe, expect, it, vi } from "vitest";

import { createInMemorySupabase } from "@/lib/__tests__/in-memory-supabase";

vi.mock("server-only", () => ({}));

const db = createInMemorySupabase();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => db.client,
}));

import { getPendingResultLeagues } from "../schedule-calculator";

// 킥오프 2.5시간 경과 기준을 확실히 넘긴 과거 시각
const PAST = "2026-05-17T19:00:00Z";

describe("getPendingResultLeagues", () => {
  beforeEach(() => {
    db.reset();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("NS 행 없음 → 빈 배열", async () => {
    db.setRows("fixtures", [
      { league_id: 2021, season: "2025/2026", status: "FT", date: PAST },
    ]);
    expect(await getPendingResultLeagues()).toEqual([]);
  });

  it("최신 시즌 NS 행 → 해당 리그 반환", async () => {
    db.setRows("fixtures", [
      { league_id: 2021, season: "2026/2027", status: "NS", date: PAST },
    ]);
    const leagues = await getPendingResultLeagues();
    expect(leagues.map((l) => l.id)).toEqual([2021]);
  });

  it("구시즌 잔존 NS 행만 있는 리그 → 제외", async () => {
    // FL1: 2026/2027 행이 존재하므로 2025/2026 NS 행은 동기화로 해소 불가능한 잔존 행
    db.setRows("fixtures", [
      { league_id: 2015, season: "2025/2026", status: "NS", date: PAST },
      {
        league_id: 2015,
        season: "2026/2027",
        status: "NS",
        date: "2026-08-22T19:00:00Z",
      },
    ]);
    expect(await getPendingResultLeagues()).toEqual([]);
  });

  it("혼합: 구시즌만 잔존한 리그는 제외, 최신 시즌 pending 리그만 반환", async () => {
    db.setRows("fixtures", [
      // FL1 — 구시즌 잔존 행만
      { league_id: 2015, season: "2025/2026", status: "NS", date: PAST },
      {
        league_id: 2015,
        season: "2026/2027",
        status: "NS",
        date: "2026-08-22T19:00:00Z",
      },
      // PL — 최신 시즌 pending
      { league_id: 2021, season: "2026/2027", status: "NS", date: PAST },
    ]);
    const leagues = await getPendingResultLeagues();
    expect(leagues.map((l) => l.id)).toEqual([2021]);
  });

  it("새 시즌 fixtures가 아직 없으면 해당 시즌 NS 행은 최신으로 간주 (fail-open)", async () => {
    db.setRows("fixtures", [
      { league_id: 2021, season: "2025/2026", status: "NS", date: PAST },
      { league_id: 2021, season: "2025/2026", status: "FT", date: PAST },
    ]);
    const leagues = await getPendingResultLeagues();
    expect(leagues.map((l) => l.id)).toEqual([2021]);
  });

  it("DB 에러 → 빈 배열 (cron 조기 종료)", async () => {
    db.setError({ message: "connection refused" });
    expect(await getPendingResultLeagues()).toEqual([]);
  });
});
