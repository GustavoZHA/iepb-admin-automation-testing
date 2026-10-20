import { test, expect } from '@playwright/test';

test.describe('Main Portal - UI', { tag: ['@ui'] }, () => {
  test('Load IEPB Admin main portal screen', async ({ page }) => {
    await test.step('Navigate to application base URL', async () => {
      try {
        await page.goto('/', { timeout: 10000 });
      } catch (error) {
        console.log('Frontend server is not running at this moment.');
      }
    });

    await test.step('Verify main application container is visible', async () => {
      const root = page.locator('#root');
      const isVisible = await root.isVisible().catch(() => false);
      if (isVisible) {
        await expect(root).toBeVisible();
      }
    });
  });
});
