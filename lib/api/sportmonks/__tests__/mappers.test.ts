// SportMonks API 매퍼 단위 테스트

import { describe, expect, it } from "vitest";

import {
  extractStatValue,
  mapSmFixtureToFixture,
  mapSmTeamToTeam,
} from "../mappers";
import type { SmFixture, SmStatDetail, SmTeam } from "../types";

// 테스트용 헬퍼: 필수 필드만 채워서 SmStatDetail 생성
function detail(typeId: number, value: SmStatDetail["value"]): SmStatDetail {
  return {
    id: 0,
    player_statistic_id: 0,
    type_id: typeId,
    value,
  } as SmStatDetail;
}

// ─── extractStatValue ──────────────────────────

describe("extractStatValue", () => {
  it("number 값 추출", () => {
    expect(extractStatValue([detail(52, 15)], 52)).toBe(15);
  });

  it("{ total: number } 구조 추출", () => {
    expect(extractStatValue([detail(52, { total: 10, goals: 10 })], 52)).toBe(
      10,
    );
  });

  it("{ average: number } 구조 추출", () => {
    expect(
      extractStatValue(
        [detail(118, { average: 7.5, highest: 9.0, lowest: 5.0 })],
        118,
      ),
    ).toBe(7.5);
  });

  it("미존재 type_id → null", () => {
    expect(extractStatValue([detail(52, 15)], 999)).toBeNull();
  });

  it("undefined details → null", () => {
    expect(extractStatValue(undefined, 52)).toBeNull();
  });
});

// ─── mapSmTeamToTeam ───────────────────────────

describe("mapSmTeamToTeam", () => {
  it("기본 변환", () => {
    const raw = {
      id: 1,
      name: "Manchester City",
      short_code: "MCI",
      image_path: "https://cdn.sportmonks.com/images/mci.png",
    } as SmTeam;
    const result = mapSmTeamToTeam(raw, "2025/2026");
    expect(result.id).toBe(1);
    expect(result.shortName).toBe("MCI");
    expect(result.season).toBe("2025/2026");
  });

  it("short_code 없으면 name 앞 3글자", () => {
    const raw = {
      id: 2,
      name: "Liverpool",
      short_code: undefined,
      image_path: "https://cdn.sportmonks.com/images/liv.png",
    } as unknown as SmTeam;
    const result = mapSmTeamToTeam(raw, "2025/2026");
    expect(result.shortName).toBe("LIV");
  });
});

// ─── mapSmFixtureToFixture ─────────────────────

describe("mapSmFixtureToFixture", () => {
  const baseFixture = {
    id: 100,
    sport_id: 1,
    league_id: 8,
    season_id: 25583,
    stage_id: 1,
    round_id: 10,
    starting_at: "2026-03-20T20:00:00Z",
    result_info: null,
    leg: "1",
    length: 90,
    has_odds: false,
    starting_at_timestamp: 0,
    state: {
      id: 1,
      state: "FT",
      name: "Full-Time",
      short_name: "FT",
      developer_name: "ft",
    },
    participants: [
      {
        id: 1,
        name: "Home FC",
        short_code: "HFC",
        image_path: "",
        meta: { location: "home", winner: true, position: 1 },
      },
      {
        id: 2,
        name: "Away FC",
        short_code: "AFC",
        image_path: "",
        meta: { location: "away", winner: false, position: 2 },
      },
    ],
    scores: [
      {
        type_id: 1525,
        description: "current",
        score: { goals: 2, participant: "home" },
      },
      {
        type_id: 1525,
        description: "current",
        score: { goals: 1, participant: "away" },
      },
    ],
    round: { id: 10, name: "10" },
  } as unknown as SmFixture;

  it("상태 매핑: ft → FT", () => {
    const result = mapSmFixtureToFixture(baseFixture);
    expect(result.status).toBe("FT");
  });

  it("스코어 추출", () => {
    const result = mapSmFixtureToFixture(baseFixture);
    expect(result.homeScore).toBe(2);
    expect(result.awayScore).toBe(1);
  });

  it("팀 ID 추출", () => {
    const result = mapSmFixtureToFixture(baseFixture);
    expect(result.homeTeamId).toBe(1);
    expect(result.awayTeamId).toBe(2);
  });

  it("LIVE 상태에서 이벤트 변환", () => {
    const liveFixture = {
      ...baseFixture,
      state: {
        id: 2,
        state: "LIVE",
        name: "In-Play",
        short_name: "LIVE",
        developer_name: "inplay",
      },
      events: [
        {
          id: 1,
          type_id: 14,
          sub_type_id: null,
          section: "event",
          player_id: 10,
          player_name: "Salah",
          related_player_id: null,
          related_player_name: null,
          result: "1-0",
          info: null,
          addition: null,
          minute: 25,
          extra_minute: null,
          participant_id: 1,
          fixture_id: 100,
          period_id: 1,
          injured: false,
          on_bench: false,
          coach_id: null,
          sub_player_id: null,
          sub_player_name: null,
        },
      ],
    } as unknown as SmFixture;
    const result = mapSmFixtureToFixture(liveFixture);
    expect(result.status).toBe("LIVE");
    expect(result.events).toHaveLength(1);
    expect(result.events[0].type).toBe("goal");
    expect(result.events[0].minute).toBe(25);
    expect(result.minute).toBe(25);
  });

  it("참가팀 없으면 teamId 0", () => {
    const noParticipants = {
      ...baseFixture,
      participants: undefined,
    } as unknown as SmFixture;
    const result = mapSmFixtureToFixture(noParticipants);
    expect(result.homeTeamId).toBe(0);
    expect(result.awayTeamId).toBe(0);
  });
});
