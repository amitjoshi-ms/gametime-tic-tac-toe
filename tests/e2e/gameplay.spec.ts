/**
 * End-to-end tests for Tic-Tac-Toe gameplay.
 * Tests the full user journey through the application.
 */

import { test, expect } from '@playwright/test';

test.describe('Tic-Tac-Toe Game', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh (ensures human mode as default)
    await page.addInitScript(() => {
      localStorage.clear();
    });
    await page.goto('/');
    // Human mode is the default when localStorage is cleared, just verify it's selected
    await expect(page.locator('.mode-selector__option--selected')).toContainText('Human');
    // Verify X starts first on fresh page load
    await expect(page.locator('.status')).toContainText("Player X's Turn");
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

      // Verify we start with X's turn
      await expect(status).toContainText("Player X's Turn");

      // Play a draw sequence that doesn't trigger early draw detection
      // Final board: X X O / O X X / X O O
      // This sequence keeps diagonal 0-4-8 (X-X-?) unblocked until the 9th move

      await cells.nth(0).click(); // X at 0
      await expect(cells.nth(0)).toHaveText('X');

      await cells.nth(2).click(); // O at 2
      await expect(cells.nth(2)).toHaveText('O');

      await cells.nth(4).click(); // X at 4
      await expect(cells.nth(4)).toHaveText('X');

      await cells.nth(3).click(); // O at 3
      await expect(cells.nth(3)).toHaveText('O');

      await cells.nth(5).click(); // X at 5
      await expect(cells.nth(5)).toHaveText('X');

      await cells.nth(7).click(); // O at 7
      await expect(cells.nth(7)).toHaveText('O');

      await cells.nth(6).click(); // X at 6
      await expect(cells.nth(6)).toHaveText('X');

      await cells.nth(8).click(); // O at 8 - blocks diagonal 0-4-8
      await expect(cells.nth(8)).toHaveText('O');
      // At this point, all lines should now be blocked, triggering early draw
      // OR if not, the next move fills the board

      // Either the game already ended in draw, or we need one more move
      const statusText = await status.textContent();
      if (statusText?.includes("Player X's Turn")) {
        await cells.nth(1).click(); // X at 1 - final move
        await expect(cells.nth(1)).toHaveText('X');
      }

      await expect(status).toContainText("It's a Draw!");
    });
  });

  test.describe('New Game', () => {
    test('should reset board when New Game is clicked', async ({ page }) => {
      const cells = page.locator('.cell');
      const status = page.locator('.status');
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

      // Status should show a player's turn (either X or O)
      const statusText = await status.textContent();
      expect(statusText).toMatch(/Player (X|O)'s Turn/);
    });

    test('should reset turn after New Game', async ({ page }) => {
      const cells = page.locator('.cell');
      const status = page.locator('.status');
      const newGameButton = page.getByRole('button', { name: /new game/i });

      // Play until O's turn
      await cells.nth(0).click(); // X
      await expect(status).toContainText("Player O's Turn");

      // Click New Game
      await newGameButton.click();

      // Status should show a player's turn (starting player alternates)
      const statusText = await status.textContent();
      expect(statusText).toMatch(/Player (X|O)'s Turn/);
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

      // Board should be empty
      await expect(cells.nth(0)).toHaveText('');
      // Starting player alternates, so check for either X or O
      const statusText = await status.textContent();
      expect(statusText).toMatch(/Player (X|O)'s Turn/);
    });

    test('should alternate starting player between games', async ({ page }) => {
      const status = page.locator('.status');
      const newGameButton = page.getByRole('button', { name: /new game/i });

      // Check initial player
      const initialPlayer = (await status.textContent())?.includes('X') ? 'X' : 'O';

      // Start new game
      await newGameButton.click();

      // Check that the starting player alternated
      const nextPlayer = (await status.textContent())?.includes('X') ? 'X' : 'O';
      expect(nextPlayer).not.toBe(initialPlayer);

      // Start another game
      await newGameButton.click();

      // Should go back to the first player
      const thirdPlayer = (await status.textContent())?.includes('X') ? 'X' : 'O';
      expect(thirdPlayer).toBe(initialPlayer);
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
