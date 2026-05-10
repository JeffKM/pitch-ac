// scoutlab-search-params.ts 단위 테스트

import { describe, expect, it } from "vitest";

import { parseScoutlabParams } from "../scoutlab-search-params";

describe("parseScoutlabParams", () => {
  it("빈 파라미터 → 기본값 반환", () => {
    const result = parseScoutlabParams({});
    expect(result).toEqual({
      playerId: null,
      season: "25/26",
      league: null,
      team: null,
      position: null,
      mode: "per90",
      adjustment: "padj",
    });
  });

  it("유효한 파라미터 모두 파싱", () => {
    const result = parseScoutlabParams({
      playerId: "42",
      season: "24/25",
      league: "La Liga",
      team: "Barcelona",
      position: "FW",
      mode: "total",
      adjustment: "raw",
    });
    expect(result).toEqual({
      playerId: 42,
      season: "24/25",
      league: "La Liga",
      team: "Barcelona",
      position: "FW",
      mode: "total",
      adjustment: "raw",
    });
  });

  it("무효한 playerId → null", () => {
    expect(parseScoutlabParams({ playerId: "abc" }).playerId).toBeNull();
    expect(parseScoutlabParams({ playerId: "" }).playerId).toBeNull();
  });

  it("무효한 league → null", () => {
    expect(parseScoutlabParams({ league: "MLS" }).league).toBeNull();
    expect(parseScoutlabParams({ league: "" }).league).toBeNull();
  });

  it("무효한 position → null", () => {
    expect(parseScoutlabParams({ position: "GK" }).position).toBeNull();
    expect(parseScoutlabParams({ position: "XYZ" }).position).toBeNull();
  });

  it("무효한 mode → 기본값 per90", () => {
    expect(parseScoutlabParams({ mode: "invalid" }).mode).toBe("per90");
  });

  it("무효한 adjustment → 기본값 padj", () => {
    expect(parseScoutlabParams({ adjustment: "invalid" }).adjustment).toBe(
      "padj",
    );
  });

  it("배열 파라미터 → 첫 번째 값 사용", () => {
    const result = parseScoutlabParams({
      playerId: ["10", "20"],
      league: ["Serie A", "Bundesliga"],
    });
    expect(result.playerId).toBe(10);
    expect(result.league).toBe("Serie A");
  });

  it("유효한 포지션 목록 전체 확인", () => {
    const positions = ["CB", "FB", "MF", "AM", "W", "AM/W", "FW"];
    for (const pos of positions) {
      expect(parseScoutlabParams({ position: pos }).position).toBe(pos);
    }
  });

  it("유효한 리그 목록 전체 확인", () => {
    const leagues = [
      "Premier League",
      "La Liga",
      "Serie A",
      "Bundesliga",
      "Ligue 1",
    ];
    for (const league of leagues) {
      expect(parseScoutlabParams({ league }).league).toBe(league);
    }
  });
});
