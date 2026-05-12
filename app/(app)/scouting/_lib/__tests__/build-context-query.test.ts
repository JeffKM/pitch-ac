// buildContextQuery 단위 테스트

import { describe, expect, it } from "vitest";

import { buildContextQuery } from "../build-context-query";

describe("buildContextQuery", () => {
  it("playerId + 비기본 season → query string 유지", () => {
    const sp = new URLSearchParams("playerId=1&season=24/25");
    expect(buildContextQuery(sp)).toBe("?playerId=1&season=24%2F25");
  });

  it("기본값 season(25/26)은 URL에 포함하지 않음", () => {
    const sp = new URLSearchParams("playerId=1&season=25/26");
    expect(buildContextQuery(sp)).toBe("?playerId=1");
  });

  it("기본값 mode(per90)는 URL에 포함하지 않음", () => {
    const sp = new URLSearchParams("playerId=1&mode=per90");
    expect(buildContextQuery(sp)).toBe("?playerId=1");
  });

  it("기본값 adjustment(padj)는 URL에 포함하지 않음", () => {
    const sp = new URLSearchParams("playerId=1&adjustment=padj");
    expect(buildContextQuery(sp)).toBe("?playerId=1");
  });

  it("비기본 mode(total) → URL에 포함", () => {
    const sp = new URLSearchParams("playerId=1&mode=total");
    expect(buildContextQuery(sp)).toBe("?playerId=1&mode=total");
  });

  it("비기본 adjustment(raw) → URL에 포함", () => {
    const sp = new URLSearchParams("playerId=1&adjustment=raw");
    expect(buildContextQuery(sp)).toBe("?playerId=1&adjustment=raw");
  });

  it("모든 컨텍스트 파라미터 비기본값 → 전부 포함", () => {
    const sp = new URLSearchParams(
      "playerId=42&season=24/25&mode=total&adjustment=raw",
    );
    const result = buildContextQuery(sp);
    expect(result).toContain("playerId=42");
    expect(result).toContain("season=24%2F25");
    expect(result).toContain("mode=total");
    expect(result).toContain("adjustment=raw");
  });

  it("파라미터 없는 초기 상태 → 빈 문자열", () => {
    const sp = new URLSearchParams();
    expect(buildContextQuery(sp)).toBe("");
  });

  it("컨텍스트 외 파라미터(league, position 등)는 무시", () => {
    const sp = new URLSearchParams(
      "playerId=1&league=La+Liga&position=FW&team=Barcelona",
    );
    expect(buildContextQuery(sp)).toBe("?playerId=1");
  });

  it("모든 값이 기본값이면 빈 문자열", () => {
    const sp = new URLSearchParams("season=25/26&mode=per90&adjustment=padj");
    expect(buildContextQuery(sp)).toBe("");
  });

  it("기본값 comparisonPosition(AM/W)는 URL에 포함하지 않음", () => {
    const sp = new URLSearchParams("playerId=1&comparisonPosition=AM/W");
    expect(buildContextQuery(sp)).toBe("?playerId=1");
  });

  it("비기본 comparisonPosition(CB) → URL에 포함", () => {
    const sp = new URLSearchParams("playerId=1&comparisonPosition=CB");
    expect(buildContextQuery(sp)).toBe("?playerId=1&comparisonPosition=CB");
  });
});
