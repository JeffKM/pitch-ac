// SCOUTLAB_POSITION_MAP, toScoutlabSeason 단위 테스트

import { describe, expect, it } from "vitest";

import { SCOUTLAB_POSITION_MAP, toScoutlabSeason } from "../football";

// ─── SCOUTLAB_POSITION_MAP ──────────────────────

describe("SCOUTLAB_POSITION_MAP", () => {
  it("GK → null (scoutlab 제외)", () => {
    expect(SCOUTLAB_POSITION_MAP.Goalkeeper).toBeNull();
  });

  it("Defence/Defender → CB", () => {
    expect(SCOUTLAB_POSITION_MAP.Defence).toBe("CB");
    expect(SCOUTLAB_POSITION_MAP.Defender).toBe("CB");
  });

  it("Midfield/Midfielder → MF", () => {
    expect(SCOUTLAB_POSITION_MAP.Midfield).toBe("MF");
    expect(SCOUTLAB_POSITION_MAP.Midfielder).toBe("MF");
  });

  it("Offence/Attacker → FW", () => {
    expect(SCOUTLAB_POSITION_MAP.Offence).toBe("FW");
    expect(SCOUTLAB_POSITION_MAP.Attacker).toBe("FW");
  });

  it("세부 포지션 — Centre-Forward/Second Striker → FW", () => {
    expect(SCOUTLAB_POSITION_MAP["Centre-Forward"]).toBe("FW");
    expect(SCOUTLAB_POSITION_MAP["Second Striker"]).toBe("FW");
  });

  it("세부 포지션 — Winger → W", () => {
    expect(SCOUTLAB_POSITION_MAP["Right Winger"]).toBe("W");
    expect(SCOUTLAB_POSITION_MAP["Left Winger"]).toBe("W");
  });

  it("세부 포지션 — Attacking Midfield → AM", () => {
    expect(SCOUTLAB_POSITION_MAP["Attacking Midfield"]).toBe("AM");
  });

  it("세부 포지션 — Central/Defensive Midfield → MF", () => {
    expect(SCOUTLAB_POSITION_MAP["Central Midfield"]).toBe("MF");
    expect(SCOUTLAB_POSITION_MAP["Defensive Midfield"]).toBe("MF");
  });

  it("세부 포지션 — FB (풀백)", () => {
    expect(SCOUTLAB_POSITION_MAP["Left-Back"]).toBe("FB");
    expect(SCOUTLAB_POSITION_MAP["Right-Back"]).toBe("FB");
  });
});

// ─── toScoutlabSeason ───────────────────────────

describe("toScoutlabSeason", () => {
  it("2025/2026 → 25/26", () => {
    expect(toScoutlabSeason("2025/2026")).toBe("25/26");
  });

  it("2024/2025 → 24/25", () => {
    expect(toScoutlabSeason("2024/2025")).toBe("24/25");
  });

  it("2023/2024 → 23/24", () => {
    expect(toScoutlabSeason("2023/2024")).toBe("23/24");
  });
});
