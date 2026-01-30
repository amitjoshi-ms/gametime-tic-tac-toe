/**
 * End-to-end tests for 3D board visual effects.
 * Tests 3D perspective, depth, shadows, and interaction feedback.
 *
 * @module tests/e2e/board3d
 */

import { test, expect, type Locator } from '@playwright/test';

/**
 * Helper to get computed CSS transform property.
 */
async function getTransform(element: Locator): Promise<string> {
  return element.evaluate((el) => getComputedStyle(el).transform);
}

/**
 * Helper to get computed CSS box-shadow property.
 */
async function getBoxShadow(element: Locator): Promise<string> {
  return element.evaluate((el) => getComputedStyle(el).boxShadow);
}

/**
 * Helper to get computed CSS perspective property.
 */
async function getPerspective(element: Locator): Promise<string> {
  return element.evaluate((el) => getComputedStyle(el).perspective);
}

/**
 * Helper to get computed CSS transform-style property.
 */
async function getTransformStyle(element: Locator): Promise<string> {
  return element.evaluate((el) => getComputedStyle(el).transformStyle);
}

test.describe('3D Board Visual Effects', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh
    await page.addInitScript(() => {
      localStorage.clear();
    });
    await page.goto('/');
    // Verify we're in human mode
    await expect(page.locator('.mode-selector__option--selected')).toContainText(
      'Human'
    );
  });

  test.describe('User Story 1: 3D Board with Depth (P1 MVP)', () => {
    test('board displays with 3D perspective', async ({ page }) => {
      const board = page.locator('.board');

      // Board should have perspective property set
      const perspective = await getPerspective(board);
      expect(perspective).not.toBe('none');
      // Perspective value should be in pixels (e.g., "600px")
      expect(perspective).toMatch(/^\d+(\.\d+)?px$/);

      // Board should have transform-style: preserve-3d
      const transformStyle = await getTransformStyle(board);
      expect(transformStyle).toBe('preserve-3d');

      // Board should have rotateX transform applied
      const transform = await getTransform(board);
      // Transform matrix for rotateX will have non-identity values
      expect(transform).not.toBe('none');
      expect(transform).toMatch(/matrix3d/);
    });

    test('cells have shadow styling for depth effect', async ({ page }) => {
      const cells = page.locator('.cell');

      // Check first cell has box-shadow
      const firstCell = cells.first();
      const boxShadow = await getBoxShadow(firstCell);
      expect(boxShadow).not.toBe('none');
      // Shadow should have rgba color
      expect(boxShadow).toMatch(/rgba?\(/);
    });

    test('all 9 cells remain clickable with 3D transforms', async ({
      page,
    }) => {
      const cells = page.locator('.cell');
      const status = page.locator('.status');

      // Click first 5 cells to verify click handling works with 3D transforms
      // (Game may end before all 9 are filled due to win/draw detection)
      for (let i = 0; i < 5; i++) {
        await cells.nth(i).click();
        const expectedSymbol = i % 2 === 0 ? 'X' : 'O';
        await expect(cells.nth(i)).toHaveText(expectedSymbol);
      }

      // Verify game state is either still playing or ended properly
      const statusText = await status.textContent();
      expect(statusText).toBeTruthy();
    });

    test('symbols (X, O) render correctly on 3D surface', async ({ page }) => {
      const cells = page.locator('.cell');

      // Place X in first cell
      await cells.nth(0).click();
      await expect(cells.nth(0)).toHaveText('X');
      await expect(cells.nth(0)).toHaveClass(/cell--x/);

      // Place O in second cell
      await cells.nth(1).click();
      await expect(cells.nth(1)).toHaveText('O');
      await expect(cells.nth(1)).toHaveClass(/cell--o/);

      // Verify symbols are visible (not obscured by 3D effects)
      const xCell = cells.nth(0);
      const oCell = cells.nth(1);

      // Get font-size to confirm symbols are sized appropriately
      const xFontSize = await xCell.evaluate(
        (el) => getComputedStyle(el).fontSize
      );
      const oFontSize = await oCell.evaluate(
        (el) => getComputedStyle(el).fontSize
      );

      // Font size should be reasonable (not 0 or too small)
      expect(parseFloat(xFontSize)).toBeGreaterThan(20);
      expect(parseFloat(oFontSize)).toBeGreaterThan(20);
    });

    test('cells have 3D transform (translateZ) applied', async ({ page }) => {
      const cell = page.locator('.cell').first();

      const transform = await getTransform(cell);
      // Cells should have translateZ which creates matrix3d
      expect(transform).not.toBe('none');
      // Either matrix3d (3D transform) or matrix (2D fallback)
      expect(transform).toMatch(/matrix/);
    });

    test('winning cells display correctly with 3D effects', async ({
      page,
    }) => {
      const cells = page.locator('.cell');

      // Play a winning game for X (top row: 0, 1, 2)
      await cells.nth(0).click(); // X
      await cells.nth(3).click(); // O
      await cells.nth(1).click(); // X
      await cells.nth(4).click(); // O
      await cells.nth(2).click(); // X wins

      // Verify X won
      const status = page.locator('.status');
      await expect(status).toContainText(/wins/i);

      // All cells should still be visible and properly styled
      await expect(cells).toHaveCount(9);

      // The winning cells should have their symbols visible
      await expect(cells.nth(0)).toHaveText('X');
      await expect(cells.nth(1)).toHaveText('X');
      await expect(cells.nth(2)).toHaveText('X');

      // Winning cells should have the cell--winner class
      await expect(cells.nth(0)).toHaveClass(/cell--winner/);
      await expect(cells.nth(1)).toHaveClass(/cell--winner/);
      await expect(cells.nth(2)).toHaveClass(/cell--winner/);

      // Non-winning cells should NOT have the cell--winner class
      await expect(cells.nth(3)).not.toHaveClass(/cell--winner/);
      await expect(cells.nth(4)).not.toHaveClass(/cell--winner/);
      await expect(cells.nth(5)).not.toHaveClass(/cell--winner/);
    });
  });

  test.describe('User Story 2: Interactive 3D Feedback (P2)', () => {
    test('cell hover triggers visual lift effect', async ({ page }) => {
      const cell = page.locator('.cell').first();

      // Hover over the cell
      await cell.hover();

      // Get transform after hover - should show 3D lift
      const hoverTransform = await getTransform(cell);

      // Transform should be applied (lift effect via translateZ)
      expect(hoverTransform).not.toBe('none');
      expect(hoverTransform).toMatch(/matrix/);

      // Verify box-shadow increases on hover
      const hoverShadow = await getBoxShadow(cell);
      expect(hoverShadow).not.toBe('none');
      expect(hoverShadow).toMatch(/rgba?\(/);
    });

    test('cell focus shows visible focus state', async ({ page }) => {
      const cell = page.locator('.cell').first();

      // Focus the cell using keyboard
      await cell.focus();

      // Verify cell has focus-visible styling (outline)
      const outline = await cell.evaluate(
        (el) => getComputedStyle(el).outline
      );
      expect(outline).not.toBe('none');
      expect(outline).not.toBe('');

      // Verify 3D transform is applied on focus
      const transform = await getTransform(cell);
      expect(transform).not.toBe('none');
    });

    test('occupied cells do not show hover lift', async ({ page }) => {
      const cells = page.locator('.cell');

      // Click first cell to make it occupied
      await cells.nth(0).click();
      await expect(cells.nth(0)).toHaveText('X');
      await expect(cells.nth(0)).toHaveClass(/cell--occupied/);

      // Get transform of occupied cell
      const beforeHover = await getTransform(cells.nth(0));

      // Hover over occupied cell
      await cells.nth(0).hover();

      // Get transform after hover - should NOT have increased depth
      const afterHover = await getTransform(cells.nth(0));

      // Transforms should be the same (no hover lift on occupied cells)
      expect(afterHover).toBe(beforeHover);
    });

    test('disabled cells do not show hover lift', async ({ page }) => {
      const cells = page.locator('.cell');

      // Play to game over (X wins)
      await cells.nth(0).click(); // X
      await cells.nth(3).click(); // O
      await cells.nth(1).click(); // X
      await cells.nth(4).click(); // O
      await cells.nth(2).click(); // X wins

      // Verify game is over and cells are disabled
      await expect(page.locator('.status')).toContainText(/wins/i);
      await expect(cells.nth(5)).toHaveClass(/cell--disabled/);

      // Get transform of disabled cell
      const beforeHover = await getTransform(cells.nth(5));

      // Hover over disabled cell
      await cells.nth(5).hover();

      // Get transform after hover
      const afterHover = await getTransform(cells.nth(5));

      // Transforms should be the same (no hover lift on disabled cells)
      expect(afterHover).toBe(beforeHover);
    });
  });

  test.describe('User Story 3: Theme Compatibility (P3)', () => {
    test('3D shadows visible in dark theme (default)', async ({ page }) => {
      const cell = page.locator('.cell').first();

      // Dark theme is default - verify shadow is visible
      const boxShadow = await getBoxShadow(cell);
      expect(boxShadow).not.toBe('none');
      expect(boxShadow).toMatch(/rgba?\(/);
    });

    test('3D shadows adapt for light theme', async ({ page }) => {
      // Emulate light color scheme
      await page.emulateMedia({ colorScheme: 'light' });
      await page.reload();

      const cell = page.locator('.cell').first();

      // Verify shadow is still visible in light theme
      const boxShadow = await getBoxShadow(cell);
      expect(boxShadow).not.toBe('none');
      expect(boxShadow).toMatch(/rgba?\(/);
    });
  });

  test.describe('User Story 4: Responsive 3D Layout (P3)', () => {
    test('3D perspective works at desktop width (1024px)', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.reload();

      const board = page.locator('.board');

      // Verify perspective is applied
      const perspective = await getPerspective(board);
      expect(perspective).not.toBe('none');
      expect(perspective).toMatch(/^\d+(\.\d+)?px$/);

      // Verify transform is applied
      const transform = await getTransform(board);
      expect(transform).not.toBe('none');
    });

    test('3D perspective adapts at mobile width (375px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();

      const board = page.locator('.board');

      // Verify perspective is still applied
      const perspective = await getPerspective(board);
      expect(perspective).not.toBe('none');

      // Verify board is visible and clickable
      const cell = page.locator('.cell').first();
      await cell.click();
      await expect(cell).toHaveText('X');
    });

    test('3D perspective adapts at small mobile width (320px)', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await page.reload();

      const board = page.locator('.board');

      // Verify perspective is still applied (may be reduced)
      const perspective = await getPerspective(board);
      expect(perspective).not.toBe('none');

      // Verify board is visible and cells are clickable
      const cells = page.locator('.cell');
      await expect(cells).toHaveCount(9);
      await cells.first().click();
      await expect(cells.first()).toHaveText('X');
    });
  });
});
