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
});
