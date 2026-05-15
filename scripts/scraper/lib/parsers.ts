// ScoutLab DOM → 데이터 파싱 (선수 정보 + 메트릭 + 유사 선수)

import type { FrameLocator, Page } from "@playwright/test";

import { logInfo, logWarn } from "./logger";
import type {
  ParsedMetric,
  ParsedPlayerInfo,
  ParsedSimilarPlayer,
} from "./types";

/** 선수 기본 정보 파싱 */
export async function parsePlayerInfo(
  iframe: FrameLocator,
): Promise<ParsedPlayerInfo> {
  // Player Card 렌더링 대기
  await iframe
    .locator('text="NATION:"')
    .first()
    .waitFor({ state: "visible", timeout: 15_000 });

  // 선수명: Player combobox의 aria-label에서 추출
  const name = await extractPlayerName(iframe);
  const position = await extractCurrentPosition(iframe);
  const season = await extractSeasonFromCard(iframe);
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

/** 시즌 추출 — 카드 헤더의 "2025/26" 텍스트에서 */
async function extractSeasonFromCard(iframe: FrameLocator): Promise<string> {
  const seasonEl = iframe.locator("text=/20\\d\\d\\/\\d\\d/").first();
  try {
    const text = await seasonEl.textContent({ timeout: 3000 });
    if (text) {
      const match = text.match(/20(\d\d)\/(\d\d)/);
      if (match) return `${match[1]}/${match[2]}`;
    }
  } catch {
    // fallback
  }
  return "25/26";
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

/** 카테고리별 메트릭 파싱 */
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
    logWarn(`메트릭 파싱 실패: ${e instanceof Error ? e.message : "unknown"}`);
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
