// 시즌 라벨 파생 유틸 단위 테스트

import { describe, expect, it } from "vitest";

import { deriveSeasonLabel, deriveSeasonLabelFromMatches } from "../season";
import type { FdMatch, FdSeason } from "../types";

function makeSeason(startDate: string): FdSeason {
  return {
    id: 2403,
    startDate,
    endDate: "2027-05-30",
    currentMatchday: 1,
    winner: null,
  };
}

function makeMatch(startDate: string): FdMatch {
  return {
    id: 500001,
    utcDate: "2026-08-21T19:00:00Z",
    status: "SCHEDULED",
    matchday: 1,
    stage: "REGULAR_SEASON",
    group: null,
    lastUpdated: "2026-07-30T00:00:00Z",
    homeTeam: {
      id: 65,
      name: "Manchester City FC",
      shortName: "Man City",
      tla: "MCI",
      crest: "https://crests.football-data.org/65.svg",
    },
    awayTeam: {
      id: 57,
      name: "Arsenal FC",
      shortName: "Arsenal",
      tla: "ARS",
      crest: "https://crests.football-data.org/57.svg",
    },
    score: {
      winner: null,
      duration: "REGULAR",
      fullTime: { home: null, away: null },
      halfTime: { home: null, away: null },
    },
    referees: [],
    competition: {
      id: 2021,
      name: "Premier League",
      code: "PL",
      type: "LEAGUE",
      emblem: "",
    },
    season: makeSeason(startDate),
    area: { id: 2072, name: "England", code: "ENG", flag: null },
  };
}

describe("deriveSeasonLabel", () => {
  it("2026-08-21 개막 → 2026/2027", () => {
    expect(deriveSeasonLabel(makeSeason("2026-08-21"))).toBe("2026/2027");
  });

  it("UCL처럼 아직 전환 전인 대회 → 2025/2026", () => {
    expect(deriveSeasonLabel(makeSeason("2025-07-08"))).toBe("2025/2026");
  });

  it("startDate 형식이 잘못되면 예외", () => {
    expect(() => deriveSeasonLabel(makeSeason("2026/08/21"))).toThrow(
      /startDate/,
    );
  });
});

describe("deriveSeasonLabelFromMatches", () => {
  it("첫 경기의 season에서 라벨 파생", () => {
    expect(deriveSeasonLabelFromMatches([makeMatch("2026-08-21")])).toBe(
      "2026/2027",
    );
  });

  it("빈 배열이면 null", () => {
    expect(deriveSeasonLabelFromMatches([])).toBeNull();
  });
});
