import { describe, expect, it } from "vitest";

import { matchesSearchQuery, normalizeForSearch } from "../search-utils";

describe("normalizeForSearch", () => {
  it("NFD로 분해되는 결합 악센트 문자를 제거한다 (Dembélé)", () => {
    expect(normalizeForSearch("Dembélé")).toBe("dembele");
  });

  it("분해되지 않는 특수 문자를 매핑한다 (Sørloth)", () => {
    expect(normalizeForSearch("Sørloth")).toBe("sorloth");
  });

  it("여러 악센트가 섞인 폴란드어 이름을 정규화한다 (Szczęsny)", () => {
    expect(normalizeForSearch("Szczęsny")).toBe("szczesny");
  });

  it("ogonek이 붙은 문자를 정규화한다 (Piątek)", () => {
    expect(normalizeForSearch("Piątek")).toBe("piatek");
  });

  it("대소문자를 무시하고 비교 가능하도록 소문자로 변환한다", () => {
    expect(normalizeForSearch("OUSMANE")).toBe(normalizeForSearch("ousmane"));
  });

  it("터키어 점 없는 ı를 i로 접는다 (Yazıcı)", () => {
    expect(normalizeForSearch("Yusuf Yazıcı")).toBe("yusuf yazici");
  });

  it("곡선 아포스트로피를 직선 아포스트로피로 통일한다 (N’Dri)", () => {
    expect(normalizeForSearch("Konan N’Dri")).toBe(
      normalizeForSearch("Konan N'Dri"),
    );
  });
});

describe("matchesSearchQuery", () => {
  it("악센트 없는 검색어로 악센트가 포함된 이름을 찾는다", () => {
    expect(matchesSearchQuery("Ousmane Dembélé", "Dembele")).toBe(true);
  });

  it("악센트가 포함된 검색어로도 동일하게 찾는다", () => {
    expect(matchesSearchQuery("Ousmane Dembélé", "Dembélé")).toBe(true);
  });

  it("ø가 포함된 이름을 o로 검색해도 찾는다 (Sørloth)", () => {
    expect(matchesSearchQuery("Alexander Sørloth", "Sorloth")).toBe(true);
  });

  it("ę가 포함된 이름을 e로 검색해도 찾는다 (Szczęsny)", () => {
    expect(matchesSearchQuery("Wojciech Szczęsny", "Szczesny")).toBe(true);
  });

  it("ą가 포함된 이름을 a로 검색해도 찾는다 (Piątek)", () => {
    expect(matchesSearchQuery("Krzysztof Piątek", "Piatek")).toBe(true);
  });

  it("대소문자가 섞여도 일치한다", () => {
    expect(matchesSearchQuery("Ousmane Dembélé", "dEmBeLe")).toBe(true);
  });

  it("일치하지 않는 검색어는 false를 반환한다", () => {
    expect(matchesSearchQuery("Ousmane Dembélé", "Messi")).toBe(false);
  });

  it("빈 검색어는 항상 true를 반환한다", () => {
    expect(matchesSearchQuery("Ousmane Dembélé", "")).toBe(true);
  });

  it("DB의 곡선 아포스트로피 이름을 직선 아포스트로피로 검색해도 찾는다", () => {
    expect(matchesSearchQuery("Konan N’Dri", "N'Dri")).toBe(true);
  });

  it("ı가 포함된 이름을 i로 검색해도 찾는다 (Yazıcı)", () => {
    expect(matchesSearchQuery("Yusuf Yazıcı", "Yazici")).toBe(true);
  });
});
