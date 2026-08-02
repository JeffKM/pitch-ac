// ScoutLab DOM → 데이터 파싱 (선수 정보 + 메트릭 + 유사 선수)

import type { FrameLocator, Locator, Page } from "@playwright/test";

import { normalizeForSearch } from "@/lib/search-utils";

import { logInfo, logWarn } from "./logger";
import type {
  ParsedActionMap,
  ParsedMetric,
  ParsedPlayerInfo,
  ParsedSimilarPlayer,
} from "./types";

/**
 * 카드 검증 실패 계열의 공통 부모.
 * 이 계열 에러가 던져지면 해당 선수는 어떤 테이블에도 저장하지 않고 실패로 집계한다
 * (요청과 다른 카드를 읽은 상태이므로 저장하면 데이터가 오염된다).
 * 호출부에서 절대 삼키지 말 것 — `instanceof CardValidationError`로 재throw한다.
 */
export class CardValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CardValidationError";
  }
}

/** 카드 헤더 시즌이 요청 시즌과 끝내 일치하지 않음 */
export class SeasonMismatchError extends CardValidationError {
  constructor(message: string) {
    super(message);
    this.name = "SeasonMismatchError";
  }
}

/** 카드에 표시된 선수가 요청 선수와 끝내 일치하지 않음 (이전 선수 카드 잔존 등) */
export class PlayerMismatchError extends CardValidationError {
  constructor(message: string) {
    super(message);
    this.name = "PlayerMismatchError";
  }
}

/** 메트릭이 0개 — 빈 행을 "수집 완료"로 저장하지 않기 위한 실패 신호 */
export class EmptyMetricsError extends CardValidationError {
  constructor(message: string) {
    super(message);
    this.name = "EmptyMetricsError";
  }
}

// ─── 카드 검증 (시즌 + 선수명) ───
//
// 카드는 Streamlit 재렌더 중 "combobox는 새 선수 / 카드 본문은 이전 선수" 상태를 거친다.
// 단발 판정은 이 순간에 걸려 오탐을 내므로(실측 4% 실패), 아래 3가지로 방어한다.
//   1) `.first()` 단일 요소가 아니라 매치 전체를 모아 "요청 시즌이 존재하는가"로 판정
//   2) 폴링 재시도 — 몇 초 뒤 다시 읽으면 정상값이 나오므로 단발 실패로 선수를 버리지 않음
//   3) 로케이터를 카드에 앵커링 — 페이지 다른 곳의 "20XX/YY" 텍스트를 집지 않게 함(근본 방어)

/** 카드 검증 폴링 기본 횟수/간격 */
const CARD_POLL_ATTEMPTS = 6;
const CARD_POLL_INTERVAL_MS = 500;

/** "NATION:" 기준으로 위로 탐색할 조상 최대 깊이 (카드 컨테이너 탐색용) */
const CARD_SCOPE_MAX_DEPTH = 8;

/** 카드 헤더 시즌 텍스트 로케이터 ("2025/26" 형태) */
const SEASON_SELECTOR = "text=/20\\d\\d\\/\\d\\d/";

/** 폴링 간 대기 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 텍스트에서 "2024/25" 형태를 모두 찾아 "24/25" 목록으로 변환 */
function extractSeasonsFromText(text: string): string[] {
  return [...text.matchAll(/20(\d\d)\/(\d\d)/g)].map((m) => `${m[1]}/${m[2]}`);
}

/**
 * 스코프 안의 "보이는" 시즌 텍스트를 전부 수집한다 (중복 제거).
 * count() 기반 판정은 숨겨진/stale 요소까지 세므로 isVisible()로 거른다.
 */
async function collectVisibleSeasons(
  scope: FrameLocator | Locator,
): Promise<string[]> {
  const found = new Set<string>();
  let elements: Locator[];
  try {
    elements = await scope.locator(SEASON_SELECTOR).all();
  } catch {
    return [];
  }

  for (const el of elements) {
    try {
      if (!(await el.isVisible())) continue;
      const text = await el.textContent({ timeout: 1000 });
      if (!text) continue;
      for (const season of extractSeasonsFromText(text)) found.add(season);
    } catch {
      // 재렌더로 요소가 사라짐 — 다음 요소로 진행
    }
  }
  return [...found];
}

/**
 * 카드 스코프 해석 — "NATION:" 요소의 조상 중 시즌 텍스트를 포함하는 "가장 작은" 컨테이너.
 * 이 스코프 안에서만 시즌을 찾으면 페이지 다른 곳의 텍스트에 걸리지 않는다.
 * 찾지 못하면 null (호출부에서 페이지 전체 폴백).
 */
async function resolveCardScope(iframe: FrameLocator): Promise<Locator | null> {
  const nation = iframe.locator('text="NATION:"').first();
  try {
    if ((await nation.count()) === 0) return null;
  } catch {
    return null;
  }

  for (let depth = 1; depth <= CARD_SCOPE_MAX_DEPTH; depth++) {
    const container = nation.locator(`xpath=ancestor::*[${depth}]`);
    try {
      if ((await container.locator(SEASON_SELECTOR).count()) > 0) {
        return container;
      }
    } catch {
      // 조상이 없거나 재렌더 중 — 다음 깊이로
    }
  }
  return null;
}

/** 카드에 표시된 시즌 목록 수집 (카드 앵커 우선, 실패 시 페이지 전체 폴백) */
export async function collectCardSeasons(
  iframe: FrameLocator,
): Promise<{ seasons: string[]; scope: "card" | "page" }> {
  const cardScope = await resolveCardScope(iframe);
  if (cardScope) {
    const seasons = await collectVisibleSeasons(cardScope);
    if (seasons.length > 0) return { seasons, scope: "card" };
  }
  return { seasons: await collectVisibleSeasons(iframe), scope: "page" };
}

/** 악센트·대소문자·구두점 차이를 무시한 선수명 정규화 */
function normalizePlayerName(name: string): string {
  return normalizeForSearch(name)
    .replace(/[.'\-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 요청 선수명과 카드 선수명이 같은 선수를 가리키는지 판정.
 * 글로벌 검색(--player)에서는 사용자가 일부만 입력할 수 있으므로 포함 관계도 허용한다.
 */
function namesMatch(cardName: string, requestedName: string): boolean {
  const a = normalizePlayerName(cardName);
  const b = normalizePlayerName(requestedName);
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

export interface CardWaitOptions {
  /** 폴링 시도 횟수 (기본 6) */
  attempts?: number;
  /** 시도 간 대기 ms (기본 500) */
  intervalMs?: number;
}

/**
 * 카드가 "요청 시즌 + 요청 선수"로 안정화될 때까지 폴링 검증한다.
 * @param expectedPlayerName 생략 시 선수명 대조를 건너뛴다 (시즌 선택 직후 등 선수 맥락이 없는 경우)
 * @returns 검증을 통과한 카드의 선수명
 */
async function waitForStableCard(
  iframe: FrameLocator,
  expectedSeason: string,
  expectedPlayerName?: string,
  options: CardWaitOptions = {},
): Promise<string> {
  const attempts = options.attempts ?? CARD_POLL_ATTEMPTS;
  const intervalMs = options.intervalMs ?? CARD_POLL_INTERVAL_MS;

  let lastSeasons: string[] = [];
  let lastScope: "card" | "page" = "page";
  let lastName = "";

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const { seasons, scope } = await collectCardSeasons(iframe);
    lastSeasons = seasons;
    lastScope = scope;
    const seasonOk = seasons.includes(expectedSeason);

    let name = "";
    try {
      name = await extractPlayerName(iframe);
    } catch {
      name = "";
    }
    lastName = name;
    const nameOk =
      expectedPlayerName === undefined
        ? true
        : name !== "" && namesMatch(name, expectedPlayerName);

    if (seasonOk && nameOk) {
      if (attempt > 1) {
        logInfo(
          `  → 카드 검증 통과 (${attempt}/${attempts}회차 재시도, scope=${scope}, 시즌=${expectedSeason}${
            expectedPlayerName === undefined ? "" : `, 선수=${name}`
          })`,
        );
      }
      return name;
    }

    const reason = !seasonOk
      ? `시즌 불일치 (요청=${expectedSeason}, 카드=[${seasons.join(", ") || "없음"}], scope=${scope})`
      : `선수명 불일치 (요청=${expectedPlayerName}, 카드=${name || "없음"})`;
    logWarn(`  ⟳ 카드 검증 재시도 ${attempt}/${attempts} — ${reason}`);

    if (attempt < attempts) await sleep(intervalMs);
  }

  if (!lastSeasons.includes(expectedSeason)) {
    throw new SeasonMismatchError(
      `시즌 검증 실패 (${attempts}회 재시도) — 요청=${expectedSeason}, 카드=[${lastSeasons.join(", ") || "없음"}], scope=${lastScope}`,
    );
  }
  throw new PlayerMismatchError(
    `선수명 검증 실패 (${attempts}회 재시도) — 요청=${expectedPlayerName}, 카드=${lastName || "없음"}`,
  );
}

/**
 * 카드 헤더 시즌이 요청 시즌과 일치하는지 검증 (폴링 재시도 포함).
 * 선수 맥락이 없는 호출(시즌 선택 직후)에서 사용한다.
 * @returns 검증된 시즌 문자열(= expectedSeason)
 */
export async function assertCardSeason(
  iframe: FrameLocator,
  expectedSeason: string,
  options: CardWaitOptions = {},
): Promise<string> {
  await waitForStableCard(iframe, expectedSeason, undefined, options);
  return expectedSeason;
}

/**
 * 선수 기본 정보 파싱
 * @param expectedSeason CLI `--season` 값 ("25/26" 형식)
 * @param expectedPlayerName 요청 선수명. 카드가 이전 선수 상태이면 재시도 후 실패 처리한다.
 * @throws SeasonMismatchError | PlayerMismatchError (폴백 없음 — 저장 금지 신호)
 */
export async function parsePlayerInfo(
  iframe: FrameLocator,
  expectedSeason: string,
  expectedPlayerName: string,
): Promise<ParsedPlayerInfo> {
  // Player Card 렌더링 대기
  await iframe
    .locator('text="NATION:"')
    .first()
    .waitFor({ state: "visible", timeout: 15_000 });

  // 시즌·선수명 검증을 다른 필드 파싱보다 먼저 수행 — 잘못된/이전 카드면 즉시 중단
  const name = await waitForStableCard(
    iframe,
    expectedSeason,
    expectedPlayerName,
  );
  const season = expectedSeason;
  logInfo(`  → 카드 검증 통과: 시즌=${season}, 선수명 대조=${name}`);

  const position = await extractCurrentPosition(iframe);
  const nationality = await extractField(iframe, "NATION:");
  const club = await extractField(iframe, "CLUB:");
  const ageText = await extractField(iframe, "AGE:");
  const heightText = await extractField(iframe, "HEIGHT:");
  const minutesText = await extractField(iframe, "MINUTES:");

  const age = parseInt(ageText.replace(/[^\d]/g, ""), 10);
  const height = heightText
    ? parseInt(heightText.replace(/[^\d]/g, ""), 10)
    : null;
  const minutes = parseInt(minutesText.replace(/[.,\s]/g, ""), 10);

  return { name, position, season, nationality, club, age, height, minutes };
}

/** 선수명 추출 — Player combobox aria-label에서 */
async function extractPlayerName(iframe: FrameLocator): Promise<string> {
  const combobox = iframe
    .locator('input[role="combobox"][aria-label*="Player"]')
    .first();
  const ariaLabel = await combobox.getAttribute("aria-label");
  if (ariaLabel) {
    // "Selected Mohamed Salah. Player" → "Mohamed Salah"
    const match = ariaLabel.match(/Selected\s+(.+)\.\s+Player/);
    if (match) return match[1].trim();
  }
  throw new Error("선수명을 찾을 수 없습니다");
}

/** 현재 선택된 포지션 추출 — Streamlit segmented control Active 버튼 */
async function extractCurrentPosition(iframe: FrameLocator): Promise<string> {
  // Streamlit segmented control: 활성 버튼에 data-testid="stBaseButton-segmented_controlActive"
  const activeBtn = iframe.locator(
    '[data-testid="stBaseButton-segmented_controlActive"]',
  );
  const count = await activeBtn.count();

  // 포지션 radiogroup(두 번째)의 활성 버튼 찾기
  // radiogroup 순서: 시즌 → 포지션 → P90/Total → Padj/Raw
  const posValues = ["CB", "FB", "MF", "AM/W", "FW"];
  for (let i = 0; i < count; i++) {
    const text = await activeBtn.nth(i).textContent();
    const trimmed = text?.trim() ?? "";
    if (posValues.includes(trimmed)) return trimmed;
  }

  return "AM/W"; // 최종 fallback
}

/** 필드 값 추출 ("NATION:", "CLUB:" 등) */
async function extractField(
  iframe: FrameLocator,
  label: string,
): Promise<string> {
  // label 요소의 다음 형제에 값이 있음 (XPath following-sibling)
  const labelEl = iframe.locator(`text="${label}"`).first();
  const valueEl = labelEl.locator("xpath=following-sibling::*[1]");
  try {
    const text = await valueEl.textContent({ timeout: 5000 });
    return text?.trim() ?? "";
  } catch {
    // fallback: 부모의 전체 텍스트에서 label 이후 부분 추출
    const parent = labelEl.locator("..");
    const fullText = await parent.textContent({ timeout: 5000 });
    if (fullText) {
      const after = fullText.split(label)[1];
      return after?.trim() ?? "";
    }
    return "";
  }
}

/** UI 카테고리명 → DB 컬럼명 매핑
 * Player Card 뷰에서 표시되는 11개 카테고리.
 * ACTIVE DEFENDING은 adjustment 모드에 따라 접미사가 변경됨 (PADJ./Raw)
 */
const CATEGORY_KEY_MAP: Record<string, string> = {
  "FINAL PRODUCT": "final_product",
  SHOOTING: "shooting",
  RECEIVING: "possession",
  CREATION: "creation",
  CROSSING: "creation",
  DRIBBLING: "ball_carrying",
  PROGRESSION: "passing",
  "PASSING ACCURACY": "passing",
  "ACTIVE DEFENDING (PADJ.)": "defending",
  "ACTIVE DEFENDING (RAW)": "defending",
  "ACTIVE DEFENDING": "defending",
  AERIAL: "aerial",
  "SET PIECES": "set_pieces",
};

/**
 * 카테고리별 메트릭 파싱.
 * 파싱 도중 오류가 나면 그때까지 수집된 것만 반환한다(부분 결과 허용).
 * 단, 결과가 비어 있으면 호출부(parseAndSave)가 저장하지 않고 실패로 처리해야 한다
 * — 빈 JSONB 행이 저장되면 "수집 완료"로 보여 갭 탐지 쿼리가 무력화된다.
 */
export async function parseMetrics(
  iframe: FrameLocator,
): Promise<ParsedMetric[]> {
  const metrics: ParsedMetric[] = [];

  try {
    // "FINAL PRODUCT" 카테고리 헤더로 카드 렌더링 대기
    const firstCategory = iframe.locator('text="FINAL PRODUCT"').first();
    await firstCategory.waitFor({ state: "visible", timeout: 20_000 });

    for (const [cat, categoryKey] of Object.entries(CATEGORY_KEY_MAP)) {
      const catHeader = iframe.locator(`text="${cat}"`).first();
      if ((await catHeader.count()) === 0) continue;

      // 카테고리 헤더의 부모 → 카테고리 섹션 컨테이너
      const sectionChildren = catHeader.locator("..").locator(":scope > *");
      const childCount = await sectionChildren.count();

      for (let i = 0; i < childCount; i++) {
        const child = sectionChildren.nth(i);
        const innerChildren = child.locator(":scope > *");
        const innerCount = await innerChildren.count();
        if (innerCount < 2) continue;

        // 이름 셀: innerText → 보이는 텍스트만 (tooltip 설명 제외)
        const name = (await innerChildren.nth(0).innerText())?.trim() ?? "";
        // 백분위: 마지막 셀
        const lastText =
          (await innerChildren.nth(innerCount - 1).textContent())?.trim() ?? "";
        const percentile = parseInt(lastText.replace(/[^0-9-]/g, ""), 10);

        if (!name || name === cat || isNaN(percentile)) continue;

        // value: 중간 셀 (있는 경우)
        let value: number | undefined;
        if (innerCount >= 3) {
          const valText = await innerChildren.nth(1).textContent();
          if (valText) {
            value = parseFloat(valText.replace(/[%,]/g, "").trim());
            if (isNaN(value)) value = undefined;
          }
        }

        metrics.push({ name, percentile, value, category: categoryKey });
      }
    }
  } catch (e) {
    logWarn(
      `메트릭 파싱 중 오류(수집분 ${metrics.length}개만 반환): ${e instanceof Error ? e.message : "unknown"}`,
    );
  }

  return metrics;
}

/** Top 5 유사 선수 파싱 */
export async function parseSimilarPlayers(
  iframe: FrameLocator,
  page: Page,
): Promise<ParsedSimilarPlayer[]> {
  const similar: ParsedSimilarPlayer[] = [];

  try {
    // 유사 선수 섹션 찾기 (Player Card 하단 또는 별도 탭에 있을 수 있음)
    const header = iframe.locator("text=/Top 5 Most Similar/i").first();
    const exists = await header.count();
    if (exists === 0) return similar;

    await header.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const section = header.locator("..");
    const dataContainer = section.locator("> div").last();
    const rows = dataContainer.locator("> div");
    const count = await rows.count();

    // 첫 행은 헤더 (#, PLAYER, SCORE)
    for (let i = 1; i < count && i <= 5; i++) {
      const row = rows.nth(i);

      // rank — 첫 div 자식
      const rankEl = row.locator("> div").first();
      const rankText = await rankEl.textContent();
      const rank = parseInt(rankText?.trim() ?? "0", 10);

      // 선수 정보 블록 — 두번째 div 자식
      const playerBlock = row.locator("> div").nth(1);
      // 선수명 — innerText로 보이는 이름만
      const nameInner = playerBlock.locator("div div").first();
      const name = await nameInner.innerText();
      // 부가 정보 (age, position, team)
      const infoEl = playerBlock.locator("> div").last();
      const info = await infoEl.innerText();

      if (rank && name) {
        similar.push({
          rank,
          name: name.trim(),
          info: info?.trim() ?? "",
        });
      }
    }
  } catch (e) {
    logWarn(
      `유사 선수 파싱 실패: ${e instanceof Error ? e.message.substring(0, 200) : "unknown"}`,
    );
  }

  return similar;
}

/** Similarity Score 탭에서 20명의 유사 선수 + 실제 점수 파싱 */
export async function parseSimilarPlayersFromTab(
  iframe: FrameLocator,
  page: Page,
): Promise<ParsedSimilarPlayer[]> {
  const similar: ParsedSimilarPlayer[] = [];

  try {
    // 1. Similarity Score 탭 클릭
    const tabBtn = iframe
      .locator('button:has-text("Similarity Score")')
      .first();
    const tabExists = await tabBtn.count();
    if (tabExists === 0) {
      logWarn("Similarity Score 탭을 찾을 수 없습니다");
      return similar;
    }
    await tabBtn.click();
    // Streamlit 상태 위젯 대기 (데이터 로딩)
    try {
      await iframe
        .locator('[data-testid="stStatusWidget"]')
        .waitFor({ state: "visible", timeout: 3000 });
      await iframe
        .locator('[data-testid="stStatusWidget"]')
        .waitFor({ state: "hidden", timeout: 30_000 });
    } catch {
      // 위젯이 나타나지 않으면 즉시 로딩 완료
    }
    await page.waitForTimeout(3000);

    // 2. "20 Most Similar" 텍스트 대기
    const header = iframe.locator("text=/20 Most Similar/").first();
    await header.waitFor({ state: "visible", timeout: 15_000 });
    logInfo("  Similarity Score 탭: 헤더 감지 완료");

    // 3. stHorizontalBlock (2열) 에서 innerText 기반 파싱
    // 구조: header → ancestor stVerticalBlock → stHorizontalBlock (좌/우 열)
    // 각 열 innerText: "#\nPLAYER\nSCORE\n1\nName\ninfo\n91\n2\n..."
    // → 헤더 3줄 스킵 후 4줄씩 (rank, name, info, score)

    // header의 stElementContainer → following-sibling stHorizontalBlock
    const hBlock = header.locator(
      'xpath=ancestor::div[contains(@class, "stElementContainer")]/following-sibling::div[contains(@class, "stHorizontalBlock")][1]',
    );
    await hBlock.waitFor({ state: "visible", timeout: 10_000 });
    const cols = hBlock.locator(":scope > *");
    const colCount = await cols.count();
    logInfo(`  Similarity Score 탭: ${colCount}개 열 발견`);

    for (let c = 0; c < colCount; c++) {
      const colText = await cols.nth(c).innerText();
      const lines = colText
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      // 첫 3줄은 헤더 (#, PLAYER, SCORE) — 스킵
      // 헤더 라인 인덱스 찾기: "SCORE" 포함 줄
      let headerEnd = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i] === "SCORE") {
          headerEnd = i + 1;
          break;
        }
      }
      const dataLines = lines.slice(headerEnd);

      // 4줄씩 묶어서 파싱: rank, name, info, score
      for (let i = 0; i + 3 <= dataLines.length; i += 4) {
        const rank = parseInt(dataLines[i], 10);
        const name = dataLines[i + 1];
        const info = dataLines[i + 2];
        const scoreNum = parseFloat(dataLines[i + 3]);
        const score = scoreNum > 1 ? scoreNum / 100 : scoreNum;

        if (rank && name) {
          similar.push({ rank, name, info, score });
        }
      }
    }

    logInfo(`  Similarity Score 탭: ${similar.length}명 파싱 완료`);
  } catch (e) {
    logWarn(
      `Similarity Score 탭 파싱 실패: ${e instanceof Error ? e.message.substring(0, 200) : "unknown"}`,
    );
  } finally {
    // 4. Player Card 탭으로 복귀
    try {
      const playerCardBtn = iframe
        .locator('button:has-text("Player Card")')
        .first();
      if ((await playerCardBtn.count()) > 0) {
        await playerCardBtn.click();
        await page.waitForTimeout(2000);
      }
    } catch {
      logWarn("Player Card 탭 복귀 실패");
    }
  }

  return similar;
}

/**
 * 파싱된 메트릭을 카테고리별 JSONB 구조로 변환
 * 각 메트릭에 이미 category가 할당되어 있으므로 단순 그룹핑
 */
export function groupMetricsByCategory(
  metrics: ParsedMetric[],
): Record<string, Record<string, { value: number; percentile: number }>> {
  const grouped: Record<
    string,
    Record<string, { value: number; percentile: number }>
  > = {};

  for (const metric of metrics) {
    const category = metric.category;
    if (!grouped[category]) {
      grouped[category] = {};
    }
    grouped[category][metric.name] = {
      value: metric.value ?? 0,
      percentile: metric.percentile,
    };
  }

  return grouped;
}

/**
 * 유사 선수 info 문자열 파싱
 * "18, AM/W, Barcelona" → { age, position, team }
 */
export function parseSimilarPlayerInfo(info: string): {
  age: number;
  position: string;
  team: string;
} {
  const parts = info.split(",").map((s) => s.trim());
  return {
    age: parseInt(parts[0] ?? "0", 10),
    position: parts[1] ?? "",
    team: parts.slice(2).join(", ").trim(),
  };
}

// ─── Action Maps 파서 ───
// ScoutLab Action Maps는 서버사이드 렌더링 PNG 이미지로 제공됨
// SVG 라인 좌표 추출 불가 → 텍스트 메타데이터 + 이미지 URL 수집

/**
 * Action Maps 헤더 텍스트에서 total_count, per90 추출
 * 패턴: "Carries (89 | 3.7 P90)" / "Passes (107 | 4.5 P90)"
 */
function parseActionHeader(text: string): {
  actionType: ParsedActionMap["actionType"] | null;
  totalCount: number;
  per90: number;
} {
  // "Carries (89 | 3.7 P90)" 패턴
  const match = text.match(
    /(carries|passes|crosses)\s*\(\s*(\d+)\s*\|\s*([\d.]+)\s*P90\s*\)/i,
  );
  if (!match) return { actionType: null, totalCount: 0, per90: 0 };

  const typeMap: Record<string, ParsedActionMap["actionType"]> = {
    carries: "carries",
    passes: "passes",
    crosses: "crosses",
  };

  return {
    actionType: typeMap[match[1]!.toLowerCase()] ?? null,
    totalCount: parseInt(match[2]!, 10),
    per90: parseFloat(match[3]!),
  };
}

/**
 * Action Maps 탭에서 메타데이터 + 이미지 URL 파싱
 * ScoutLab은 matplotlib 차트를 서버사이드 PNG로 렌더링 (st.image)
 * 전제: 이미 Action Maps 탭으로 이동한 상태
 */
export async function parseActionMaps(
  iframe: FrameLocator,
  page: Page,
): Promise<ParsedActionMap[]> {
  const results: ParsedActionMap[] = [];

  try {
    // 콘텐츠 렌더링 대기 (서버사이드 PNG 생성 시간)
    await page.waitForTimeout(3000);

    // 메인 영역 스크롤하여 lazy-loaded 콘텐츠 로딩
    try {
      const mainArea = iframe
        .locator('[data-testid="stAppViewContainer"]')
        .first();
      for (let i = 0; i < 3; i++) {
        await mainArea.evaluate((el) => {
          el.scrollTop += 500;
        });
        await page.waitForTimeout(500);
      }
      // 다시 위로 스크롤
      await mainArea.evaluate((el) => {
        el.scrollTop = 0;
      });
      await page.waitForTimeout(500);
    } catch {
      // 스크롤 실패 무시
    }

    // 1. stImage에서 이미지 URL 추출
    let imageUrl: string | undefined;
    const stImageCount = await iframe
      .locator('[data-testid="stImage"]')
      .count();
    if (stImageCount > 0) {
      const stImg = iframe.locator('[data-testid="stImage"]').first();
      const innerImg = stImg.locator("img");
      if ((await innerImg.count()) > 0) {
        const src = await innerImg.first().getAttribute("src");
        if (src && !src.startsWith("data:")) {
          imageUrl = src;
          logInfo(`  Action Maps 이미지 URL: ${src.substring(0, 80)}...`);
        }
      }
    }

    // stImage가 없으면 큰 img 요소에서 찾기 (width > 500px)
    if (!imageUrl) {
      const allImgs = iframe.locator("img");
      const imgCount = await allImgs.count();
      for (let i = 0; i < imgCount; i++) {
        const img = allImgs.nth(i);
        const style = (await img.getAttribute("style")) ?? "";
        const widthMatch = style.match(/width:\s*(\d+)px/);
        if (widthMatch && parseInt(widthMatch[1]!, 10) > 500) {
          const src = await img.getAttribute("src");
          if (src && !src.startsWith("data:image/gif")) {
            imageUrl = src;
            logInfo(
              `  Action Maps 이미지 URL (img fallback): ${src.substring(0, 80)}...`,
            );
            break;
          }
        }
      }
    }

    // 2. 텍스트에서 액션 타입별 통계 추출
    // 2. 텍스트에서 액션 타입별 통계 추출
    const actionTypes: ParsedActionMap["actionType"][] = [
      "carries",
      "passes",
      "crosses",
    ];

    // 전략 A: evaluate로 전체 DOM 텍스트(innerHTML 포함) 추출
    const allHtml = await iframe
      .locator("body")
      .first()
      .evaluate((el) => el.innerHTML)
      .catch(() => "");

    const headerRegex =
      /(carries|passes|crosses)\s*\(\s*(\d+)\s*\|\s*([\d.]+)\s*P90\s*\)/gi;
    const htmlMatches = [...allHtml.matchAll(headerRegex)];

    if (htmlMatches.length > 0) {
      for (const match of htmlMatches) {
        const parsed = parseActionHeader(match[0]);
        if (
          parsed.actionType &&
          !results.some((r) => r.actionType === parsed.actionType)
        ) {
          results.push({
            actionType: parsed.actionType,
            lines: [],
            totalCount: parsed.totalCount,
            per90: parsed.per90,
            imageUrl,
          });
          logInfo(
            `  ${parsed.actionType}: total=${parsed.totalCount}, per90=${parsed.per90}`,
          );
        }
      }
    }

    // 전략 B: Playwright text 로케이터로 개별 탐색
    if (results.length === 0) {
      logInfo("  innerHTML 매칭 실패, text 로케이터 시도");
      for (const type of actionTypes) {
        const regex = new RegExp(
          `${type}\\s*\\(\\s*(\\d+)\\s*\\|\\s*([\\d.]+)\\s*P90\\s*\\)`,
          "i",
        );
        const elements = iframe.locator(`text=/${type}/i`);
        const count = await elements.count();

        for (let i = 0; i < Math.min(count, 5); i++) {
          const text = await elements
            .nth(i)
            .textContent()
            .catch(() => "");
          if (!text) continue;

          const match = text.match(regex);
          if (match && !results.some((r) => r.actionType === type)) {
            results.push({
              actionType: type,
              lines: [],
              totalCount: parseInt(match[1]!, 10),
              per90: parseFloat(match[2]!),
              imageUrl,
            });
            logInfo(`  ${type}: total=${match[1]}, per90=${match[2]}`);
            break;
          }
        }
      }
    }

    // 전략 C: 이미지만 있고 텍스트 없는 경우 — 이미지 URL만으로 결과 생성
    if (results.length === 0 && imageUrl) {
      logInfo("  텍스트 메타데이터 추출 실패, 이미지 URL만으로 결과 생성");
      for (const type of actionTypes) {
        results.push({
          actionType: type,
          lines: [],
          totalCount: 0,
          per90: 0,
          imageUrl,
        });
      }
    }

    if (results.length === 0) {
      logWarn(
        "  Action Maps 데이터를 찾을 수 없습니다 (--dump-action-maps-dom으로 DOM 확인 필요)",
      );
    } else {
      logInfo(
        `  Action Maps ${results.length}개 타입 파싱 완료 (이미지: ${imageUrl ? "있음" : "없음"})`,
      );
    }
  } catch (e) {
    logWarn(
      `Action Maps 파싱 실패: ${e instanceof Error ? e.message.substring(0, 200) : "unknown"}`,
    );
  }

  return results;
}
