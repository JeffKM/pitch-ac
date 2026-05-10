// scoutlab-glossary-data.ts 단위 테스트
import { describe, expect, it } from "vitest";

import type { ScoutlabCategory } from "@/types";

import { SCOUTLAB_GLOSSARY } from "../scoutlab-glossary-data";

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

  it("각 카테고리에 1개 이상의 용어가 정의되어 있어야 한다", () => {
    for (const glossary of SCOUTLAB_GLOSSARY) {
      expect(glossary.terms.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("모든 용어에 key, label, description이 존재해야 한다", () => {
    for (const glossary of SCOUTLAB_GLOSSARY) {
      for (const term of glossary.terms) {
        expect(term.key).toBeTruthy();
        expect(term.label).toBeTruthy();
        expect(term.description).toBeTruthy();
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
