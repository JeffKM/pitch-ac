// DB row → 앱 타입 변환 매퍼 단위 테스트

import { describe, expect, it } from "vitest";

import type { StatContext } from "@/types";
import type { RadarData } from "@/types/radar";

import {
  type FixtureRow,
  fixtureRowToFixture,
  type InjuryRow,
  injuryRowToInjuredPlayer,
  type PlayerMatchStatsRow,
  playerMatchStatsRowToStats,
  type PlayerRow,
  playerRowToPlayer,
  type PlayerSeasonStatsRow,
  playerSeasonStatsRowToStats,
  type StandingRow,
  standingRowToStanding,
  type TeamRow,
  teamRowToTeam,
} from "../mappers";

// ─── fixtureRowToFixture ───────────────────────

describe("fixtureRowToFixture", () => {
  const baseRow: FixtureRow = {
    id: 100,
    gameweek: 10,
    date: "2026-03-20T20:00:00Z",
    home_team_id: 1,
    away_team_id: 2,
    status: "FT",
    home_score: 3,
    away_score: 1,
    minute: null,
    events: [
      {
        type: "goal",
        minute: 15,
        teamId: 1,
        playerId: 10,
        playerName: "Salah",
      },
    ],
    live_stats: null,
    lineups: null,
    league_id: 8,
    competition_name: null,
  };

  it("snake_case → camelCase 변환", () => {
    const result = fixtureRowToFixture(baseRow);
    expect(result.homeTeamId).toBe(1);
    expect(result.awayTeamId).toBe(2);
    expect(result.homeScore).toBe(3);
    expect(result.awayScore).toBe(1);
    expect(result.gameweek).toBe(10);
  });

  it("null team_id → 0 변환", () => {
    const row: FixtureRow = {
      ...baseRow,
      home_team_id: null,
      away_team_id: null,
    };
    const result = fixtureRowToFixture(row);
    expect(result.homeTeamId).toBe(0);
    expect(result.awayTeamId).toBe(0);
  });

  it("null events → 빈 배열 변환", () => {
    const row: FixtureRow = { ...baseRow, events: null };
    const result = fixtureRowToFixture(row);
    expect(result.events).toEqual([]);
  });
});

// ─── teamRowToTeam ─────────────────────────────

describe("teamRowToTeam", () => {
  it("기본 변환", () => {
    const row: TeamRow = {
      id: 1,
      name: "Manchester City",
      short_code: "MCI",
      logo_url: "https://example.com/mci.png",
      season: "2025/2026",
    };
    const result = teamRowToTeam(row);
    expect(result.shortName).toBe("MCI");
    expect(result.logoUrl).toBe("https://example.com/mci.png");
  });
});

// ─── standingRowToStanding ─────────────────────

describe("standingRowToStanding", () => {
  it("기본 변환", () => {
    const row: StandingRow = {
      team_id: 1,
      season: "2025/2026",
      position: 3,
      played: 30,
      won: 20,
      drawn: 5,
      lost: 5,
      goals_for: 60,
      goals_against: 25,
      goal_difference: 35,
      points: 65,
      form: ["W", "D", "L", "W", "W"],
    };
    const result = standingRowToStanding(row);
    expect(result.teamId).toBe(1);
    expect(result.goalDifference).toBe(35);
    expect(result.form).toEqual(["W", "D", "L", "W", "W"]);
  });

  it("null form → 빈 배열", () => {
    const row: StandingRow = {
      team_id: 1,
      season: "2025/2026",
      position: 1,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0,
      form: null,
    };
    const result = standingRowToStanding(row);
    expect(result.form).toEqual([]);
  });
});

// ─── playerRowToPlayer ─────────────────────────

describe("playerRowToPlayer", () => {
  it("position 타입 캐스팅", () => {
    const row: PlayerRow = {
      id: 10,
      team_id: 1,
      name: "Mohamed Salah",
      position: "FWD",
      jersey_number: 11,
      nationality: "Egypt",
      photo_url: "https://example.com/salah.png",
    };
    const result = playerRowToPlayer(row);
    expect(result.position).toBe("FWD");
    expect(result.number).toBe(11);
  });

  it("null team_id → 0", () => {
    const row: PlayerRow = {
      id: 10,
      team_id: null,
      name: "Free Agent",
      position: "MID",
      jersey_number: null,
      nationality: "Unknown",
      photo_url: "",
    };
    const result = playerRowToPlayer(row);
    expect(result.teamId).toBe(0);
    expect(result.number).toBe(0);
  });
});

// ─── playerSeasonStatsRowToStats ───────────────

describe("playerSeasonStatsRowToStats", () => {
  const mockRadar: RadarData = {
    player: [],
    positionAverage: [],
    strengths: [],
    weaknesses: [],
  };

  const goalsCtx: StatContext = { rank: 1, percentile: 95, prevSeason: 20 };
  const baseRow: PlayerSeasonStatsRow = {
    id: 1,
    player_id: 10,
    season: "2025/2026",
    goals: 15,
    assists: 10,
    xg: 12.5,
    xa: 8.3,
    key_passes: 40,
    dribbles: 30,
    average_rating: 7.5,
    context: { goals: goalsCtx },
    radar_data: mockRadar,
  };

  it("context JSONB 기본값 적용", () => {
    const result = playerSeasonStatsRowToStats(baseRow);
    expect(result.goalsContext).toEqual(goalsCtx);
    // context에 없는 키 → DEFAULT_STAT_CONTEXT
    expect(result.assistsContext).toEqual({
      rank: 0,
      percentile: 0,
      prevSeason: null,
    });
  });

  it("xg null → xgContext null", () => {
    const row: PlayerSeasonStatsRow = { ...baseRow, xg: null };
    const result = playerSeasonStatsRowToStats(row);
    expect(result.xg).toBeNull();
    expect(result.xgContext).toBeNull();
  });

  it("xa null → xaContext null", () => {
    const row: PlayerSeasonStatsRow = { ...baseRow, xa: null };
    const result = playerSeasonStatsRowToStats(row);
    expect(result.xa).toBeNull();
    expect(result.xaContext).toBeNull();
  });
});

// ─── injuryRowToInjuredPlayer ──────────────────

describe("injuryRowToInjuredPlayer", () => {
  it("기본 변환", () => {
    const row: InjuryRow = {
      player_id: 10,
      team_id: 1,
      player_name: "Kevin De Bruyne",
      reason: "Hamstring Injury",
      expected_return: "2026-04-01",
    };
    const result = injuryRowToInjuredPlayer(row);
    expect(result.playerId).toBe(10);
    expect(result.expectedReturn).toBe("2026-04-01");
  });
});

// ─── playerMatchStatsRowToStats ────────────────

describe("playerMatchStatsRowToStats", () => {
  it("기본 변환", () => {
    const row: PlayerMatchStatsRow = {
      id: 1,
      player_id: 10,
      fixture_id: 100,
      rating: 8.2,
      goals: 2,
      assists: 1,
      minutes_played: 90,
    };
    const result = playerMatchStatsRowToStats(row);
    expect(result.playerId).toBe(10);
    expect(result.minutesPlayed).toBe(90);
  });
});
