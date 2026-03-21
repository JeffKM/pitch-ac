// 순위/백분위 계산 유틸 단위 테스트

import { describe, expect, it } from "vitest";

import { computePercentile, computeRanks } from "../calculate-context";

// ─── computeRanks ──────────────────────────────

describe("computeRanks", () => {
  it("내림차순 순위 부여", () => {
    const entries = [
      { playerId: 1, value: 10 },
      { playerId: 2, value: 20 },
      { playerId: 3, value: 15 },
    ];
    const ranks = computeRanks(entries);
    expect(ranks.get(2)).toBe(1); // 20 → 1위
    expect(ranks.get(3)).toBe(2); // 15 → 2위
    expect(ranks.get(1)).toBe(3); // 10 → 3위
  });

  it("동점 처리 (Standard Competition Ranking)", () => {
    const entries = [
      { playerId: 1, value: 19 },
      { playerId: 2, value: 19 },
      { playerId: 3, value: 14 },
      { playerId: 4, value: 10 },
    ];
    const ranks = computeRanks(entries);
    expect(ranks.get(1)).toBe(1);
    expect(ranks.get(2)).toBe(1); // 동점 → 같은 순위
    expect(ranks.get(3)).toBe(3); // 3위 (2위 건너뜀)
    expect(ranks.get(4)).toBe(4);
  });

  it("빈 배열", () => {
    const ranks = computeRanks([]);
    expect(ranks.size).toBe(0);
  });

  it("단일 항목", () => {
    const ranks = computeRanks([{ playerId: 1, value: 5 }]);
    expect(ranks.get(1)).toBe(1);
  });
});

// ─── computePercentile ─────────────────────────

describe("computePercentile", () => {
  it("1위 → 100", () => {
    expect(computePercentile(1, 20)).toBe(100);
  });

  it("꼴찌 → 0", () => {
    expect(computePercentile(20, 20)).toBe(0);
  });

  it("단독 (totalCount=1) → 100", () => {
    expect(computePercentile(1, 1)).toBe(100);
  });

  it("중간값 정확성", () => {
    // rank=11, total=21 → ((21-11)/(21-1)) * 100 = 50
    expect(computePercentile(11, 21)).toBe(50);
  });

  it("결과가 0~100 범위 내", () => {
    for (let rank = 1; rank <= 50; rank++) {
      const p = computePercentile(rank, 50);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(100);
    }
  });
});
