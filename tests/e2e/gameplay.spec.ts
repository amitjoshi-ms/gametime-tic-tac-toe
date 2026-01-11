/**
 * End-to-end tests for Tic-Tac-Toe gameplay.
 * Tests the full user journey through the application.
 */

import { test, expect } from '@playwright/test';

test.describe('Tic-Tac-Toe Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Initial State', () => {
    test('should display empty board with 9 cells', async ({ page }) => {
      const cells = page.locator('.cell');
      await expect(cells).toHaveCount(9);

      // All cells should be empty
      for (let i = 0; i < 9; i++) {
        await expect(cells.nth(i)).toHaveText('');
      }
    });

    test('should show X turn initially', async ({ page }) => {
      const status = page.locator('.status');
      await expect(status).toContainText("Player X's Turn");
    });

    test('should have a New Game button', async ({ page }) => {
      const newGameButton = page.getByRole('button', { name: /new game/i });
      await expect(newGameButton).toBeVisible();
    });
  });

  test.describe('Making Moves', () => {
    test('should place X on first click', async ({ page }) => {
      const firstCell = page.locator('.cell').first();
      await firstCell.click();

      await expect(firstCell).toHaveText('X');
    });

    test('should alternate between X and O', async ({ page }) => {
      const cells = page.locator('.cell');

      // X's move
      await cells.nth(0).click();
      await expect(cells.nth(0)).toHaveText('X');

      // O's move
      await cells.nth(1).click();
      await expect(cells.nth(1)).toHaveText('O');

      // X's move again
      await cells.nth(2).click();
      await expect(cells.nth(2)).toHaveText('X');
    });

    test('should update turn indicator after moves', async ({ page }) => {
      const status = page.locator('.status');
      const cells = page.locator('.cell');

      await expect(status).toContainText("Player X's Turn");

      await cells.nth(0).click();
      await expect(status).toContainText("Player O's Turn");

      await cells.nth(1).click();
      await expect(status).toContainText("Player X's Turn");
    });

    test('should not allow clicking occupied cells', async ({ page }) => {
      const cells = page.locator('.cell');

      // X clicks first cell
      await cells.nth(0).click();
      await expect(cells.nth(0)).toHaveText('X');

      // O tries to click same cell - should remain X
      await cells.nth(0).click();
      await expect(cells.nth(0)).toHaveText('X');

      // Turn should still be O's
      const status = page.locator('.status');
      await expect(status).toContainText("Player O's Turn");
    });
  });

  test.describe('Win Detection', () => {
    test('should detect X win (top row)', async ({ page }) => {
      const cells = page.locator('.cell');
      const status = page.locator('.status');

      // X: 0, O: 3, X: 1, O: 4, X: 2 (X wins top row)
      await cells.nth(0).click(); // X
      await cells.nth(3).click(); // O
      await cells.nth(1).click(); // X
      await cells.nth(4).click(); // O
      await cells.nth(2).click(); // X wins

      await expect(status).toContainText('🎉 Player X Wins!');
    });

    test('should detect O win (middle row)', async ({ page }) => {
      const cells = page.locator('.cell');
      const status = page.locator('.status');

      // X: 0, O: 3, X: 1, O: 4, X: 8, O: 5 (O wins middle row)
      await cells.nth(0).click(); // X
      await cells.nth(3).click(); // O
      await cells.nth(1).click(); // X
      await cells.nth(4).click(); // O
      await cells.nth(8).click(); // X
      await cells.nth(5).click(); // O wins

      await expect(status).toContainText('🎉 Player O Wins!');
    });

    test('should detect diagonal win', async ({ page }) => {
      const cells = page.locator('.cell');
      const status = page.locator('.status');

      // X: 0, O: 1, X: 4, O: 2, X: 8 (X wins main diagonal)
      await cells.nth(0).click(); // X
      await cells.nth(1).click(); // O
      await cells.nth(4).click(); // X
      await cells.nth(2).click(); // O
      await cells.nth(8).click(); // X wins

      await expect(status).toContainText('🎉 Player X Wins!');
    });

    test('should disable cells after win', async ({ page }) => {
      const cells = page.locator('.cell');

      // Quick X win
      await cells.nth(0).click(); // X
      await cells.nth(3).click(); // O
      await cells.nth(1).click(); // X
      await cells.nth(4).click(); // O
      await cells.nth(2).click(); // X wins

      // Verify all empty cells are disabled after win
      // Cells 5, 6, 7, 8 should be empty and disabled
      await expect(cells.nth(5)).toBeDisabled();
      await expect(cells.nth(6)).toBeDisabled();
      await expect(cells.nth(7)).toBeDisabled();
      await expect(cells.nth(8)).toBeDisabled();
    });
  });

  test.describe('Draw Detection', () => {
    test('should detect draw when board is full', async ({ page }) => {
      const cells = page.locator('.cell');
      const status = page.locator('.status');

      // Play a draw: X O X / X O O / O X X
      await cells.nth(0).click(); // X
      await cells.nth(1).click(); // O
      await cells.nth(2).click(); // X
      await cells.nth(4).click(); // O
      await cells.nth(3).click(); // X
      await cells.nth(5).click(); // O
      await cells.nth(7).click(); // X
      await cells.nth(6).click(); // O
      await cells.nth(8).click(); // X - Draw

      await expect(status).toContainText("It's a Draw!");
    });
  });

  test.describe('New Game', () => {
    test('should reset board when New Game is clicked', async ({ page }) => {
      const cells = page.locator('.cell');
      const newGameButton = page.getByRole('button', { name: /new game/i });

      // Make some moves
      await cells.nth(0).click();
      await cells.nth(1).click();
      await cells.nth(4).click();

      // Click New Game
      await newGameButton.click();

      // All cells should be empty
      for (let i = 0; i < 9; i++) {
        await expect(cells.nth(i)).toHaveText('');
      }
    });

    test('should reset turn to X after New Game', async ({ page }) => {
      const cells = page.locator('.cell');
      const status = page.locator('.status');
      const newGameButton = page.getByRole('button', { name: /new game/i });

      // Play until O's turn
      await cells.nth(0).click(); // X
      await expect(status).toContainText("Player O's Turn");

      // Click New Game
      await newGameButton.click();

      // Should be X's turn
      await expect(status).toContainText("Player X's Turn");
    });

    test('should allow starting new game after win', async ({ page }) => {
      const cells = page.locator('.cell');
      const status = page.locator('.status');
      const newGameButton = page.getByRole('button', { name: /new game/i });

      // Quick X win
      await cells.nth(0).click(); // X
      await cells.nth(3).click(); // O
      await cells.nth(1).click(); // X
      await cells.nth(4).click(); // O
      await cells.nth(2).click(); // X wins

      await expect(status).toContainText('🎉 Player X Wins!');

      // Start new game
      await newGameButton.click();

      await expect(status).toContainText("Player X's Turn");
      await expect(cells.nth(0)).toHaveText('');
    });
  });

  test.describe('Accessibility', () => {
    test('should have accessible cell labels', async ({ page }) => {
      const cells = page.locator('.cell');
      const firstCell = cells.first();

      await expect(firstCell).toHaveAttribute('aria-label', 'Cell 1');
    });

    test('should update aria-label when cell is occupied', async ({ page }) => {
      const firstCell = page.locator('.cell').first();

      await firstCell.click();

      await expect(firstCell).toHaveAttribute('aria-label', 'Cell 1: X');
    });

    test('should be keyboard navigable', async ({ page }) => {
      // Focus first cell directly and press Enter
      const firstCell = page.locator('.cell').first();
      await firstCell.focus();
      await page.keyboard.press('Enter');

      await expect(firstCell).toHaveText('X');
    });
  });
});
