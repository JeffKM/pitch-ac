// Action Maps 탭 DOM 구조 탐색 유틸리티
// --dump-action-maps-dom 모드에서 사용

import type { FrameLocator, Page } from "@playwright/test";

import { logInfo, logWarn } from "./logger";

/**
 * Action Maps 탭의 DOM 구조를 콘솔에 덤프
 * - 탭 버튼 목록
 * - 렌더링 방식 (SVG / Canvas / img)
 * - SVG viewBox, line/path 카운트, stroke 색상
 * - 섹션 헤더 텍스트 (carries / passes / crosses)
 * - innerHTML 샘플 (5000자)
 */
export async function dumpActionMapsDom(
  iframe: FrameLocator,
  page: Page,
): Promise<void> {
  logInfo("=== Action Maps DOM 탐색 시작 ===");

  // 1. 현재 보이는 탭 버튼 목록
  const buttons = iframe.locator("button");
  const buttonCount = await buttons.count();
  const buttonTexts: string[] = [];
  for (let i = 0; i < buttonCount; i++) {
    const text = await buttons.nth(i).textContent();
    if (text?.trim()) buttonTexts.push(text.trim());
  }
  logInfo(`탭 버튼 목록 (${buttonTexts.length}개): ${buttonTexts.join(" | ")}`);

  // 2. Action Maps 탭 클릭
  const actionMapsBtn = iframe
    .locator('button:has-text("Action Maps")')
    .first();
  const tabExists = await actionMapsBtn.count();
  if (tabExists === 0) {
    logWarn("Action Maps 탭을 찾을 수 없습니다");
    return;
  }
  await actionMapsBtn.click();
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
  logInfo("Action Maps 탭 클릭 완료, 렌더링 대기");

  // 3. 렌더링 요소 카운트
  const svgCount = await iframe.locator("svg").count();
  const canvasCount = await iframe.locator("canvas").count();
  const imgCount = await iframe.locator("img").count();
  logInfo(
    `렌더링 요소: SVG=${svgCount}, Canvas=${canvasCount}, img=${imgCount}`,
  );

  // 4. SVG 상세 분석
  if (svgCount > 0) {
    for (let i = 0; i < Math.min(svgCount, 10); i++) {
      const svg = iframe.locator("svg").nth(i);
      const viewBox = await svg.getAttribute("viewBox");
      const width = await svg.getAttribute("width");
      const height = await svg.getAttribute("height");
      const lineCount = await svg.locator("line").count();
      const pathCount = await svg.locator("path").count();
      const circleCount = await svg.locator("circle").count();
      const rectCount = await svg.locator("rect").count();

      if (lineCount + pathCount + circleCount > 0) {
        logInfo(
          `  SVG[${i}]: viewBox="${viewBox}" width=${width} height=${height}` +
            ` | line=${lineCount} path=${pathCount} circle=${circleCount} rect=${rectCount}`,
        );

        // stroke 색상 샘플
        if (lineCount > 0) {
          const strokes = new Set<string>();
          for (let j = 0; j < Math.min(lineCount, 20); j++) {
            const stroke = await svg
              .locator("line")
              .nth(j)
              .getAttribute("stroke");
            if (stroke) strokes.add(stroke);
          }
          logInfo(`    line stroke 색상: ${[...strokes].join(", ")}`);

          // 첫 번째 line 좌표 샘플
          const firstLine = svg.locator("line").first();
          const x1 = await firstLine.getAttribute("x1");
          const y1 = await firstLine.getAttribute("y1");
          const x2 = await firstLine.getAttribute("x2");
          const y2 = await firstLine.getAttribute("y2");
          logInfo(`    첫 line 좌표: x1=${x1} y1=${y1} x2=${x2} y2=${y2}`);
        }

        if (pathCount > 0) {
          const firstPath = svg.locator("path").first();
          const d = await firstPath.getAttribute("d");
          const stroke = await firstPath.getAttribute("stroke");
          logInfo(`    첫 path: d="${d?.substring(0, 100)}" stroke=${stroke}`);
        }
      }
    }
  }

  // 5. 섹션 헤더 탐색 (carries / passes / crosses)
  for (const keyword of [
    "carries",
    "passes",
    "crosses",
    "Carries",
    "Passes",
    "Crosses",
  ]) {
    const found = await iframe.locator(`text=/${keyword}/i`).count();
    if (found > 0) {
      logInfo(`  섹션 키워드 "${keyword}" 발견: ${found}개`);
    }
  }

  // 6. total / per 90 / per90 / p90 텍스트 탐색
  for (const keyword of [
    "total",
    "per 90",
    "per90",
    "p90",
    "Total",
    "Per 90",
  ]) {
    const found = await iframe.locator(`text=/${keyword}/i`).count();
    if (found > 0) {
      logInfo(`  수치 키워드 "${keyword}" 발견: ${found}개`);
    }
  }

  // 7. img 요소 상세 분석
  if (imgCount > 0) {
    logInfo("=== img 요소 상세 ===");
    for (let i = 0; i < imgCount; i++) {
      const img = iframe.locator("img").nth(i);
      const src = await img.getAttribute("src");
      const alt = await img.getAttribute("alt");
      const width = await img.getAttribute("width");
      const height = await img.getAttribute("height");
      const style = await img.getAttribute("style");
      const srcPreview = src
        ? src.startsWith("data:")
          ? `data:${src.substring(5, 40)}... (${src.length}자)`
          : src.substring(0, 150)
        : "null";
      logInfo(
        `  img[${i}]: src="${srcPreview}" alt="${alt}" width=${width} height=${height} style="${style?.substring(0, 100)}"`,
      );
    }
  }

  // 8. Plotly 컨테이너 확인
  const plotlyDivs = await iframe.locator(".plotly").count();
  const jsPlotly = await iframe.locator('[class*="js-plotly"]').count();
  if (plotlyDivs > 0 || jsPlotly > 0) {
    logInfo(`  Plotly 컨테이너: .plotly=${plotlyDivs}, js-plotly=${jsPlotly}`);
  }

  // 9. Streamlit 차트 컨테이너
  const stCharts = await iframe
    .locator(
      '[data-testid*="chart"], [data-testid*="plot"], [data-testid*="vega"]',
    )
    .count();
  if (stCharts > 0) {
    logInfo(`  Streamlit 차트 요소: ${stCharts}개`);
  }

  // 10. stImage (Streamlit 이미지 컴포넌트) 확인
  const stImages = await iframe.locator('[data-testid="stImage"]').count();
  if (stImages > 0) {
    logInfo(`  Streamlit stImage 요소: ${stImages}개`);
    for (let i = 0; i < stImages; i++) {
      const stImg = iframe.locator('[data-testid="stImage"]').nth(i);
      // stImage 안의 img 태그 확인
      const innerImg = stImg.locator("img");
      const innerImgCount = await innerImg.count();
      if (innerImgCount > 0) {
        const src = await innerImg.first().getAttribute("src");
        const srcPreview = src
          ? src.startsWith("data:")
            ? `data:${src.substring(5, 40)}... (${src.length}자)`
            : src.substring(0, 150)
          : "null";
        logInfo(`    stImage[${i}]: img src="${srcPreview}"`);
      }
      // 캡션 텍스트
      const caption = await stImg
        .locator('[data-testid="stImageCaption"]')
        .textContent()
        .catch(() => null);
      if (caption) {
        logInfo(`    stImage[${i}] caption: "${caption}"`);
      }
    }
  }

  // 11. 메인 콘텐츠 영역 innerHTML — 사이드바가 아닌 메인 영역
  try {
    // 메인 콘텐츠 영역 (사이드바 제외)
    const mainContent = iframe
      .locator('[data-testid="stMainBlockContainer"]')
      .first();
    const mainExists = await mainContent.count();
    if (mainExists > 0) {
      const html = await mainContent.evaluate((el) =>
        el.innerHTML.substring(0, 8000),
      );
      logInfo("=== 메인 콘텐츠 innerHTML (8000자) ===");
      console.log(html);
      logInfo("=== 메인 innerHTML 끝 ===");
    } else {
      // fallback: stVerticalBlock 중 가장 큰 것
      const blocks = iframe.locator('[data-testid="stVerticalBlock"]');
      const blockCount = await blocks.count();
      logInfo(`  stVerticalBlock ${blockCount}개 발견`);
      let maxLen = 0;
      let maxIdx = 0;
      for (let i = 0; i < Math.min(blockCount, 5); i++) {
        const len = await blocks.nth(i).evaluate((el) => el.innerHTML.length);
        logInfo(`    block[${i}] innerHTML 길이: ${len}`);
        if (len > maxLen) {
          maxLen = len;
          maxIdx = i;
        }
      }
      const html = await blocks
        .nth(maxIdx)
        .evaluate((el) => el.innerHTML.substring(0, 8000));
      logInfo(`=== block[${maxIdx}] innerHTML (8000자) ===`);
      console.log(html);
      logInfo("=== innerHTML 끝 ===");
    }
  } catch {
    logWarn("메인 블록 innerHTML 추출 실패");
  }

  // 12. 메인 영역 스크롤 후 재탐색
  logInfo("=== 스크롤 후 차트 탐색 ===");
  try {
    const mainArea = iframe
      .locator('[data-testid="stAppViewContainer"]')
      .first();
    // 여러 번 스크롤하면서 새 요소 탐색
    for (let scroll = 0; scroll < 5; scroll++) {
      await mainArea.evaluate((el) => {
        el.scrollTop += 600;
      });
      await page.waitForTimeout(1500);

      // 스크롤 후 렌더링 요소 재확인
      const svgAfter = await iframe.locator("svg").count();
      const canvasAfter = await iframe.locator("canvas").count();
      const imgAfter = await iframe.locator("img").count();
      const stImageAfter = await iframe
        .locator('[data-testid="stImage"]')
        .count();
      logInfo(
        `  scroll[${scroll}]: SVG=${svgAfter}, Canvas=${canvasAfter}, img=${imgAfter}, stImage=${stImageAfter}`,
      );

      // 새로운 큰 SVG 확인
      for (let i = 0; i < svgAfter; i++) {
        const svg = iframe.locator("svg").nth(i);
        const viewBox = await svg.getAttribute("viewBox");
        if (
          viewBox &&
          !viewBox.includes("24 24") &&
          !viewBox.includes("512 512")
        ) {
          const lineCount = await svg.locator("line").count();
          const pathCount = await svg.locator("path").count();
          logInfo(
            `    새 SVG[${i}]: viewBox="${viewBox}" line=${lineCount} path=${pathCount}`,
          );
        }
      }

      // Plotly 재확인
      const plotlyAfter = await iframe.locator(".js-plotly-plot").count();
      if (plotlyAfter > 0) {
        logInfo(`    Plotly 차트: ${plotlyAfter}개`);
      }

      // stImage 상세
      if (stImageAfter > 0) {
        for (let i = 0; i < stImageAfter; i++) {
          const stImg = iframe.locator('[data-testid="stImage"]').nth(i);
          const innerImg = stImg.locator("img");
          if ((await innerImg.count()) > 0) {
            const src = await innerImg.first().getAttribute("src");
            const srcLen = src?.length ?? 0;
            logInfo(`    stImage[${i}]: src 길이=${srcLen}자`);
          }
        }
      }

      // 새 img 요소 상세
      if (imgAfter > imgCount) {
        for (let i = imgCount; i < imgAfter; i++) {
          const img = iframe.locator("img").nth(i);
          const src = await img.getAttribute("src");
          const srcLen = src?.length ?? 0;
          const style = await img.getAttribute("style");
          logInfo(
            `    새 img[${i}]: src길이=${srcLen}자, style="${style?.substring(0, 80)}"`,
          );
        }
      }
    }
  } catch (e) {
    logWarn(`스크롤 탐색 실패: ${e instanceof Error ? e.message : "unknown"}`);
  }

  // 13. 페이지 스크린샷 (스크롤 전/후)
  try {
    await page.screenshot({ path: "debug-action-maps.png", fullPage: true });
    logInfo("스크린샷 저장: debug-action-maps.png");
  } catch {
    logWarn("스크린샷 저장 실패");
  }

  // 14. iframe 스크린샷 (실제 콘텐츠)
  try {
    const iframeEl = page.frameLocator("iframe").owner();
    await iframeEl.screenshot({ path: "debug-action-maps-iframe.png" });
    logInfo("iframe 스크린샷 저장: debug-action-maps-iframe.png");
  } catch {
    logWarn("iframe 스크린샷 저장 실패");
  }

  // 10. innerText로 전체 텍스트 덤프
  try {
    const mainArea = iframe
      .locator('[data-testid="stAppViewContainer"]')
      .first();
    const text = await mainArea.innerText();
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    logInfo(`=== 전체 텍스트 (${lines.length}줄) ===`);
    for (const line of lines.slice(0, 80)) {
      console.log(`  ${line}`);
    }
    if (lines.length > 80) {
      logInfo(`  ... (${lines.length - 80}줄 생략)`);
    }
    logInfo("=== 텍스트 끝 ===");
  } catch {
    logWarn("전체 텍스트 추출 실패");
  }

  // Player Card 탭 복귀
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

  logInfo("=== Action Maps DOM 탐색 완료 ===");
}
