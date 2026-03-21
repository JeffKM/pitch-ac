// DB row → 앱 타입 매퍼 단위 테스트

import { describe, expect, it } from "vitest";

import {
  type FixtureRow,
  fixtureRowToFixture,
  type StandingRow,
  standingRowToStanding,
  type TeamRow,
  teamRowToTeam,
} from "@/lib/repositories/mappers";

// ─── fixtureRowToFixture ──────────────────────────────────────────────────────

describe("fixtureRowToFixture", () => {
  const baseRow: FixtureRow = {
    id: 1001,
    gameweek: 28,
    date: "2025-03-15T15:00:00Z",
    home_team_id: 42,
    away_team_id: 49,
    status: "FT",
    home_score: 2,
    away_score: 1,
    minute: null,
    events: [
      {
        type: "goal",
        minute: 23,
        teamId: 42,
        playerId: 112,
        playerName: "Bukayo Saka",
      },
    ],
    live_stats: null,
    lineups: null,
  };

  it("snake_case 컬럼을 camelCase 필드로 변환한다", () => {
    const fixture = fixtureRowToFixture(baseRow);

    expect(fixture.id).toBe(1001);
    expect(fixture.gameweek).toBe(28);
    expect(fixture.homeTeamId).toBe(42);
    expect(fixture.awayTeamId).toBe(49);
    expect(fixture.homeScore).toBe(2);
    expect(fixture.awayScore).toBe(1);
  });

  it("FT 경기의 status, minute, events를 올바르게 매핑한다", () => {
    const fixture = fixtureRowToFixture(baseRow);

    expect(fixture.status).toBe("FT");
    expect(fixture.minute).toBeNull();
    expect(fixture.events).toHaveLength(1);
    expect(fixture.events[0].playerName).toBe("Bukayo Saka");
  });

  it("NS 경기는 homeScore/awayScore가 null이다", () => {
    const row: FixtureRow = {
      ...baseRow,
      status: "NS",
      home_score: null,
      away_score: null,
    };
    const fixture = fixtureRowToFixture(row);

    expect(fixture.status).toBe("NS");
    expect(fixture.homeScore).toBeNull();
    expect(fixture.awayScore).toBeNull();
  });

  it("LIVE 경기는 minute 값을 가진다", () => {
    const row: FixtureRow = {
      ...baseRow,
      status: "LIVE",
      home_score: 1,
      away_score: 0,
      minute: 65,
    };
    const fixture = fixtureRowToFixture(row);

    expect(fixture.status).toBe("LIVE");
    expect(fixture.minute).toBe(65);
  });

  it("home_team_id/away_team_id가 null이면 0으로 fallback한다", () => {
    const row: FixtureRow = {
      ...baseRow,
      home_team_id: null,
      away_team_id: null,
    };
    const fixture = fixtureRowToFixture(row);

    expect(fixture.homeTeamId).toBe(0);
    expect(fixture.awayTeamId).toBe(0);
  });

  it("events가 null이면 빈 배열로 변환한다", () => {
    const row: FixtureRow = { ...baseRow, events: null };
    const fixture = fixtureRowToFixture(row);

    expect(fixture.events).toEqual([]);
  });

  it("liveStats가 있으면 그대로 유지된다", () => {
    const row: FixtureRow = {
      ...baseRow,
      live_stats: {
        home: {
          possession: 58,
          shots: 14,
          shotsOnTarget: 6,
          xg: null,
          corners: 7,
          fouls: 9,
        },
        away: {
          possession: 42,
          shots: 9,
          shotsOnTarget: 4,
          xg: null,
          corners: 3,
          fouls: 12,
        },
      },
    };
    const fixture = fixtureRowToFixture(row);

    expect(fixture.liveStats?.home.possession).toBe(58);
    expect(fixture.liveStats?.away.shots).toBe(9);
  });
});

// ─── teamRowToTeam ────────────────────────────────────────────────────────────

describe("teamRowToTeam", () => {
  const baseRow: TeamRow = {
    id: 42,
    name: "Arsenal",
    short_code: "ARS",
    logo_url: "https://example.com/arsenal.png",
    season: "2025/2026",
  };

  it("snake_case 컬럼을 camelCase 필드로 변환한다", () => {
    const team = teamRowToTeam(baseRow);

    expect(team.id).toBe(42);
    expect(team.name).toBe("Arsenal");
    expect(team.shortName).toBe("ARS");
    expect(team.logoUrl).toBe("https://example.com/arsenal.png");
    expect(team.season).toBe("2025/2026");
  });
});

// ─── standingRowToStanding ────────────────────────────────────────────────────

describe("standingRowToStanding", () => {
  const baseRow: StandingRow = {
    team_id: 40,
    season: "2025/2026",
    position: 1,
    played: 27,
    won: 20,
    drawn: 5,
    lost: 2,
    goals_for: 68,
    goals_against: 28,
    goal_difference: 40,
    points: 65,
    form: ["W", "W", "D", "W", "W"],
  };

  it("snake_case 컬럼을 camelCase 필드로 변환한다", () => {
    const standing = standingRowToStanding(baseRow);

    expect(standing.teamId).toBe(40);
    expect(standing.position).toBe(1);
    expect(standing.played).toBe(27);
    expect(standing.won).toBe(20);
    expect(standing.drawn).toBe(5);
    expect(standing.lost).toBe(2);
    expect(standing.goalsFor).toBe(68);
    expect(standing.goalsAgainst).toBe(28);
    expect(standing.goalDifference).toBe(40);
    expect(standing.points).toBe(65);
  });

  it("form 배열을 그대로 유지한다", () => {
    const standing = standingRowToStanding(baseRow);

    expect(standing.form).toEqual(["W", "W", "D", "W", "W"]);
  });

  it("form이 null이면 빈 배열로 변환한다", () => {
    const row: StandingRow = { ...baseRow, form: null };
    const standing = standingRowToStanding(row);

    expect(standing.form).toEqual([]);
  });
});
