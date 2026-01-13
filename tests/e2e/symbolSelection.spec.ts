/**
 * E2E tests for custom symbol selection feature.
 * Tests symbol selection UI, validation, persistence, and gameplay.
 */

import { test, expect } from '@playwright/test';

test.describe('Symbol Selection Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display symbol selectors for both players', async ({ page }) => {
    // Check that symbol selectors are present
    const xSelector = page.getByLabel('Symbol for Player X');
    const oSelector = page.getByLabel('Symbol for Player O');

    await expect(xSelector).toBeVisible();
    await expect(oSelector).toBeVisible();

    // Check default selections
    await expect(xSelector).toHaveValue('X');
    await expect(oSelector).toHaveValue('O');
  });

  test('should have at least 12 symbol options', async ({ page }) => {
    const xSelector = page.getByLabel('Symbol for Player X');
    const options = await xSelector.locator('option').count();

    expect(options).toBeGreaterThanOrEqual(12);
  });

  test('should disable the other players symbol in dropdown', async ({ page }) => {
    const xSelector = page.getByLabel('Symbol for Player X');
    const oSelector = page.getByLabel('Symbol for Player O');

    // Check that O is disabled in X's selector
    const oOptionInX = xSelector.locator('option[value="O"]');
    await expect(oOptionInX).toBeDisabled();
    await expect(oOptionInX).toContainText('in use');

    // Check that X is disabled in O's selector
    const xOptionInO = oSelector.locator('option[value="X"]');
    await expect(xOptionInO).toBeDisabled();
    await expect(xOptionInO).toContainText('in use');
  });

  test('should update player symbol when selection changes', async ({ page }) => {
    const xSelector = page.getByLabel('Symbol for Player X');

    // Change X's symbol to star
    await xSelector.selectOption('★');

    // Check that the label updated
    const xLabel = page.locator('.player-name-label--x .player-mark');
    await expect(xLabel).toHaveText('★');

    // Check that status message updated
    const status = page.locator('.status');
    await expect(status).toContainText('★');
  });

  test('should prevent both players from having the same symbol', async ({ page }) => {
    const xSelector = page.getByLabel('Symbol for Player X');
    const oSelector = page.getByLabel('Symbol for Player O');

    // Change X to circle
    await xSelector.selectOption('●');

    // Check that circle is now disabled in O's selector
    const circleOptionInO = oSelector.locator('option[value="●"]');
    await expect(circleOptionInO).toBeDisabled();

    // Change O to square
    await oSelector.selectOption('■');

    // Check that square is now disabled in X's selector
    const squareOptionInX = xSelector.locator('option[value="■"]');
    await expect(squareOptionInX).toBeDisabled();
  });

  test('should display custom symbols on the game board', async ({ page }) => {
    const xSelector = page.getByLabel('Symbol for Player X');
    const oSelector = page.getByLabel('Symbol for Player O');

    // Select custom symbols
    await xSelector.selectOption('★');
    await oSelector.selectOption('🔵');

    // Play a few moves
    await page.getByRole('button', { name: 'Cell 1' }).click();
    await page.getByRole('button', { name: 'Cell 2' }).click();
    await page.getByRole('button', { name: 'Cell 3' }).click();

    // Check that custom symbols are displayed on the board
    await expect(page.getByRole('button', { name: 'Cell 1: ★' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cell 2: 🔵' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cell 3: ★' })).toBeVisible();
  });

  test('should show winner with custom symbol', async ({ page }) => {
    const xSelector = page.getByLabel('Symbol for Player X');
    const oSelector = page.getByLabel('Symbol for Player O');

    // Select custom symbols
    await xSelector.selectOption('⭐');
    await oSelector.selectOption('🌙');

    // Play a winning game for X (top row)
    await page.getByRole('button', { name: 'Cell 1' }).click(); // X
    await page.getByRole('button', { name: 'Cell 4' }).click(); // O
    await page.getByRole('button', { name: 'Cell 2' }).click(); // X
    await page.getByRole('button', { name: 'Cell 5' }).click(); // O
    await page.getByRole('button', { name: 'Cell 3' }).click(); // X wins

    // Check win message includes custom symbol
    const status = page.locator('.status');
    await expect(status).toContainText('Player X (⭐) Wins!');
  });

  test('should persist symbol selection across page refresh', async ({
    page,
  }) => {
    const xSelector = page.getByLabel('Symbol for Player X');
    const oSelector = page.getByLabel('Symbol for Player O');

    // Select custom symbols
    await xSelector.selectOption('◆');
    await oSelector.selectOption('▲');

    // Reload the page
    await page.reload();

    // Wait for the page to load
    await page.waitForSelector('.symbol-selector');

    // Check that symbols are still selected
    await expect(xSelector).toHaveValue('◆');
    await expect(oSelector).toHaveValue('▲');
  });

  test('should work with computer mode', async ({ page }) => {
    const xSelector = page.getByLabel('Symbol for Player X');

    // Switch to computer mode by clicking the computer radio button
    await page.getByRole('radio', { name: 'Play against Computer' }).click();

    // Select custom symbol for X
    await xSelector.selectOption('💎');

    // Wait for computer name to update
    await page.waitForTimeout(100);

    // Get O selector after mode change
    const oSelector = page.getByLabel('Symbol for Player O');

    // Select custom symbol for O (computer)
    await oSelector.selectOption('🔥');

    // Make a move
    await page.getByRole('button', { name: 'Cell 1' }).click();

    // Check that X's symbol appears
    await expect(page.getByRole('button', { name: /Cell 1.*💎/ })).toBeVisible();

    // Wait for computer to make a move (with thinking delay)
    await page.waitForTimeout(2500);

    // Check that at least one more cell has the computer's symbol
    const cells = page.locator('.cell--occupied');
    const count = await cells.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('should maintain symbols after new game', async ({ page }) => {
    const xSelector = page.getByLabel('Symbol for Player X');
    const oSelector = page.getByLabel('Symbol for Player O');

    // Select custom symbols
    await xSelector.selectOption('☀️');
    await oSelector.selectOption('🌙');

    // Play a move
    await page.getByRole('button', { name: 'Cell 1' }).click();

    // Start new game
    await page.getByRole('button', { name: /new game/i }).click();

    // Check that symbols are still selected
    await expect(xSelector).toHaveValue('☀️');
    await expect(oSelector).toHaveValue('🌙');

    // Play a move to verify symbols work
    await page.getByRole('button', { name: 'Cell 5' }).click();
    await expect(page.getByRole('button', { name: 'Cell 5: ☀️' })).toBeVisible();
  });

  test('should handle draw game with custom symbols', async ({ page }) => {
    const xSelector = page.getByLabel('Symbol for Player X');
    const oSelector = page.getByLabel('Symbol for Player O');

    // Select custom symbols
    await xSelector.selectOption('◆');
    await oSelector.selectOption('▲');

    // Play a draw game: ◆ ▲ ◆ / ▲ ◆ ◆ / ▲ ◆ ▲
    await page.getByRole('button', { name: 'Cell 1' }).click(); // ◆
    await page.getByRole('button', { name: 'Cell 2' }).click(); // ▲
    await page.getByRole('button', { name: 'Cell 3' }).click(); // ◆
    await page.getByRole('button', { name: 'Cell 4' }).click(); // ▲
    await page.getByRole('button', { name: 'Cell 5' }).click(); // ◆
    await page.getByRole('button', { name: 'Cell 6' }).click(); // ▲
    await page.getByRole('button', { name: 'Cell 8' }).click(); // ◆
    await page.getByRole('button', { name: 'Cell 7' }).click(); // ▲
    await page.getByRole('button', { name: 'Cell 9' }).click(); // ◆

    // Check draw message
    const status = page.locator('.status');
    await expect(status).toContainText('Draw');
  });

  test('should detect early draw with custom symbols', async ({ page }) => {
    const xSelector = page.getByLabel('Symbol for Player X');
    const oSelector = page.getByLabel('Symbol for Player O');

    // Select custom symbols
    await xSelector.selectOption('●');
    await oSelector.selectOption('■');

    // Play moves that lead to early draw: ● ■ ● / ■ ● ■ / ■ ● _
    await page.getByRole('button', { name: 'Cell 1' }).click(); // ●
    await page.getByRole('button', { name: 'Cell 2' }).click(); // ■
    await page.getByRole('button', { name: 'Cell 3' }).click(); // ●
    await page.getByRole('button', { name: 'Cell 4' }).click(); // ■
    await page.getByRole('button', { name: 'Cell 5' }).click(); // ●
    await page.getByRole('button', { name: 'Cell 6' }).click(); // ■
    await page.getByRole('button', { name: 'Cell 7' }).click(); // ■
    await page.getByRole('button', { name: 'Cell 8' }).click(); // ●

    // At this point all winning lines are blocked, should detect early draw
    const status = page.locator('.status');
    await expect(status).toContainText('Draw');
  });

  test('should show draw with emoji symbols', async ({ page }) => {
    const xSelector = page.getByLabel('Symbol for Player X');
    const oSelector = page.getByLabel('Symbol for Player O');

    // Select emoji symbols
    await xSelector.selectOption('☀️');
    await oSelector.selectOption('🔵');

    // Play until early draw is detected
    // Results in: ☀️ 🔵 ☀️ / 🔵 ☀️ 🔵 / 🔵 ☀️ _
    await page.getByRole('button', { name: 'Cell 1' }).click(); // ☀️
    await page.getByRole('button', { name: 'Cell 2' }).click(); // 🔵
    await page.getByRole('button', { name: 'Cell 3' }).click(); // ☀️
    await page.getByRole('button', { name: 'Cell 4' }).click(); // 🔵
    await page.getByRole('button', { name: 'Cell 5' }).click(); // ☀️
    await page.getByRole('button', { name: 'Cell 6' }).click(); // 🔵
    await page.getByRole('button', { name: 'Cell 8' }).click(); // ☀️
    await page.getByRole('button', { name: 'Cell 7' }).click(); // 🔵

    // Early draw should be detected at this point
    const status = page.locator('.status');
    await expect(status).toContainText('Draw');

    // Verify some cells show correct symbols
    await expect(page.getByRole('button', { name: 'Cell 1: ☀️' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cell 2: 🔵' })).toBeVisible();
  });
});
