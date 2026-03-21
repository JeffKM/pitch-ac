// 매치데이 유틸 함수 단위 테스트

import { describe, expect, it } from "vitest";

import {
  buildDateRange,
  groupFixturesByDate,
} from "@/app/(app)/matchday/_utils";
import type { Fixture } from "@/types";

// 테스트용 경기 생성 헬퍼
function makeFixture(overrides: Partial<Fixture>): Fixture {
  return {
    id: 1,
    gameweek: 28,
    date: "2025-03-15T15:00:00Z",
    homeTeamId: 42,
    awayTeamId: 49,
    status: "FT",
    homeScore: 2,
    awayScore: 1,
    minute: null,
    events: [],
    liveStats: null,
    lineups: null,
    ...overrides,
  };
}

// ─── groupFixturesByDate ──────────────────────────────────────────────────────

describe("groupFixturesByDate", () => {
  it("빈 배열 입력 시 빈 배열을 반환한다", () => {
    expect(groupFixturesByDate([])).toEqual([]);
  });

  it("같은 날 경기들을 하나의 그룹으로 묶는다", () => {
    // KST(+9h) 기준으로 같은 날(2025-03-15)이어야 함
    // UTC 01:00 = KST 10:00 / UTC 04:00 = KST 13:00 / UTC 08:00 = KST 17:00
    const fixtures = [
      makeFixture({ id: 1, date: "2025-03-15T01:00:00Z" }),
      makeFixture({ id: 2, date: "2025-03-15T04:00:00Z" }),
      makeFixture({ id: 3, date: "2025-03-15T08:00:00Z" }),
    ];

    const groups = groupFixturesByDate(fixtures);

    expect(groups).toHaveLength(1);
    expect(groups[0].fixtures).toHaveLength(3);
    expect(groups[0].dateKey).toBe("2025-03-15");
  });

  it("다른 날 경기들을 각각 별도 그룹으로 나눈다", () => {
    const fixtures = [
      makeFixture({ id: 1, date: "2025-03-15T12:00:00Z" }),
      makeFixture({ id: 2, date: "2025-03-16T15:00:00Z" }),
      makeFixture({ id: 3, date: "2025-03-17T17:30:00Z" }),
    ];

    const groups = groupFixturesByDate(fixtures);

    expect(groups).toHaveLength(3);
  });

  it("날짜 오름차순으로 정렬된 그룹을 반환한다", () => {
    // KST 기준 각 날짜 오전 시간대 사용
    const fixtures = [
      makeFixture({ id: 1, date: "2025-03-17T01:00:00Z" }),
      makeFixture({ id: 2, date: "2025-03-15T01:00:00Z" }),
      makeFixture({ id: 3, date: "2025-03-16T01:00:00Z" }),
    ];

    const groups = groupFixturesByDate(fixtures);

    expect(groups[0].dateKey).toBe("2025-03-15");
    expect(groups[1].dateKey).toBe("2025-03-16");
    expect(groups[2].dateKey).toBe("2025-03-17");
  });

  it("각 그룹에 dateLabel(한국어 형식)이 포함된다", () => {
    const fixtures = [makeFixture({ date: "2025-03-15T15:00:00Z" })];

    const groups = groupFixturesByDate(fixtures);

    // dateLabel이 비어 있지 않아야 함
    expect(groups[0].dateLabel).toBeTruthy();
    expect(typeof groups[0].dateLabel).toBe("string");
  });
});

// ─── buildDateRange ───────────────────────────────────────────────────────────

describe("buildDateRange", () => {
  it("빈 배열 입력 시 빈 문자열을 반환한다", () => {
    expect(buildDateRange([])).toBe("");
  });

  it("하루에만 경기가 있으면 단일 날짜 문자열을 반환한다", () => {
    // KST 기준 같은 날(2025-03-15)의 두 경기
    const fixtures = [
      makeFixture({ id: 1, date: "2025-03-15T01:00:00Z" }),
      makeFixture({ id: 2, date: "2025-03-15T04:00:00Z" }),
    ];

    const range = buildDateRange(fixtures);

    // 구분자 '–'가 없어야 함 (단일 날짜)
    expect(range).not.toContain("–");
    expect(range).toBeTruthy();
  });

  it("여러 날에 걸쳐 경기가 있으면 범위 문자열을 반환한다 (– 포함)", () => {
    const fixtures = [
      makeFixture({ id: 1, date: "2025-03-15T01:00:00Z" }),
      makeFixture({ id: 2, date: "2025-03-17T01:00:00Z" }),
    ];

    const range = buildDateRange(fixtures);

    expect(range).toContain("–");
  });

  it("경기가 하나뿐이면 단일 날짜 문자열을 반환한다", () => {
    const fixtures = [makeFixture({ date: "2025-03-15T15:00:00Z" })];

    const range = buildDateRange(fixtures);

    expect(range).not.toContain("–");
    expect(range).toBeTruthy();
  });
});
