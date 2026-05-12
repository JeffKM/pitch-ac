// syncPlayers 통합 테스트 — API 호출 + DB upsert 모킹

import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── 모킹 설정 ─────────────────────────────────

// "server-only" 모킹 (서버 전용 모듈 import 방지)
vi.mock("server-only", () => ({}));

// 테이블별 upsert 호출 기록
const upsertCalls: Record<
  string,
  Array<[unknown[], Record<string, string>]>
> = {};
const mockInsert = vi.fn().mockReturnValue({ error: null });

// 특정 테이블에 에러를 주입할 수 있는 맵
let upsertErrorOverride: Record<string, unknown> = {};

// 기존 scoutlab 선수 데이터 (SELECT 결과)
let mockExistingScoutlab: Array<{
  id: number;
  name: string;
  pitch_ac_player_id: number | null;
}> = [];

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === "sync_logs") {
        return { insert: mockInsert };
      }

      return {
        // upsert 체인
        upsert: (rows: unknown[], opts: Record<string, string>) => {
          if (!upsertCalls[table]) upsertCalls[table] = [];
          upsertCalls[table].push([rows as unknown[], opts]);
          if (upsertErrorOverride[table]) {
            return { error: upsertErrorOverride[table] };
          }
          return { error: null };
        },
        // select 체인 (scoutlab_players 기존 선수 조회)
        select: () => ({
          eq: function () {
            return this;
          },
          then: (resolve: (v: unknown) => void) =>
            resolve({ data: mockExistingScoutlab, error: null }),
        }),
      };
    },
  }),
}));

const mockTeamsResponse = {
  count: 1,
  competition: { id: 2021, name: "PL", code: "PL", type: "LEAGUE", emblem: "" },
  season: {
    id: 1,
    startDate: "2025-08-01",
    endDate: "2026-05-31",
    currentMatchday: 35,
    winner: null,
  },
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
      squad: [
        {
          id: 1001,
          name: "Ederson",
          position: "Goalkeeper",
          dateOfBirth: "1993-08-17",
          nationality: "Brazil",
        },
        {
          id: 1002,
          name: "Erling Haaland",
          position: "Offence",
          dateOfBirth: "2000-07-21",
          nationality: "Norway",
        },
        {
          id: 1003,
          name: "Kevin De Bruyne",
          position: "Midfield",
          dateOfBirth: "1991-06-28",
          nationality: "Belgium",
        },
        {
          id: 1004,
          name: "Ruben Dias",
          position: "Defence",
          dateOfBirth: "1997-05-14",
          nationality: "Portugal",
        },
      ],
    },
  ],
};

const mockScorersResponse = {
  count: 1,
  competition: { id: 2021, name: "PL", code: "PL", type: "LEAGUE", emblem: "" },
  season: {
    id: 1,
    startDate: "2025-08-01",
    endDate: "2026-05-31",
    currentMatchday: 35,
    winner: null,
  },
  scorers: [
    {
      player: {
        id: 1002,
        name: "Erling Haaland",
        firstName: "Erling",
        lastName: "Haaland",
        dateOfBirth: "2000-07-21",
        nationality: "Norway",
        section: "OFFENCE",
        position: "Centre-Forward",
        shirtNumber: 9,
        lastUpdated: "2026-05-12T00:00:00Z",
      },
      team: {
        id: 65,
        name: "Manchester City FC",
        shortName: "Man City",
        tla: "MCI",
        crest: "",
      },
      playedMatches: 30,
      goals: 25,
      assists: 5,
      penalties: 3,
    },
  ],
};

vi.mock("@/lib/api/football-data", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/lib/api/football-data")>();
  return {
    ...original,
    getCompetitionTeams: vi.fn().mockResolvedValue(mockTeamsResponse),
    getCompetitionScorers: vi.fn().mockResolvedValue(mockScorersResponse),
  };
});

// ─── 테스트 ─────────────────────────────────────

// syncPlayers를 모킹 설정 후 import
const { syncPlayers } = await import("../sync-players");

describe("syncPlayers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockReturnValue({ error: null });
    mockExistingScoutlab = [];
    upsertErrorOverride = {};
    // upsertCalls 초기화
    for (const key of Object.keys(upsertCalls)) {
      delete upsertCalls[key];
    }
  });

  it("성공: teams + players + scoutlab_players 모두 upsert", async () => {
    const result = await syncPlayers();

    expect(result.status).toBe("success");
    expect(result.entity).toBe("players");
    expect(result.recordsSynced).toBe(4);

    expect(upsertCalls["teams"]).toBeDefined();
    expect(upsertCalls["players"]).toBeDefined();
    expect(upsertCalls["scoutlab_players"]).toBeDefined();
  });

  it("GK는 players에는 포함, scoutlab_players에는 미포함", async () => {
    await syncPlayers();

    // players에 4명 (GK 포함)
    const playerRows = upsertCalls["players"]![0][0];
    expect(playerRows).toHaveLength(4);

    // scoutlab에 3명 (GK 제외)
    const scoutlabRows = upsertCalls["scoutlab_players"]![0][0];
    expect(scoutlabRows).toHaveLength(3);
  });

  it("scorers 보강: Haaland에 등번호 9, minutes_played = 30 × 90", async () => {
    await syncPlayers();

    // players upsert에서 Haaland 행 확인
    const playerRows = upsertCalls["players"]![0][0] as Array<{
      id: number;
      jersey_number: number;
    }>;
    const haalandRow = playerRows.find((r) => r.id === 1002);
    expect(haalandRow!.jersey_number).toBe(9);

    // scoutlab upsert에서 Haaland 행 확인
    const scoutlabRows = upsertCalls["scoutlab_players"]![0][0] as Array<{
      pitch_ac_player_id: number;
      minutes_played: number;
    }>;
    const haalandScoutlab = scoutlabRows.find(
      (r) => r.pitch_ac_player_id === 1002,
    );
    expect(haalandScoutlab!.minutes_played).toBe(2700); // 30 × 90
  });

  it("중복 방지: 기존 scoutlab 선수가 있으면 신규 삽입 대신 pitch_ac_player_id만 업데이트", async () => {
    // 스크래퍼가 이미 삽입한 선수 (팀명이 다름)
    mockExistingScoutlab = [
      { id: 9001, name: "Erling Haaland", pitch_ac_player_id: null },
      { id: 9002, name: "Kevin De Bruyne", pitch_ac_player_id: null },
      { id: 9003, name: "Ruben Dias", pitch_ac_player_id: null },
    ];

    await syncPlayers();

    // scoutlab_players upsert 호출 분석
    const scoutlabCalls = upsertCalls["scoutlab_players"]!;

    // pitch_ac_player_id 업데이트 호출 (id 기준 upsert)
    const idUpdateCall = scoutlabCalls.find((call) =>
      (call[0] as Array<{ id?: number }>).some((row) => row.id === 9001),
    );
    expect(idUpdateCall).toBeDefined();

    // 신규 삽입 호출이 없어야 함 (3명 모두 기존 존재)
    const newInsertCall = scoutlabCalls.find(
      (call) => call[1]?.onConflict === "name,team,season",
    );
    expect(newInsertCall).toBeUndefined();
  });

  it("중복 방지: 기존 선수에 이미 pitch_ac_player_id가 있으면 업데이트 건너뜀", async () => {
    mockExistingScoutlab = [
      { id: 9001, name: "Erling Haaland", pitch_ac_player_id: 38101 },
    ];

    await syncPlayers();

    // scoutlab_players upsert에서 id=9001 업데이트가 없어야 함
    const scoutlabCalls = upsertCalls["scoutlab_players"] ?? [];
    const hasIdUpdate = scoutlabCalls.some((call) =>
      (call[0] as Array<{ id?: number }>).some((row) => row.id === 9001),
    );
    expect(hasIdUpdate).toBe(false);
  });

  it("API 에러 시 error SyncResult 반환", async () => {
    const { getCompetitionTeams } = await import("@/lib/api/football-data");
    vi.mocked(getCompetitionTeams).mockRejectedValueOnce(
      new Error("API rate limit"),
    );

    const result = await syncPlayers();

    expect(result.status).toBe("error");
    expect(result.recordsSynced).toBe(0);
    expect(result.errorMessage).toContain("API rate limit");
  });

  it("DB upsert 에러 시 error SyncResult 반환", async () => {
    upsertErrorOverride["teams"] = {
      message: "FK violation",
      code: "23503",
      details: "",
    };

    const result = await syncPlayers();

    expect(result.status).toBe("error");
    expect(result.errorMessage).toContain("FK violation");
  });
});
