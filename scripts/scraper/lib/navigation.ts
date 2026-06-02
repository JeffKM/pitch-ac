// ScoutLab 필터 네비게이션 (시즌/리그/팀/선수 선택)

import type { FrameLocator, Page } from "@playwright/test";

import { STREAMLIT_LOAD_TIMEOUT } from "./constants";
import { logInfo } from "./logger";

/** 시즌 선택 (radiogroup 버튼) — 이미 선택된 경우 건너뜀 */
export async function selectSeason(
  iframe: FrameLocator,
  page: Page,
  season: string,
): Promise<void> {
  logInfo(`시즌 선택: ${season}`);
  // 이미 선택된 시즌인지 확인 (카드 헤더에 표시)
  const seasonText = `20${season}`;
  const alreadySelected = await iframe.locator(`text="${seasonText}"`).count();
  if (alreadySelected > 0) {
    logInfo(`  → 이미 ${season} 선택됨, 건너뜀`);
    return;
  }
  const btn = iframe.locator(`button:has-text("${season}")`).first();
  await btn.click();
  await waitForStreamlitUpdate(iframe, page);
}

/** 사이드바 탭 선택 */
export async function selectSidebarTab(
  iframe: FrameLocator,
  page: Page,
  tabName: string,
): Promise<void> {
  logInfo(`탭 선택: ${tabName}`);
  const btn = iframe.locator(`button:has-text("${tabName}")`).first();
  await btn.click();
  await waitForStreamlitUpdate(iframe, page);
}

/** Streamlit combobox 값 선택 */
async function selectCombobox(
  iframe: FrameLocator,
  page: Page,
  labelKeyword: string,
  value: string,
): Promise<void> {
  // Streamlit combobox: input[role="combobox"][aria-label*="..."]
  const combobox = iframe
    .locator(`input[role="combobox"][aria-label*="${labelKeyword}"]`)
    .first();
  await combobox.waitFor({ state: "visible", timeout: 30_000 });
  await combobox.click();
  await page.waitForTimeout(300);

  // 전체 선택 후 새 값 입력
  await combobox.click({ clickCount: 3 });
  await combobox.fill(value);
  await page.waitForTimeout(800);

  // 드롭다운 옵션 선택
  const option = iframe
    .locator(`[role="option"]`)
    .filter({ hasText: value })
    .first();
  await option.waitFor({ state: "visible", timeout: 5000 });
  await option.click();
  await waitForStreamlitUpdate(iframe, page);
}

/** 리그 선택 */
export async function selectLeague(
  iframe: FrameLocator,
  page: Page,
  league: string,
): Promise<void> {
  logInfo(`리그 선택: ${league}`);
  await selectCombobox(iframe, page, "League", league);
}

/** 팀 선택 */
export async function selectTeam(
  iframe: FrameLocator,
  page: Page,
  team: string,
): Promise<void> {
  logInfo(`팀 선택: ${team}`);
  await selectCombobox(iframe, page, "Club", team);
}

/** 선수 선택 (팀 내 Player combobox) */
export async function selectPlayer(
  iframe: FrameLocator,
  page: Page,
  player: string,
): Promise<void> {
  await selectCombobox(iframe, page, "Player", player);
}

/** 글로벌 선수 검색 (상단 "Search player" combobox 사용) */
export async function searchPlayer(
  iframe: FrameLocator,
  page: Page,
  player: string,
): Promise<void> {
  logInfo(`선수 검색: ${player}`);
  const combobox = iframe
    .locator('input[role="combobox"][aria-label="Search player"]')
    .first();
  await combobox.waitFor({ state: "visible", timeout: 30_000 });
  await combobox.click();
  await page.waitForTimeout(300);

  await combobox.fill(player);
  await page.waitForTimeout(1000);

  // 드롭다운 옵션 선택
  const option = iframe
    .locator('[role="option"]')
    .filter({ hasText: player })
    .first();
  await option.waitFor({ state: "visible", timeout: 10_000 });
  await option.click();
  await waitForStreamlitUpdate(iframe, page);
}

/**
 * Streamlit 가상화 combobox에서 전체 옵션 수집
 * option의 grandparent (overflow:auto DIV)를 직접 스크롤하여 가상화 우회
 */
async function extractAllComboboxOptions(
  iframe: FrameLocator,
  page: Page,
  labelKeyword: string,
): Promise<string[]> {
  const combobox = iframe
    .locator(`input[role="combobox"][aria-label*="${labelKeyword}"]`)
    .first();
  await combobox.waitFor({ state: "visible", timeout: 10_000 });
  await combobox.click();
  await page.waitForTimeout(800);

  const collected = new Set<string>();

  // 현재 보이는 옵션 수집
  const collectVisible = async () => {
    const options = iframe.locator('[role="option"]');
    const count = await options.count();
    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).textContent();
      if (text) collected.add(text.trim());
    }
  };

  await collectVisible();

  // 스크롤 컨테이너 = option의 grandparent (overflow:auto DIV)
  const firstOption = iframe.locator('[role="option"]').first();
  const optionExists = (await firstOption.count()) > 0;

  if (optionExists) {
    const scrollContainer = firstOption.locator("xpath=ancestor::*[2]");

    for (let i = 0; i < 50; i++) {
      await scrollContainer.evaluate((el) => {
        el.scrollTop += 200;
      });
      await page.waitForTimeout(200);
      await collectVisible();

      // 끝에 도달했는지 확인
      const atEnd = await scrollContainer.evaluate(
        (el) => el.scrollTop + el.clientHeight >= el.scrollHeight - 10,
      );
      if (atEnd) break;
    }
  }

  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);

  logInfo(`  ${labelKeyword} combobox: ${collected.size}개 옵션 수집`);
  return [...collected].sort((a, b) => a.localeCompare(b));
}

/** 팀 목록 추출 (Club combobox 전체 스크롤) */
export async function extractTeamList(
  iframe: FrameLocator,
  page: Page,
): Promise<string[]> {
  return extractAllComboboxOptions(iframe, page, "Club");
}

/** 선수 목록 추출 (Player combobox 전체 스크롤) */
export async function extractPlayerList(
  iframe: FrameLocator,
  page: Page,
): Promise<string[]> {
  return extractAllComboboxOptions(iframe, page, "Player");
}

/** Streamlit segmented control에서 특정 값 선택 */
async function selectSegmentedControl(
  iframe: FrameLocator,
  page: Page,
  label: string,
): Promise<void> {
  // 이미 활성 상태면 건너뜀
  const activeBtn = iframe
    .locator('[data-testid="stBaseButton-segmented_controlActive"]')
    .filter({ hasText: label })
    .first();
  if ((await activeBtn.count()) > 0) return;

  // 비활성 버튼 클릭
  const btn = iframe
    .locator('[data-testid="stBaseButton-segmented_control"]')
    .filter({ hasText: label })
    .first();
  await btn.waitFor({ state: "visible", timeout: 10_000 });
  await btn.click();
  await waitForStreamlitUpdate(iframe, page);
}

/** 수치 모드 토글 (P90 / Total) */
export async function toggleMode(
  iframe: FrameLocator,
  page: Page,
  mode: "per90" | "total",
): Promise<void> {
  const label = mode === "per90" ? "P90" : "Total";
  logInfo(`모드 토글: ${label}`);
  await selectSegmentedControl(iframe, page, label);
}

/** 보정 모드 토글 (PAdj. / Raw) */
export async function toggleAdjustment(
  iframe: FrameLocator,
  page: Page,
  adjustment: "padj" | "raw",
): Promise<void> {
  const label = adjustment === "padj" ? "Padj." : "Raw";
  logInfo(`보정 토글: ${label}`);
  await selectSegmentedControl(iframe, page, label);
}

/** 포지션 비교 그룹 토글 (CB / FB / MF / AM/W / FW) */
export async function toggleComparisonPosition(
  iframe: FrameLocator,
  page: Page,
  position: string,
): Promise<void> {
  logInfo(`비교 그룹 토글: ${position}`);
  await selectSegmentedControl(iframe, page, position);
}

/** Action Maps 탭으로 이동 + Streamlit 로딩 대기 */
export async function navigateToActionMapsTab(
  iframe: FrameLocator,
  page: Page,
): Promise<void> {
  logInfo("Action Maps 탭 이동");
  const tabBtn = iframe.locator('button:has-text("Action Maps")').first();
  const exists = await tabBtn.count();
  if (exists === 0) {
    throw new Error("Action Maps 탭을 찾을 수 없습니다");
  }
  await tabBtn.click();
  try {
    await iframe
      .locator('[data-testid="stStatusWidget"]')
      .waitFor({ state: "visible", timeout: 3000 });
    await iframe
      .locator('[data-testid="stStatusWidget"]')
      .waitFor({ state: "hidden", timeout: 30_000 });
  } catch {
    // 즉시 로딩 완료
  }
  await page.waitForTimeout(3000);
}

/** Player Card 탭으로 복귀 */
export async function navigateBackToPlayerCard(
  iframe: FrameLocator,
  page: Page,
): Promise<void> {
  logInfo("Player Card 탭 복귀");
  const btn = iframe.locator('button:has-text("Player Card")').first();
  if ((await btn.count()) > 0) {
    await btn.click();
    await waitForStreamlitUpdate(iframe, page);
    // Player combobox가 완전히 렌더링될 때까지 추가 대기
    await page.waitForTimeout(1500);
  }
}

/** Streamlit 데이터 업데이트 대기 */
async function waitForStreamlitUpdate(
  iframe: FrameLocator,
  page: Page,
): Promise<void> {
  try {
    await iframe
      .locator('[data-testid="stStatusWidget"]')
      .waitFor({ state: "visible", timeout: 2000 });
    await iframe
      .locator('[data-testid="stStatusWidget"]')
      .waitFor({ state: "hidden", timeout: STREAMLIT_LOAD_TIMEOUT });
  } catch {
    // widget이 나타나지 않으면 즉시 업데이트 완료
  }
  await page.waitForTimeout(500);
}
