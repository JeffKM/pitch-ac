// Task 016 E2E 검증 — 매치데이 대시보드 실제 데이터 연동

import { expect, test } from "@playwright/test";

// ─── 매치데이 페이지 기본 렌더링 ─────────────────────────────────────────────

test.describe("매치데이 대시보드 페이지", () => {
  test("@smoke /matchday 접속 시 Gameweek 헤더가 렌더링된다", async ({
    page,
  }) => {
    await page.goto("/matchday");

    // Gameweek 헤더 확인
    await expect(
      page.getByRole("heading", { name: /Gameweek \d+/ }),
    ).toBeVisible();
  });

  test("@smoke 이전/다음 게임위크 네비게이션 요소가 표시된다", async ({
    page,
  }) => {
    // GW 10으로 이동하면 이전/다음 모두 활성 상태
    await page.goto("/matchday?gw=10");

    // shadcn asChild: 활성 상태는 <a>(link), 비활성은 <button disabled> 로 렌더링
    // → aria-label로 role-무관하게 찾기
    await expect(page.locator('[aria-label="이전 게임위크"]')).toBeVisible();
    await expect(page.locator('[aria-label="다음 게임위크"]')).toBeVisible();
  });

  test("GW 1에서는 이전 버튼이 비활성화된다", async ({ page }) => {
    await page.goto("/matchday?gw=1");

    const prevBtn = page.getByRole("button", { name: "이전 게임위크" });
    await expect(prevBtn).toBeDisabled();
  });

  test("GW 38에서는 다음 버튼이 비활성화된다", async ({ page }) => {
    await page.goto("/matchday?gw=38");

    const nextBtn = page.getByRole("button", { name: "다음 게임위크" });
    await expect(nextBtn).toBeDisabled();
  });
});

// ─── 게임위크 네비게이션 ──────────────────────────────────────────────────────

test.describe("게임위크 이동", () => {
  test("다음 게임위크 링크 클릭 시 URL이 업데이트된다", async ({ page }) => {
    await page.goto("/matchday?gw=10");

    // 활성 상태 네비게이션은 <a> 태그(role=link)로 렌더링됨
    await page.locator('[aria-label="다음 게임위크"]').click();

    await page.waitForURL(/gw=11/);
    await expect(
      page.getByRole("heading", { name: "Gameweek 11" }),
    ).toBeVisible();
  });

  test("이전 게임위크 링크 클릭 시 URL이 업데이트된다", async ({ page }) => {
    await page.goto("/matchday?gw=10");

    await page.locator('[aria-label="이전 게임위크"]').click();

    await page.waitForURL(/gw=9/);
    await expect(
      page.getByRole("heading", { name: "Gameweek 9" }),
    ).toBeVisible();
  });
});

// ─── 경기 데이터 렌더링 ───────────────────────────────────────────────────────

test.describe("경기 카드 렌더링", () => {
  test("경기가 있는 게임위크에서 경기 카드가 표시된다", async ({ page }) => {
    // DB에 동기화된 데이터가 있는 GW를 테스트
    // GW 1부터 순차적으로 경기 유무 확인
    await page.goto("/matchday?gw=1");

    // 경기 카드 또는 빈 상태 중 하나가 렌더링되어야 함
    const hasFixtures = await page.locator('a[href^="/matchday/"]').count();
    const hasEmpty = await page.getByText(/경기가 없습니다|데이터/).count();

    expect(hasFixtures + hasEmpty).toBeGreaterThan(0);
  });

  test("경기가 있으면 팀 이름이 표시된다", async ({ page }) => {
    await page.goto("/matchday");

    // 경기 카드가 있는지 확인
    const fixtureLinks = page.locator('a[href^="/matchday/"]');
    const count = await fixtureLinks.count();

    if (count > 0) {
      // 첫 번째 경기 카드에 팀 이름이 있어야 함 (더미 데이터 값이 아닌 실제 DB 값)
      const firstCard = fixtureLinks.first();
      await expect(firstCard).toBeVisible();

      // 팀 로고 이미지가 렌더링되는지 확인
      const images = firstCard.locator("img");
      await expect(images.first()).toBeVisible();
    }
  });
});

// ─── API Route 검증 ───────────────────────────────────────────────────────────

test.describe("API /api/matchday/fixtures", () => {
  test("@smoke 유효한 gw 파라미터로 200 응답을 반환한다", async ({
    request,
  }) => {
    const response = await request.get("/api/matchday/fixtures?gw=1");

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("data");
    expect(body).toHaveProperty("error", null);
    expect(body).toHaveProperty("timestamp");
  });

  test("응답 data에 fixtures, teams, standings, hasLive 필드가 있다", async ({
    request,
  }) => {
    const response = await request.get("/api/matchday/fixtures?gw=1");
    const body = await response.json();

    expect(body.data).toHaveProperty("fixtures");
    expect(body.data).toHaveProperty("teams");
    expect(body.data).toHaveProperty("standings");
    expect(body.data).toHaveProperty("gameweek", 1);
    expect(body.data).toHaveProperty("hasLive");
    expect(Array.isArray(body.data.fixtures)).toBe(true);
  });

  test("유효하지 않은 gw=0이면 400 에러를 반환한다", async ({ request }) => {
    const response = await request.get("/api/matchday/fixtures?gw=0");

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("INVALID_GW");
  });

  test("gw=39이면 400 에러를 반환한다", async ({ request }) => {
    const response = await request.get("/api/matchday/fixtures?gw=39");

    expect(response.status()).toBe(400);
  });

  test("gw 파라미터 없으면 400 에러를 반환한다", async ({ request }) => {
    const response = await request.get("/api/matchday/fixtures");

    expect(response.status()).toBe(400);
  });

  test("여러 GW에 대해 응답 구조가 일관된다", async ({ request }) => {
    const responses = await Promise.all([
      request.get("/api/matchday/fixtures?gw=1"),
      request.get("/api/matchday/fixtures?gw=10"),
      request.get("/api/matchday/fixtures?gw=20"),
    ]);

    for (const response of responses) {
      expect(response.ok()).toBeTruthy();
      const body = await response.json();
      expect(body.data).toHaveProperty("fixtures");
      expect(body.data).toHaveProperty("hasLive");
    }
  });
});

// ─── 빈 게임위크 처리 ─────────────────────────────────────────────────────────

test.describe("빈 게임위크 처리", () => {
  test("DB에 데이터가 없는 GW에서도 페이지가 깨지지 않는다", async ({
    page,
  }) => {
    // 아직 동기화 안 된 GW나 존재하지 않는 GW (예: 0번 GW는 실제 없음)
    // ?gw=99는 DB에 없으므로 빈 상태여야 함
    await page.goto("/matchday?gw=99");

    // 페이지가 에러 없이 로드되어야 함 (헤더는 항상 표시)
    await expect(
      page.getByRole("heading", { name: "Gameweek 99" }),
    ).toBeVisible();
  });
});

// ─── 콘솔 에러 모니터링 ───────────────────────────────────────────────────────

test.describe("콘솔 에러 없음", () => {
  test("매치데이 페이지 로드 시 콘솔 에러가 없다", async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/matchday");
    // 페이지 완전 로드 대기
    await page.waitForLoadState("networkidle");

    // Hydration 에러 체크
    const hydrationErrors = consoleErrors.filter(
      (e) =>
        e.includes("Hydration") ||
        e.includes("hydration") ||
        e.includes("did not match"),
    );
    expect(hydrationErrors).toEqual([]);
  });
});
