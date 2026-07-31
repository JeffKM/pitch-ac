// syncLeagueFixtures 통합 테스트 — 시즌 파생 + DB upsert 모킹

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { FdMatch, FdMatchesResponse } from "@/lib/api/football-data/types";

// ─── 모킹 설정 ─────────────────────────────────

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
        // POSTP 경기 ID 조회 (select → eq → eq)
        select: () => ({
          eq: function () {
            return this;
          },
          then: (resolve: (v: unknown) => void) =>
            resolve({ data: [], error: null }),
        }),
      };
    },
  }),
}));

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
    season: {
      id: 2403,
      startDate,
      endDate: "2027-05-30",
      currentMatchday: 1,
      winner: null,
    },
    area: { id: 2072, name: "England", code: "ENG", flag: null },
  };
}

let mockMatchesResponse: FdMatchesResponse = {
  count: 1,
  filters: {},
  competition: {
    id: 2021,
    name: "Premier League",
    code: "PL",
    type: "LEAGUE",
    emblem: "",
  },
  matches: [makeMatch("2026-08-21")],
};

vi.mock("@/lib/api/football-data", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/lib/api/football-data")>();
  return {
    ...original,
    getCompetitionMatches: vi.fn(async () => mockMatchesResponse),
  };
});

const { syncLeagueFixtures } = await import("../sync-fixtures");

// ─── 테스트 ─────────────────────────────────────

describe("syncLeagueFixtures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockReturnValue({ error: null });
    mockMatchesResponse = {
      count: 1,
      filters: {},
      competition: {
        id: 2021,
        name: "Premier League",
        code: "PL",
        type: "LEAGUE",
        emblem: "",
      },
      matches: [makeMatch("2026-08-21")],
    };
    for (const key of Object.keys(upsertCalls)) {
      delete upsertCalls[key];
    }
  });

  it("fixtures 행에 API에서 파생한 시즌을 기록", async () => {
    const result = await syncLeagueFixtures("PL", 2021);

    expect(result.status).toBe("success");
    const fixtureRows = upsertCalls["fixtures"]![0][0] as Array<{
      id: number;
      season: string;
    }>;
    expect(fixtureRows[0].season).toBe("2026/2027");
  });

  it("teams 행에도 동일한 파생 시즌을 기록", async () => {
    await syncLeagueFixtures("PL", 2021);

    const teamRows = upsertCalls["teams"]![0][0] as Array<{
      id: number;
      season: string;
    }>;
    expect(teamRows).toHaveLength(2);
    expect(teamRows.every((row) => row.season === "2026/2027")).toBe(true);
  });

  it("아직 전환 전인 대회는 이전 시즌 라벨로 기록", async () => {
    mockMatchesResponse = {
      ...mockMatchesResponse,
      matches: [makeMatch("2025-07-08")],
    };

    await syncLeagueFixtures("CL", 2001);

    const fixtureRows = upsertCalls["fixtures"]![0][0] as Array<{
      season: string;
    }>;
    expect(fixtureRows[0].season).toBe("2025/2026");
  });

  it("경기 응답이 비어 시즌을 알 수 없으면 error 결과 반환", async () => {
    mockMatchesResponse = { ...mockMatchesResponse, count: 0, matches: [] };

    const result = await syncLeagueFixtures("PL", 2021);

    expect(result.status).toBe("error");
    expect(result.errorMessage).toContain("시즌 정보");
    expect(upsertCalls["fixtures"]).toBeUndefined();
  });
});
