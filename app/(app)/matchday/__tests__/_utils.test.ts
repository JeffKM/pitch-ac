// 매치데이 유틸 함수 단위 테스트

import { describe, expect, it } from "vitest";

import type { Fixture } from "@/types";

import { buildDateRange, groupFixturesByDate } from "../_utils";

// 테스트용 fixture 팩토리
function makeFixture(overrides: Partial<Fixture> = {}): Fixture {
  return {
    id: 1,
    gameweek: 1,
    date: "2026-03-20T20:00:00Z",
    homeTeamId: 1,
    awayTeamId: 2,
    status: "NS",
    homeScore: null,
    awayScore: null,
    minute: null,
    events: [],
    liveStats: null,
    lineups: null,
    leagueId: 8,
    competitionName: null,
    ...overrides,
  };
}

// ─── groupFixturesByDate ───────────────────────

describe("groupFixturesByDate", () => {
  it("동일 날짜 경기들을 한 그룹으로", () => {
    const fixtures = [
      makeFixture({ id: 1, date: "2026-03-20T15:00:00Z" }),
      makeFixture({ id: 2, date: "2026-03-20T17:30:00Z" }),
      makeFixture({ id: 3, date: "2026-03-20T20:00:00Z" }),
    ];
    const groups = groupFixturesByDate(fixtures);
    expect(groups).toHaveLength(1);
    expect(groups[0].fixtures).toHaveLength(3);
  });

  it("다른 날짜 경기들을 분리", () => {
    const fixtures = [
      makeFixture({ id: 1, date: "2026-03-20T20:00:00Z" }),
      makeFixture({ id: 2, date: "2026-03-21T15:00:00Z" }),
    ];
    const groups = groupFixturesByDate(fixtures);
    expect(groups).toHaveLength(2);
  });

  it("날짜순 정렬", () => {
    const fixtures = [
      makeFixture({ id: 1, date: "2026-03-22T20:00:00Z" }),
      makeFixture({ id: 2, date: "2026-03-20T15:00:00Z" }),
      makeFixture({ id: 3, date: "2026-03-21T17:30:00Z" }),
    ];
    const groups = groupFixturesByDate(fixtures);
    // KST 기준 날짜순
    expect(groups[0].dateKey < groups[1].dateKey).toBe(true);
    expect(groups[1].dateKey < groups[2].dateKey).toBe(true);
  });

  it("빈 배열 → 빈 결과", () => {
    expect(groupFixturesByDate([])).toEqual([]);
  });
});

// ─── buildDateRange ────────────────────────────

describe("buildDateRange", () => {
  it("빈 배열 → 빈 문자열", () => {
    expect(buildDateRange([])).toBe("");
  });

  it("동일 날짜 → 단일 날짜 문자열", () => {
    const fixtures = [
      makeFixture({ date: "2026-03-20T15:00:00Z" }),
      makeFixture({ date: "2026-03-20T20:00:00Z" }),
    ];
    const result = buildDateRange(fixtures);
    // KST 기준 같은 날짜이면 범위 없이 단일 날짜
    expect(result).not.toContain("–");
  });

  it("다른 날짜 → 범위 문자열", () => {
    const fixtures = [
      makeFixture({ date: "2026-03-20T15:00:00Z" }),
      makeFixture({ date: "2026-03-22T20:00:00Z" }),
    ];
    const result = buildDateRange(fixtures);
    expect(result).toContain("–");
  });

  it("컵 경기 날짜는 범위에서 제외", () => {
    const fixtures = [
      // PL 경기: 3/22
      makeFixture({ id: 1, date: "2026-03-22T20:00:00Z", leagueId: 8 }),
      // FA Cup 경기: 3/8 (범위에 포함되면 안 됨)
      makeFixture({
        id: 2,
        date: "2026-03-08T15:00:00Z",
        leagueId: 24,
        competitionName: "FA Cup",
      }),
      // EFL Cup 경기: 3/25 (범위에 포함되면 안 됨)
      makeFixture({
        id: 3,
        date: "2026-03-25T20:00:00Z",
        leagueId: 27,
        competitionName: "EFL Cup",
      }),
    ];
    const result = buildDateRange(fixtures);
    // PL 경기만으로 범위 계산 → 단일 날짜 (3/23 KST)
    expect(result).not.toContain("–");
  });

  it("PL 경기 없으면 전체 경기로 fallback", () => {
    const fixtures = [
      makeFixture({
        id: 1,
        date: "2026-03-08T15:00:00Z",
        leagueId: 24,
        competitionName: "FA Cup",
      }),
      makeFixture({
        id: 2,
        date: "2026-03-25T20:00:00Z",
        leagueId: 27,
        competitionName: "EFL Cup",
      }),
    ];
    const result = buildDateRange(fixtures);
    // 컵 경기만 있으면 fallback → 범위 표시
    expect(result).toContain("–");
  });
});
