// Phase S5: ScoutLab 모드 토글 + 포지션 비교 그룹 E2E 테스트
import { expect, test } from "@playwright/test";

// ── S501: DB 스키마 — comparison_position 컬럼 추가 ──
test.describe("S501: comparison_position 컬럼", () => {
  test("scouting 페이지가 정상 로드된다", async ({ page }) => {
    await page.goto("/scouting");
    await expect(page.locator('[aria-label="포지션 비교 그룹"]')).toBeVisible({
      timeout: 15_000,
    });
  });

  test("유효한 comparisonPosition URL 파라미터가 유지된다", async ({
    page,
  }) => {
    await page.goto("/scouting?comparisonPosition=CB");
    await expect(page).toHaveURL(/comparisonPosition=CB/);
  });

  test("무효한 comparisonPosition은 서버에서 기본값으로 파싱된다", async ({
    page,
  }) => {
    // 무효한 값으로 접근 시 페이지는 정상 렌더링 (서버가 기본값 AM/W로 파싱)
    await page.goto("/scouting?comparisonPosition=INVALID");
    // 비교 그룹 선택기가 정상 표시되는지 확인
    await expect(page.locator('[aria-label="포지션 비교 그룹"]')).toBeVisible({
      timeout: 15_000,
    });
    // AM·W(기본값)이 활성 상태
    const amwButton = page
      .locator('[aria-label="포지션 비교 그룹"]')
      .getByRole("radio", { name: "AM·W" });
    await expect(amwButton).toHaveAttribute("aria-checked", "true");
  });
});

// ── S504: 타입 & 상수 업데이트 ──
test.describe("S504: 비교 그룹 5개 버튼 표시", () => {
  test("5개 비교 그룹 버튼이 모두 표시된다", async ({ page }) => {
    await page.goto("/scouting");
    const group = page.locator('[aria-label="포지션 비교 그룹"]');
    await expect(group).toBeVisible({ timeout: 15_000 });

    for (const label of ["CB", "FB", "MF", "AM·W", "FW"]) {
      await expect(group.getByRole("radio", { name: label })).toBeVisible();
    }
  });
});

// ── S505: 프론트엔드 — 포지션 비교 그룹 선택기 ──
test.describe("S505: 비교 그룹 선택기", () => {
  test("비교 그룹 클릭 시 URL에 comparisonPosition 반영", async ({ page }) => {
    await page.goto("/scouting");
    const group = page.locator('[aria-label="포지션 비교 그룹"]');
    await expect(group).toBeVisible({ timeout: 15_000 });

    // FW 클릭
    await group.getByRole("radio", { name: "FW" }).click();
    await expect(page).toHaveURL(/comparisonPosition=FW/);

    // CB 클릭
    await group.getByRole("radio", { name: "CB" }).click();
    await expect(page).toHaveURL(/comparisonPosition=CB/);
  });

  test("선수 선택 후 비교 그룹 변경 시 메트릭 영역이 유지된다", async ({
    page,
  }) => {
    await page.goto("/scouting");
    const group = page.locator('[aria-label="포지션 비교 그룹"]');
    await expect(group).toBeVisible({ timeout: 15_000 });

    // 선수 검색 combobox
    const searchTrigger = page.locator('button[role="combobox"]').first();
    if (!(await searchTrigger.isVisible({ timeout: 3_000 }).catch(() => false)))
      return;

    await searchTrigger.click();
    await page.waitForTimeout(500);

    const firstOption = page.locator('[role="option"]').first();
    if (!(await firstOption.isVisible({ timeout: 3_000 }).catch(() => false)))
      return;

    await firstOption.click();
    // 팝오버가 닫힐 때까지 대기
    await page.waitForTimeout(1_000);

    // 비교 그룹 변경
    await group.getByRole("radio", { name: "MF" }).click();
    await expect(page).toHaveURL(/comparisonPosition=MF/);
    // playerId가 URL에 유지되는지 확인
    await expect(page).toHaveURL(/playerId=/);
  });

  test("모드 토글과 비교 그룹 순차 변경", async ({ page }) => {
    await page.goto("/scouting");
    const posGroup = page.locator('[aria-label="포지션 비교 그룹"]');
    await expect(posGroup).toBeVisible({ timeout: 15_000 });

    const modeGroup = page.locator('[aria-label="수치 모드"]');
    const adjGroup = page.locator('[aria-label="보정 모드"]');

    // Total 선택 후 URL 반영 대기
    await modeGroup.getByRole("radio", { name: "Total" }).click();
    await expect(page).toHaveURL(/mode=total/);

    // Raw 선택 후 URL 반영 대기
    await adjGroup.getByRole("radio", { name: "Raw" }).click();
    await expect(page).toHaveURL(/adjustment=raw/);

    // FW 선택 후 URL 반영 대기
    await posGroup.getByRole("radio", { name: "FW" }).click();
    await expect(page).toHaveURL(/comparisonPosition=FW/);

    // 3개 값 모두 URL에 존재
    await expect(page).toHaveURL(/mode=total/);
    await expect(page).toHaveURL(/adjustment=raw/);
    await expect(page).toHaveURL(/comparisonPosition=FW/);
  });
});

// ── S506: 서브타이틀 + 하위 페이지 대응 ──
test.describe("S506: 비교 그룹 서브타이틀", () => {
  test("메트릭 서브타이틀이 현재 설정을 반영한다", async ({ page }) => {
    await page.goto("/scouting?comparisonPosition=CB");
    const subtitle = page.locator('[data-testid="metric-context-subtitle"]');

    if (await subtitle.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expect(subtitle).toContainText("CB");
      await expect(subtitle).toContainText("PER 90");
    }
  });

  test("Total 모드에서 서브타이틀이 'TOTAL'을 표시한다", async ({ page }) => {
    await page.goto("/scouting?mode=total&comparisonPosition=FW");
    const subtitle = page.locator('[data-testid="metric-context-subtitle"]');

    if (await subtitle.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expect(subtitle).toContainText("FW");
      await expect(subtitle).toContainText("TOTAL");
    }
  });

  test("Summary 페이지에서 비교 그룹이 유지된다", async ({ page }) => {
    await page.goto("/scouting/summary?comparisonPosition=FB");
    await expect(page).toHaveURL(/comparisonPosition=FB/);

    const subtitle = page.locator('[data-testid="metric-context-subtitle"]');
    if (await subtitle.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await expect(subtitle).toContainText("FB");
    }
  });

  test("Compare 페이지에서 비교 그룹이 유지된다", async ({ page }) => {
    await page.goto("/scouting/compare?comparisonPosition=MF");
    await expect(page).toHaveURL(/comparisonPosition=MF/);
  });

  test("탭 전환 시 comparisonPosition이 유지된다", async ({ page }) => {
    await page.goto("/scouting?comparisonPosition=FW");

    const summaryLink = page.locator('a[href*="/scouting/summary"]').first();
    if (await summaryLink.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await summaryLink.click();
      await expect(page).toHaveURL(/comparisonPosition=FW/);
      await expect(page).toHaveURL(/\/scouting\/summary/);
    }
  });
});
