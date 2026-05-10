// Playwright 브라우저 launch + iframe 접근

import {
  type Browser,
  chromium,
  type FrameLocator,
  type Page,
} from "@playwright/test";

import { SCOUTLAB_URL, STREAMLIT_LOAD_TIMEOUT } from "./constants";
import { logInfo } from "./logger";

export interface BrowserContext {
  browser: Browser;
  page: Page;
}

/** 브라우저 인스턴스 생성 */
export async function launchBrowser(
  headless: boolean,
): Promise<BrowserContext> {
  logInfo(`브라우저 실행 (headless: ${headless})`);
  const browser = await chromium.launch({ headless });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  return { browser, page };
}

/** ScoutLab 접속 후 FrameLocator 반환 */
export async function navigateToScoutLab(page: Page): Promise<FrameLocator> {
  logInfo(`ScoutLab 접속: ${SCOUTLAB_URL}`);
  await page.goto(SCOUTLAB_URL, { waitUntil: "load", timeout: 60_000 });

  // Streamlit iframe FrameLocator (lazy — 항상 최신 iframe 참조)
  const iframe = page.frameLocator('iframe[title="streamlitApp"]');

  // Player Card 버튼이 나타날 때까지 대기
  await iframe
    .locator("button:has-text('Player Card')")
    .waitFor({ state: "visible", timeout: 60_000 });
  logInfo("Streamlit iframe 감지 완료");

  await waitForStreamlitReady(iframe, page);
  return iframe;
}

/** Streamlit 로딩 완료 대기 */
export async function waitForStreamlitReady(
  iframe: FrameLocator,
  page: Page,
): Promise<void> {
  try {
    await iframe
      .locator('[data-testid="stStatusWidget"]')
      .waitFor({ state: "hidden", timeout: STREAMLIT_LOAD_TIMEOUT });
  } catch {
    // status widget이 없으면 이미 로딩 완료
  }
  await page.waitForTimeout(500);
}

/** 페이지 새로고침 후 FrameLocator 반환 */
export async function refreshAndReconnect(page: Page): Promise<FrameLocator> {
  logInfo("페이지 새로고침 (WebSocket 복구)");
  await page.reload({ waitUntil: "load", timeout: 60_000 });

  const iframe = page.frameLocator('iframe[title="streamlitApp"]');
  await iframe
    .locator("button:has-text('Player Card')")
    .waitFor({ state: "visible", timeout: 60_000 });

  await waitForStreamlitReady(iframe, page);
  return iframe;
}
