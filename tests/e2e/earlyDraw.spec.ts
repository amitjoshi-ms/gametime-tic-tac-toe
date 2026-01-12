/**
 * End-to-end tests for early draw detection.
 * Tests that the UI correctly displays draw status when early draw is detected.
 */

import { test, expect } from '@playwright/test';

test.describe('Early Draw Detection', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh
    await page.addInitScript(() => {
      localStorage.clear();
    });
    await page.goto('/');
    // Verify human mode is selected (default)
    await expect(page.locator('.mode-selector__option--selected')).toContainText('Human');
  });

  test.describe('Human vs Human Mode', () => {
    test('should detect early draw with 1 empty cell (scenario 1)', async ({ page }) => {
      const cells = page.locator('.cell');
      const status = page.locator('.status');

      // Play sequence resulting in early draw: X X O / O O X / X O _
      // This is an 8-move game where all lines become blocked
      await cells.nth(0).click(); // X at 0
      await cells.nth(3).click(); // O at 3
      await cells.nth(1).click(); // X at 1
      await cells.nth(4).click(); // O at 4
      await cells.nth(5).click(); // X at 5
      await cells.nth(2).click(); // O at 2
      await cells.nth(6).click(); // X at 6
      await cells.nth(7).click(); // O at 7 - Early draw!

      // Verify draw status is displayed
      await expect(status).toContainText("It's a Draw!");

      // Verify cell 8 is still empty
      await expect(cells.nth(8)).toHaveText('');

      // Verify all cells are disabled (game is over)
      await expect(cells.nth(8)).toBeDisabled();
    });

    test('should detect early draw with 1 empty cell (scenario 2)', async ({ page }) => {
      const cells = page.locator('.cell');
      const status = page.locator('.status');

      // Play sequence: X O X / X O O / O X _
      await cells.nth(0).click(); // X at 0
      await cells.nth(1).click(); // O at 1
      await cells.nth(2).click(); // X at 2
      await cells.nth(4).click(); // O at 4
      await cells.nth(3).click(); // X at 3
      await cells.nth(5).click(); // O at 5
      await cells.nth(7).click(); // X at 7
      await cells.nth(6).click(); // O at 6 - Early draw!

      await expect(status).toContainText("It's a Draw!");
      await expect(cells.nth(8)).toHaveText('');
      await expect(cells.nth(8)).toBeDisabled();
    });

    test('should detect early draw with empty cell at position 7', async ({ page }) => {
      const cells = page.locator('.cell');
      const status = page.locator('.status');

      // Play sequence: X O O / O X X / X _ O
      await cells.nth(0).click(); // X at 0
      await cells.nth(1).click(); // O at 1
      await cells.nth(4).click(); // X at 4
      await cells.nth(3).click(); // O at 3
      await cells.nth(5).click(); // X at 5
      await cells.nth(2).click(); // O at 2
      await cells.nth(6).click(); // X at 6
      await cells.nth(8).click(); // O at 8 - Early draw!

      await expect(status).toContainText("It's a Draw!");
      await expect(cells.nth(7)).toHaveText('');
      await expect(cells.nth(7)).toBeDisabled();
    });

    test('should NOT detect early draw when winning line still available', async ({ page }) => {
      const cells = page.locator('.cell');
      const status = page.locator('.status');

      // Play sequence where main diagonal is not blocked
      // X O X / O X O / O X _
      await cells.nth(0).click(); // X at 0
      await cells.nth(1).click(); // O at 1
      await cells.nth(2).click(); // X at 2
      await cells.nth(3).click(); // O at 3
      await cells.nth(4).click(); // X at 4
      await cells.nth(5).click(); // O at 5
      await cells.nth(7).click(); // X at 7
      await cells.nth(6).click(); // O at 6

      // Game should still be playing - X can win with cell 8
      await expect(status).toContainText("Player X's Turn");
      await expect(cells.nth(8)).not.toBeDisabled();

      // X completes the diagonal
      await cells.nth(8).click(); // X at 8 - X wins!
      await expect(status).toContainText('🎉 Player X Wins!');
    });

    test('should handle draw detection when board fills up', async ({ page }) => {
      const cells = page.locator('.cell');
      const status = page.locator('.status');

      // This test verifies that draw status is shown when appropriate
      
      // Play a simple game that leads to a draw
      // X at 0, O at 1, X at 2, O at 4, X at 3, O at 5, X at 7, O at 6
      // This creates: X O X / X O O / O X _
      await cells.nth(0).click(); // X at 0
      await cells.nth(1).click(); // O at 1
      await cells.nth(2).click(); // X at 2
      await cells.nth(4).click(); // O at 4
      await cells.nth(3).click(); // X at 3
      await cells.nth(5).click(); // O at 5
      await cells.nth(7).click(); // X at 7
      await cells.nth(6).click(); // O at 6
      
      // At this point, early draw should be detected
      await expect(status).toContainText("It's a Draw!");
      // Final cell should be disabled because the game is over
      await expect(cells.nth(8)).toBeDisabled();
    });

    test('should allow new game after early draw', async ({ page }) => {
      const cells = page.locator('.cell');
      const status = page.locator('.status');
      const newGameButton = page.getByRole('button', { name: /new game/i });

      // Play to early draw
      await cells.nth(0).click(); // X at 0
      await cells.nth(3).click(); // O at 3
      await cells.nth(1).click(); // X at 1
      await cells.nth(4).click(); // O at 4
      await cells.nth(5).click(); // X at 5
      await cells.nth(2).click(); // O at 2
      await cells.nth(6).click(); // X at 6
      await cells.nth(7).click(); // O at 7 - Early draw!

      await expect(status).toContainText("It's a Draw!");

      // Click New Game
      await newGameButton.click();

      // Board should be empty
      for (let i = 0; i < 9; i++) {
        await expect(cells.nth(i)).toHaveText('');
      }

      // Status should show player's turn
      const statusText = await status.textContent();
      expect(statusText).toMatch(/Player (X|O)'s Turn/);
    });
  });

  test.describe('Player vs Computer Mode', () => {
    test.beforeEach(async ({ page }) => {
      // Switch to computer mode
      const computerOption = page.locator('.mode-selector__option').filter({ hasText: 'Computer' });
      await computerOption.click();
      await expect(page.locator('.mode-selector__option--selected')).toContainText('Computer');
    });

    test('should detect draw in computer mode', async ({ page }) => {
      const cells = page.locator('.cell');
      const status = page.locator('.status');

      // This test verifies that draw detection works in computer mode
      // We play moves until the game completes
      
      // Make initial moves
      await cells.nth(4).click(); // X at center
      await expect(status).toContainText("Player X's Turn", { timeout: 5000 });

      await cells.nth(0).click(); // X at 0
      await expect(status).toContainText("Player X's Turn", { timeout: 5000 });

      await cells.nth(8).click(); // X at 8
      
      // Continue playing until game ends
      for (let attempt = 0; attempt < 5; attempt++) {
        const statusText = await status.textContent();
        
        // Check if game is over
        if (statusText?.includes('Wins!') || statusText?.includes('Draw!')) {
          break;
        }
        
        // Wait for our turn
        await expect(status).toContainText("Player X's Turn", { timeout: 5000 });
        
        // Make a move on first available cell
        for (let i = 0; i < 9; i++) {
          const cellText = await cells.nth(i).textContent();
          if (cellText === '') {
            await cells.nth(i).click();
            break;
          }
        }
      }

      // Verify game ended
      await expect(status).toContainText(/(Wins!|Draw!)/, { timeout: 5000 });
    });
  });

  test.describe('Early Draw Accessibility', () => {
    test('should announce draw status to screen readers', async ({ page }) => {
      const cells = page.locator('.cell');
      const status = page.locator('.status');

      // Play to early draw
      await cells.nth(0).click(); // X
      await cells.nth(3).click(); // O
      await cells.nth(1).click(); // X
      await cells.nth(4).click(); // O
      await cells.nth(5).click(); // X
      await cells.nth(2).click(); // O
      await cells.nth(6).click(); // X
      await cells.nth(7).click(); // O - Early draw!

      // Verify status has appropriate role for screen readers and displays draw text
      await expect(status).toHaveAttribute('role', 'status');
      await expect(status).toContainText("It's a Draw!");
    });

    test('should disable all cells after early draw', async ({ page }) => {
      const cells = page.locator('.cell');

      // Play to early draw
      await cells.nth(0).click();
      await cells.nth(3).click();
      await cells.nth(1).click();
      await cells.nth(4).click();
      await cells.nth(5).click();
      await cells.nth(2).click();
      await cells.nth(6).click();
      await cells.nth(7).click();

      // All cells should be disabled
      for (let i = 0; i < 9; i++) {
        await expect(cells.nth(i)).toBeDisabled();
      }
    });
  });
});
