import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to home page', async ({ page }) => {
    await page.goto('/');
    
    // 홈 페이지가 로드되었는지 확인
    await expect(page).toHaveTitle(/PNU|Blace/i);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/login');
    
    // 로그인 페이지가 로드되었는지 확인 (페이지 자체가 존재)
    await expect(page).toHaveURL(/login/);
  });

  test('should navigate to rankings page', async ({ page }) => {
    await page.goto('/rankings');
    
    // 랭킹 페이지가 로드되었는지 확인
    await expect(page).toHaveURL(/rankings/);
  });

  test('should navigate to seats page', async ({ page }) => {
    await page.goto('/seats');
    
    // 좌석 페이지가 로드되었는지 확인
    await expect(page).toHaveURL(/seats/);
  });
});

test.describe('Responsive Design', () => {
  test('header should be visible on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    
    // 헤더 확인
    await expect(page.locator('header')).toBeVisible();
  });

  test('header should be visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // 모바일에서도 헤더 표시
    await expect(page.locator('header')).toBeVisible();
  });
});

test.describe('Theme Toggle', () => {
  test('theme toggle button should exist', async ({ page }) => {
    await page.goto('/');
    
    // 테마 토글 버튼 존재 확인
    const themeButton = page.locator('button[aria-label*="테마"], button[aria-label*="Theme"]');
    await expect(themeButton.first()).toBeVisible();
  });
});

test.describe('Page Loading', () => {
  test('dashboard page should load skeleton first', async ({ page }) => {
    await page.goto('/dashboard');
    
    // 페이지가 로드되었는지 확인 (스켈레톤 또는 실제 콘텐츠)
    const content = page.locator('main, [role="main"], .animate-pulse').first();
    await expect(content).toBeVisible({ timeout: 10000 });
  });

  test('stats page should load without errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/stats');
    
    // 심각한 에러 없이 페이지 로드
    await page.waitForLoadState('networkidle');
    
    // React/Next.js 관련 경고는 무시하고 심각한 에러만 체크
    const criticalErrors = consoleErrors.filter(
      (err) => !err.includes('Warning:') && !err.includes('hydration')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});
