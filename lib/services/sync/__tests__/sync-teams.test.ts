// syncTeams / syncStandings 시즌 파생 테스트

import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  FdStandingsResponse,
  FdTeamsResponse,
} from "@/lib/api/football-data/types";

vi.mock("server-only", () => ({}));

const upsertCalls: Record<
  string,
  Array<[unknown[], Record<string, string>]>
> = {};
const mockInsert = vi.fn().mockReturnValue({ error: null });

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === "sync_logs") {
        return { insert: mockInsert };
      }
      return {
        upsert: (rows: unknown[], opts: Record<string, string>) => {
          if (!upsertCalls[table]) upsertCalls[table] = [];
          upsertCalls[table].push([rows, opts]);
          return { error: null };
        },
      };
    },
  }),
}));

const competition = {
  id: 2021,
  name: "Premier League",
  code: "PL",
  type: "LEAGUE",
  emblem: "",
};

function makeSeason(startDate: string) {
  return {
    id: 2403,
    startDate,
    endDate: "2027-05-30",
    currentMatchday: 1,
    winner: null,
  };
}

let mockTeamsResponse: FdTeamsResponse = {
  count: 1,
  competition,
  season: makeSeason("2026-08-21"),
  teams: [
    {
      id: 65,
      name: "Manchester City FC",
      shortName: "Man City",
      tla: "MCI",
      crest: "https://crests.football-data.org/65.svg",
      address: "",
      website: "",
      founded: 1880,
      clubColors: "Sky Blue / White",
      venue: "Etihad Stadium",
      coach: null,
      squad: [],
    },
  ],
};

let mockStandingsResponse: FdStandingsResponse = {
  competition,
  season: makeSeason("2026-08-21"),
  standings: [
    {
      stage: "REGULAR_SEASON",
      type: "TOTAL",
      group: null,
      table: [
        {
          position: 1,
          team: {
            id: 65,
            name: "Manchester City FC",
            shortName: "Man City",
            tla: "MCI",
            crest: "",
          },
          playedGames: 1,
          form: "W",
          won: 1,
          draw: 0,
          lost: 0,
          points: 3,
          goalsFor: 2,
          goalsAgainst: 0,
          goalDifference: 2,
        },
      ],
    },
  ],
};

vi.mock("@/lib/api/football-data", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/lib/api/football-data")>();
  return {
    ...original,
    getCompetitionTeams: vi.fn(async () => mockTeamsResponse),
    getCompetitionStandings: vi.fn(async () => mockStandingsResponse),
  };
});

const { syncStandings, syncTeams } = await import("../sync-teams");

describe("syncTeams / syncStandings 시즌 파생", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockReturnValue({ error: null });
    mockTeamsResponse = {
      ...mockTeamsResponse,
      season: makeSeason("2026-08-21"),
    };
    mockStandingsResponse = {
      ...mockStandingsResponse,
      season: makeSeason("2026-08-21"),
    };
    for (const key of Object.keys(upsertCalls)) {
      delete upsertCalls[key];
    }
  });

  it("teams 행에 응답 season에서 파생한 라벨 기록", async () => {
    const result = await syncTeams("PL");

    expect(result.status).toBe("success");
    const teamRows = upsertCalls["teams"]![0][0] as Array<{ season: string }>;
    expect(teamRows[0].season).toBe("2026/2027");
  });

  it("standings 행에 파생 라벨 기록 + 시즌 단위 onConflict 유지", async () => {
    const result = await syncStandings("PL", 2021);

    expect(result.status).toBe("success");
    const [rows, opts] = upsertCalls["standings"]![0];
    expect((rows as Array<{ season: string }>)[0].season).toBe("2026/2027");
    expect(opts.onConflict).toBe("team_id,season,league_id");
  });

  it("아직 전환 전인 대회는 이전 시즌 라벨 유지", async () => {
    mockStandingsResponse = {
      ...mockStandingsResponse,
      season: makeSeason("2025-07-08"),
    };

    await syncStandings("CL", 2001);

    const rows = upsertCalls["standings"]![0][0] as Array<{ season: string }>;
    expect(rows[0].season).toBe("2025/2026");
  });
});
