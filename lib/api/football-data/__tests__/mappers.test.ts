// football-data.org 매퍼 단위 테스트 (calculateAge, 선수 매퍼)

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  calculateAge,
  mapFdSquadPlayerToPlayer,
  mapFdSquadPlayerToScoutlabRow,
} from "../mappers";
import type { FdSquadPlayer } from "../types";

// ─── calculateAge ───────────────────────────────

describe("calculateAge", () => {
  beforeEach(() => {
    // 2026-05-12로 고정
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-12"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("기본 나이 계산", () => {
    expect(calculateAge("2000-01-15")).toBe(26);
  });

  it("아직 생일 안 지난 경우 (age - 1)", () => {
    expect(calculateAge("2000-06-15")).toBe(25);
  });

  it("오늘이 생일인 경우", () => {
    expect(calculateAge("2000-05-12")).toBe(26);
  });

  it("생일이 어제였던 경우", () => {
    expect(calculateAge("2000-05-11")).toBe(26);
  });
});

// ─── mapFdSquadPlayerToPlayer ───────────────────

describe("mapFdSquadPlayerToPlayer", () => {
  const base: FdSquadPlayer = {
    id: 100,
    name: "Erling Haaland",
    position: "Offence",
    dateOfBirth: "2000-07-21",
    nationality: "Norway",
  };

  it("Offence → FWD", () => {
    const player = mapFdSquadPlayerToPlayer(base, 65);
    expect(player.position).toBe("FWD");
    expect(player.teamId).toBe(65);
    expect(player.name).toBe("Erling Haaland");
    expect(player.nationality).toBe("Norway");
  });

  it("Goalkeeper → GK", () => {
    const gk = { ...base, position: "Goalkeeper" };
    const player = mapFdSquadPlayerToPlayer(gk, 65);
    expect(player.position).toBe("GK");
  });

  it("Defence → DEF", () => {
    const def = { ...base, position: "Defence" };
    const player = mapFdSquadPlayerToPlayer(def, 65);
    expect(player.position).toBe("DEF");
  });

  it("Midfield → MID", () => {
    const mid = { ...base, position: "Midfield" };
    const player = mapFdSquadPlayerToPlayer(mid, 65);
    expect(player.position).toBe("MID");
  });

  it("position null → MID 기본값", () => {
    const unknown = { ...base, position: null };
    const player = mapFdSquadPlayerToPlayer(unknown, 65);
    expect(player.position).toBe("MID");
  });
});

// ─── mapFdSquadPlayerToScoutlabRow ──────────────

describe("mapFdSquadPlayerToScoutlabRow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-12"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const base: FdSquadPlayer = {
    id: 100,
    name: "Erling Haaland",
    position: "Offence",
    dateOfBirth: "2000-07-21",
    nationality: "Norway",
  };

  it("Offence → FW 매핑", () => {
    const row = mapFdSquadPlayerToScoutlabRow(
      base,
      "Manchester City FC",
      "Premier League",
      "25/26",
    );
    expect(row).not.toBeNull();
    expect(row!.position).toBe("FW");
    expect(row!.league).toBe("Premier League");
    expect(row!.season).toBe("25/26");
    expect(row!.pitch_ac_player_id).toBe(100);
  });

  it("GK → null (scoutlab 제외)", () => {
    const gk = { ...base, position: "Goalkeeper" };
    const row = mapFdSquadPlayerToScoutlabRow(
      gk,
      "Manchester City FC",
      "Premier League",
      "25/26",
    );
    expect(row).toBeNull();
  });

  it("나이 계산 포함", () => {
    const row = mapFdSquadPlayerToScoutlabRow(
      base,
      "Manchester City FC",
      "Premier League",
      "25/26",
    );
    expect(row!.age).toBe(25); // 2000-07-21 → 2026-05-12 = 25세
  });

  it("Defence → CB", () => {
    const def = { ...base, position: "Defence" };
    const row = mapFdSquadPlayerToScoutlabRow(
      def,
      "Manchester City FC",
      "Premier League",
      "25/26",
    );
    expect(row!.position).toBe("CB");
  });

  it("Midfield → MF", () => {
    const mid = { ...base, position: "Midfield" };
    const row = mapFdSquadPlayerToScoutlabRow(
      mid,
      "Manchester City FC",
      "Premier League",
      "25/26",
    );
    expect(row!.position).toBe("MF");
  });

  it("position null → MF 기본값 (football-data.org 무료 티어 대응)", () => {
    const unknown = { ...base, position: null };
    const row = mapFdSquadPlayerToScoutlabRow(
      unknown,
      "Manchester City FC",
      "Premier League",
      "25/26",
    );
    expect(row).not.toBeNull();
    expect(row!.position).toBe("MF");
  });

  it("position null + positionOverride OFFENCE → FW", () => {
    const unknown = { ...base, position: null };
    const row = mapFdSquadPlayerToScoutlabRow(
      unknown,
      "Manchester City FC",
      "Premier League",
      "25/26",
      "OFFENCE",
    );
    expect(row).not.toBeNull();
    expect(row!.position).toBe("FW");
  });

  it("position null + positionOverride Centre-Forward → FW", () => {
    const unknown = { ...base, position: null };
    const row = mapFdSquadPlayerToScoutlabRow(
      unknown,
      "Manchester City FC",
      "Premier League",
      "25/26",
      "Centre-Forward",
    );
    expect(row).not.toBeNull();
    expect(row!.position).toBe("FW");
  });

  it("position null + positionOverride Right Winger → W", () => {
    const unknown = { ...base, position: null };
    const row = mapFdSquadPlayerToScoutlabRow(
      unknown,
      "Manchester City FC",
      "Premier League",
      "25/26",
      "Right Winger",
    );
    expect(row).not.toBeNull();
    expect(row!.position).toBe("W");
  });

  it("position null + positionOverride Goalkeeper → null (GK 제외)", () => {
    const unknown = { ...base, position: null };
    const row = mapFdSquadPlayerToScoutlabRow(
      unknown,
      "Manchester City FC",
      "Premier League",
      "25/26",
      "Goalkeeper",
    );
    expect(row).toBeNull();
  });

  it("position null + positionOverride 없음 → MF 기본값", () => {
    const unknown = { ...base, position: null };
    const row = mapFdSquadPlayerToScoutlabRow(
      unknown,
      "Manchester City FC",
      "Premier League",
      "25/26",
      null,
    );
    expect(row).not.toBeNull();
    expect(row!.position).toBe("MF");
  });
});
