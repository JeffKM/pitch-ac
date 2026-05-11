// 팀 더미 데이터 — 빅6 (mock용 placeholder ID)

import type { Team, TeamStanding } from "@/types";

export const mockTeams: Team[] = [
  {
    id: 42,
    name: "Arsenal",
    shortName: "ARS",
    logoUrl: "https://crests.football-data.org/42.svg",
    season: "2024-25",
  },
  {
    id: 49,
    name: "Chelsea",
    shortName: "CHE",
    logoUrl: "https://crests.football-data.org/49.svg",
    season: "2024-25",
  },
  {
    id: 40,
    name: "Liverpool",
    shortName: "LIV",
    logoUrl: "https://crests.football-data.org/40.svg",
    season: "2024-25",
  },
  {
    id: 50,
    name: "Manchester City",
    shortName: "MCI",
    logoUrl: "https://crests.football-data.org/50.svg",
    season: "2024-25",
  },
  {
    id: 33,
    name: "Manchester United",
    shortName: "MUN",
    logoUrl: "https://crests.football-data.org/33.svg",
    season: "2024-25",
  },
  {
    id: 47,
    name: "Tottenham",
    shortName: "TOT",
    logoUrl: "https://crests.football-data.org/47.svg",
    season: "2024-25",
  },
];

export const mockStandings: TeamStanding[] = [
  {
    teamId: 40,
    position: 1,
    played: 27,
    won: 20,
    drawn: 5,
    lost: 2,
    goalsFor: 68,
    goalsAgainst: 28,
    goalDifference: 40,
    points: 65,
    form: ["W", "W", "D", "W", "W"],
  },
  {
    teamId: 42,
    position: 2,
    played: 27,
    won: 18,
    drawn: 5,
    lost: 4,
    goalsFor: 62,
    goalsAgainst: 30,
    goalDifference: 32,
    points: 59,
    form: ["W", "D", "W", "W", "L"],
  },
  {
    teamId: 50,
    position: 3,
    played: 27,
    won: 16,
    drawn: 4,
    lost: 7,
    goalsFor: 55,
    goalsAgainst: 38,
    goalDifference: 17,
    points: 52,
    form: ["L", "W", "W", "D", "W"],
  },
  {
    teamId: 49,
    position: 4,
    played: 27,
    won: 14,
    drawn: 6,
    lost: 7,
    goalsFor: 52,
    goalsAgainst: 40,
    goalDifference: 12,
    points: 48,
    form: ["W", "D", "W", "L", "W"],
  },
  {
    teamId: 47,
    position: 9,
    played: 27,
    won: 10,
    drawn: 5,
    lost: 12,
    goalsFor: 42,
    goalsAgainst: 52,
    goalDifference: -10,
    points: 35,
    form: ["L", "D", "W", "L", "D"],
  },
  {
    teamId: 33,
    position: 13,
    played: 27,
    won: 8,
    drawn: 5,
    lost: 14,
    goalsFor: 30,
    goalsAgainst: 48,
    goalDifference: -18,
    points: 29,
    form: ["L", "L", "D", "W", "L"],
  },
];

/** ID로 팀 조회 */
export function getTeamById(id: number): Team | undefined {
  return mockTeams.find((team) => team.id === id);
}

/** ID로 순위 조회 */
export function getStandingByTeamId(teamId: number): TeamStanding | undefined {
  return mockStandings.find((s) => s.teamId === teamId);
}
