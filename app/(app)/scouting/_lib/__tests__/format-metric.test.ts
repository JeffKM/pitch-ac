// format-metric.ts 단위 테스트

import { describe, expect, it } from "vitest";

import { formatMetricName, formatMetricValue } from "../format-metric";

// ─── formatMetricName ──────────────────────────────

describe("formatMetricName", () => {
  it("snake_case → Title Case 변환", () => {
    expect(formatMetricName("goals_per_shot")).toBe("Goals Per Shot");
    expect(formatMetricName("key_passes")).toBe("Key Passes");
    expect(formatMetricName("aerial_duels_won")).toBe("Aerial Duels Won");
  });

  it("특수 용어 xG/xA 처리", () => {
    expect(formatMetricName("xg_per_shot")).toBe("xG Per Shot");
    expect(formatMetricName("xa")).toBe("xA");
    expect(formatMetricName("npxg")).toBe("npxG");
  });

  it("기타 특수 용어 처리", () => {
    expect(formatMetricName("vaep")).toBe("VAEP");
    expect(formatMetricName("padj_tackles")).toBe("PAdj. Tackles");
    expect(formatMetricName("sca_p90")).toBe("SCA P90");
    expect(formatMetricName("gca")).toBe("GCA");
    expect(formatMetricName("obv")).toBe("OBV");
    expect(formatMetricName("psxg")).toBe("PSxG");
    expect(formatMetricName("ppa")).toBe("PPA");
    expect(formatMetricName("shot_pct")).toBe("Shot %");
  });

  it("단일 단어 처리", () => {
    expect(formatMetricName("goals")).toBe("Goals");
    expect(formatMetricName("assists")).toBe("Assists");
  });

  it("이미 대문자인 단어를 소문자+타이틀케이스로 변환", () => {
    expect(formatMetricName("GOALS")).toBe("Goals");
  });
});

// ─── formatMetricValue ──────────────────────────────

describe("formatMetricValue", () => {
  it("정수는 그대로 표시", () => {
    expect(formatMetricValue(10)).toBe("10");
    expect(formatMetricValue(0)).toBe("0");
  });

  it("소수점 2자리까지 표시 (trailing zero 제거)", () => {
    expect(formatMetricValue(1.234)).toBe("1.23");
    expect(formatMetricValue(0.5)).toBe("0.5");
    expect(formatMetricValue(3.1)).toBe("3.1");
  });

  it("소수점이 정확히 2자리인 경우", () => {
    expect(formatMetricValue(2.55)).toBe("2.55");
  });
});
