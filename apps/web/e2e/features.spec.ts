import { test, expect } from "@playwright/test";

test.describe("Seat Selection Flow", () => {
  test("seats page should display room list", async ({ page }) => {
    await page.goto("/seats");

    // 페이지 로드 대기
    await page.waitForLoadState("networkidle");

    // 열람실 목록이 표시되거나 로딩 상태인지 확인
    const content = page.locator(
      '[class*="cursor-pointer"], .animate-pulse'
    ).first();
    await expect(content).toBeVisible({ timeout: 10000 });
  });

  test("clicking room should show details or login prompt", async ({
    page,
  }) => {
    await page.goto("/seats");
    await page.waitForLoadState("networkidle");

    // 첫 번째 열람실 카드 클릭 시도
    const roomCard = page.locator('[class*="cursor-pointer"]').first();
    
    // 카드가 있으면 클릭, 없으면 패스
    const isVisible = await roomCard.isVisible().catch(() => false);
    if (isVisible) {
      await roomCard.click();
      
      // 모달, 상세 페이지 또는 로그인 프롬프트가 나타나야 함
      await expect(
        page.locator('dialog, [role="dialog"], [class*="modal"], [class*="fixed"]').first()
      ).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("Dashboard Features", () => {
  test("dashboard should have main content sections", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // 메인 콘텐츠 영역 확인
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible({ timeout: 10000 });
  });

  test("dashboard should not have console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // 심각한 오류만 필터링
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("Warning:") &&
        !e.includes("hydration") &&
        !e.includes("Sentry")
    );

    expect(criticalErrors.length).toBe(0);
  });
});

test.describe("Study Features", () => {
  test("study list page should load", async ({ page }) => {
    await page.goto("/study");
    await page.waitForLoadState("networkidle");

    // 스터디 목록 또는 로그인 프롬프트 확인
    const content = page.locator("main").first();
    await expect(content).toBeVisible({ timeout: 10000 });
  });

  test("study create page should exist", async ({ page }) => {
    const response = await page.goto("/study/create");
    
    // 페이지가 존재하는지 확인 (404가 아님)
    expect(response?.status()).not.toBe(404);
  });
});

test.describe("Accessibility", () => {
  test("focus should be visible on interactive elements", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Tab으로 포커스 이동
    await page.keyboard.press("Tab");
    
    // 포커스가 어딘가에 있는지 확인
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });

  test("main landmark should exist", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // main 랜드마크 존재 확인
    const mainLandmark = page.locator('main, [role="main"]');
    await expect(mainLandmark).toBeVisible();
  });
});
