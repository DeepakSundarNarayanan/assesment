import { test, expect } from '@playwright/test';

test.describe('Work Order Timeline', () => {

  test.beforeEach(async ({ page }) => {
    // Clear localStorage so each test starts with seed data only
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('.bg-cell');
  });

  /**
   * Helper: click a bg-cell directly (bypasses browser hit-testing so bars don't intercept).
   * Index 12 = Sep 2026 (no prepend) or May 2026 (after scrollToToday prepends 4 cols) —
   * safely beyond all seed work order bars in both cases.
   */
  async function clickEmptyCell(page: any, rowIndex: number, cellIndex = 12) {
    await page.locator('.grid-row').nth(rowIndex).locator('.bg-cell').nth(cellIndex)
      .dispatchEvent('click');
  }

  test('creates a work order and deletes it', async ({ page }) => {
    const workOrderName = 'Playwright Test Order';

    // ── STEP 1: Open create panel on the last row (Spartan Manufacturing)
    await clickEmptyCell(page, -1);
    await expect(page.locator('.panel')).toBeVisible();

    // ── STEP 2: Fill in the work order name
    await page.locator('.form-input[placeholder="Acme Inc."]').fill(workOrderName);

    // ── STEP 3: Dates should be pre-filled from the click
    await expect(page.locator('.date-input').nth(0)).not.toHaveValue('');
    await expect(page.locator('.date-input').nth(1)).not.toHaveValue('');

    // ── STEP 4: Submit — wait for panel animation to finish before clicking
    await page.locator('.panel').waitFor({ state: 'visible' });
    await page.locator('.btn-save').click();

    // Panel closes after 250ms slide-out animation + Angular re-render
    await page.locator('.panel').waitFor({ state: 'detached', timeout: 5000 });

    // ── STEP 5: Bar appears on timeline
    const newBar = page.locator('.work-order-bar', { hasText: workOrderName });
    await expect(newBar).toBeVisible();

    // ── STEP 6: Hover → three-dot menu appears
    await newBar.hover();
    await expect(newBar.locator('.menu-btn')).toBeVisible();

    // ── STEP 7: Open dropdown and delete
    await newBar.locator('.menu-btn').click();
    await expect(page.locator('.bar-menu')).toBeVisible();
    await page.locator('.bar-menu-item.delete').click();

    // ── STEP 8: Bar is gone
    await expect(newBar).not.toBeVisible();
  });

  test('shows error when end date is before start date', async ({ page }) => {
    // Open panel
    await clickEmptyCell(page, -1);
    await expect(page.locator('.panel')).toBeVisible();

    await page.locator('.form-input[placeholder="Acme Inc."]').fill('Date Test Order');

    // Open end date picker (first calendar button = end date in the form)
    await page.locator('.calendar-toggle-btn').nth(0).click();
    await expect(page.locator('.inline-picker').first()).toBeVisible();

    // Go to previous month and pick the 1st day — sets end date before start date
    await page.locator('.ngb-dp-arrow-btn').first().click();
    await page.locator('.ngb-dp-day:not(.disabled) .btn-light').first().click();

    // Submit to trigger validation
    await page.locator('.btn-save').click();

    await expect(page.locator('text=End date must be after start date')).toBeVisible();

    // Clean up
    await page.locator('.btn-cancel').click();
  });

  test('shows overlap error when work orders conflict', async ({ page }) => {
    // ── Create first work order at cell 10 on last row
    await clickEmptyCell(page, -1, 12);
    await expect(page.locator('.panel')).toBeVisible();
    await page.locator('.form-input[placeholder="Acme Inc."]').fill('Overlap Order A');
    await page.locator('.btn-save').click();
    await page.locator('.panel').waitFor({ state: 'detached', timeout: 5000 });

    // ── Try to create a second order on the exact same cell → same date → overlaps
    await clickEmptyCell(page, -1, 12);
    await expect(page.locator('.panel')).toBeVisible();
    await page.locator('.form-input[placeholder="Acme Inc."]').fill('Overlap Order B');
    await page.locator('.btn-save').click();

    await expect(page.locator('text=This work order overlaps')).toBeVisible();

    // Cancel Order B
    await page.locator('.btn-cancel').click();

    // Delete Order A to clean up
    const orderA = page.locator('.work-order-bar', { hasText: 'Overlap Order A' });
    await orderA.hover();
    await orderA.locator('.menu-btn').click();
    await page.locator('.bar-menu-item.delete').click();
    await expect(orderA).not.toBeVisible();
  });

});
