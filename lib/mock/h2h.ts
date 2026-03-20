// H2H(맞대결) 최근 5경기 더미 데이터 — 팀 쌍별

import type { H2HResult } from "@/types";

/**
 * 팀 쌍의 H2H 결과 맵
 * 키: `${smallerId}-${largerId}` 형식 (팀 ID 오름차순)
 */
const mockH2H: Record<string, H2HResult[]> = {
  // Arsenal(42) vs Chelsea(49) — 5001
  "42-49": [
    {
      fixtureId: 4001,
      date: "2024-10-20",
      homeTeamId: 49,
      awayTeamId: 42,
      homeScore: 1,
      awayScore: 1,
    },
    {
      fixtureId: 3901,
      date: "2024-04-23",
      homeTeamId: 42,
      awayTeamId: 49,
      homeScore: 5,
      awayScore: 0,
    },
    {
      fixtureId: 3801,
      date: "2023-11-04",
      homeTeamId: 49,
      awayTeamId: 42,
      homeScore: 2,
      awayScore: 2,
    },
    {
      fixtureId: 3701,
      date: "2023-05-02",
      homeTeamId: 42,
      awayTeamId: 49,
      homeScore: 3,
      awayScore: 1,
    },
    {
      fixtureId: 3601,
      date: "2022-11-06",
      homeTeamId: 49,
      awayTeamId: 42,
      homeScore: 0,
      awayScore: 1,
    },
  ],

  // Liverpool(40) vs Man City(50) — 5002
  "40-50": [
    {
      fixtureId: 4002,
      date: "2024-11-25",
      homeTeamId: 50,
      awayTeamId: 40,
      homeScore: 0,
      awayScore: 2,
    },
    {
      fixtureId: 3902,
      date: "2024-03-10",
      homeTeamId: 40,
      awayTeamId: 50,
      homeScore: 1,
      awayScore: 1,
    },
    {
      fixtureId: 3802,
      date: "2023-10-29",
      homeTeamId: 50,
      awayTeamId: 40,
      homeScore: 4,
      awayScore: 1,
    },
    {
      fixtureId: 3702,
      date: "2023-04-01",
      homeTeamId: 40,
      awayTeamId: 50,
      homeScore: 1,
      awayScore: 0,
    },
    {
      fixtureId: 3602,
      date: "2022-10-16",
      homeTeamId: 50,
      awayTeamId: 40,
      homeScore: 3,
      awayScore: 2,
    },
  ],

  // Man United(33) vs Tottenham(47) — 5003, 5006
  "33-47": [
    {
      fixtureId: 4003,
      date: "2024-09-29",
      homeTeamId: 47,
      awayTeamId: 33,
      homeScore: 3,
      awayScore: 0,
    },
    {
      fixtureId: 3903,
      date: "2024-02-14",
      homeTeamId: 33,
      awayTeamId: 47,
      homeScore: 2,
      awayScore: 2,
    },
    {
      fixtureId: 3803,
      date: "2023-10-19",
      homeTeamId: 47,
      awayTeamId: 33,
      homeScore: 2,
      awayScore: 0,
    },
    {
      fixtureId: 3703,
      date: "2023-04-27",
      homeTeamId: 33,
      awayTeamId: 47,
      homeScore: 2,
      awayScore: 2,
    },
    {
      fixtureId: 3603,
      date: "2022-10-19",
      homeTeamId: 47,
      awayTeamId: 33,
      homeScore: 0,
      awayScore: 2,
    },
  ],

  // Chelsea(49) vs Liverpool(40) — 5004
  "40-49": [
    {
      fixtureId: 4004,
      date: "2024-10-20",
      homeTeamId: 40,
      awayTeamId: 49,
      homeScore: 2,
      awayScore: 1,
    },
    {
      fixtureId: 3904,
      date: "2024-04-04",
      homeTeamId: 49,
      awayTeamId: 40,
      homeScore: 1,
      awayScore: 1,
    },
    {
      fixtureId: 3804,
      date: "2023-10-21",
      homeTeamId: 40,
      awayTeamId: 49,
      homeScore: 1,
      awayScore: 2,
    },
    {
      fixtureId: 3704,
      date: "2023-04-04",
      homeTeamId: 49,
      awayTeamId: 40,
      homeScore: 0,
      awayScore: 0,
    },
    {
      fixtureId: 3604,
      date: "2022-09-18",
      homeTeamId: 40,
      awayTeamId: 49,
      homeScore: 1,
      awayScore: 0,
    },
  ],

  // Man City(50) vs Arsenal(42) — 5005
  "42-50": [
    {
      fixtureId: 4005,
      date: "2024-09-22",
      homeTeamId: 42,
      awayTeamId: 50,
      homeScore: 2,
      awayScore: 2,
    },
    {
      fixtureId: 3905,
      date: "2024-03-31",
      homeTeamId: 50,
      awayTeamId: 42,
      homeScore: 0,
      awayScore: 0,
    },
    {
      fixtureId: 3805,
      date: "2023-10-08",
      homeTeamId: 42,
      awayTeamId: 50,
      homeScore: 1,
      awayScore: 0,
    },
    {
      fixtureId: 3705,
      date: "2023-04-26",
      homeTeamId: 50,
      awayTeamId: 42,
      homeScore: 4,
      awayScore: 1,
    },
    {
      fixtureId: 3605,
      date: "2022-08-13",
      homeTeamId: 42,
      awayTeamId: 50,
      homeScore: 1,
      awayScore: 0,
    },
  ],
};

/** 두 팀 간 H2H 결과 조회 (날짜 내림차순, 최근 5경기) */
export function getH2HResults(teamIdA: number, teamIdB: number): H2HResult[] {
  const key = [teamIdA, teamIdB].sort((a, b) => a - b).join("-");
  return mockH2H[key] ?? [];
}
