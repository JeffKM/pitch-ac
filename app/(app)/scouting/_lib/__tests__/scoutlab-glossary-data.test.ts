// scoutlab-glossary-data.ts 단위 테스트
import { describe, expect, it } from "vitest";

import type { ScoutlabCategory } from "@/types";

import {
  SCOUTLAB_GLOSSARY,
  SCOUTLAB_GLOSSARY_MAP,
} from "../scoutlab-glossary-data";

// 모든 ScoutlabCategory
const ALL_CATEGORIES: ScoutlabCategory[] = [
  "final_product",
  "shooting",
  "creation",
  "passing",
  "ball_carrying",
  "defending",
  "set_pieces",
  "aerial",
  "possession",
  "vaep_overview",
  "misc",
];

describe("SCOUTLAB_GLOSSARY", () => {
  it("11개 카테고리 모두 정의되어 있어야 한다", () => {
    const glossaryCategories = SCOUTLAB_GLOSSARY.map((g) => g.category);
    for (const cat of ALL_CATEGORIES) {
      expect(glossaryCategories).toContain(cat);
    }
    expect(SCOUTLAB_GLOSSARY).toHaveLength(11);
  });

  it("데이터가 있는 카테고리에 1개 이상의 용어가 정의되어 있어야 한다", () => {
    const categoriesWithData = SCOUTLAB_GLOSSARY.filter(
      (g) => g.category !== "vaep_overview" && g.category !== "misc",
    );
    for (const glossary of categoriesWithData) {
      expect(glossary.terms.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("모든 용어에 key, label, brief, description이 존재해야 한다", () => {
    for (const glossary of SCOUTLAB_GLOSSARY) {
      for (const term of glossary.terms) {
        expect(term.key).toBeTruthy();
        expect(term.label).toBeTruthy();
        expect(term.brief).toBeTruthy();
        expect(term.description).toBeTruthy();
      }
    }
  });

  it("brief는 10자 이내여야 한다", () => {
    for (const glossary of SCOUTLAB_GLOSSARY) {
      for (const term of glossary.terms) {
        expect(term.brief.length).toBeLessThanOrEqual(10);
      }
    }
  });

  it("용어 key가 중복되지 않아야 한다", () => {
    const allKeys = SCOUTLAB_GLOSSARY.flatMap((g) => g.terms.map((t) => t.key));
    const uniqueKeys = new Set(allKeys);
    expect(uniqueKeys.size).toBe(allKeys.length);
  });

  it("각 카테고리에 label이 있어야 한다", () => {
    for (const glossary of SCOUTLAB_GLOSSARY) {
      expect(glossary.label).toBeTruthy();
      expect(typeof glossary.label).toBe("string");
    }
  });
});

describe("SCOUTLAB_GLOSSARY_MAP", () => {
  it("모든 메트릭 키로 조회할 수 있어야 한다", () => {
    const allKeys = SCOUTLAB_GLOSSARY.flatMap((g) => g.terms.map((t) => t.key));
    for (const key of allKeys) {
      expect(SCOUTLAB_GLOSSARY_MAP[key]).toBeDefined();
      expect(SCOUTLAB_GLOSSARY_MAP[key].key).toBe(key);
    }
  });

  it("NPXG 메트릭이 올바른 brief를 가져야 한다", () => {
    expect(SCOUTLAB_GLOSSARY_MAP["NPXG"]?.brief).toBe("비PK 기대 득점");
  });
});
