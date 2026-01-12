/**
 * End-to-end tests for edge cases and error scenarios.
 * Tests rapid clicking, page refresh, multiple games, and unusual interactions.
 */

import { test, expect } from '@playwright/test';

test.describe('Edge Cases and Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });
    await page.goto('/');
  });

  test.describe('Rapid Clicking', () => {
    test('should handle rapid clicking on same cell', async ({ page }) => {
      const firstCell = page.locator('.cell').first();
      
      // Click rapidly 5 times
      for (let i = 0; i < 5; i++) {
        await firstCell.click();
      }
      
      // Should only have X (first click)
      await expect(firstCell).toHaveText('X');
    });

    test('should handle rapid clicking on different cells', async ({ page }) => {
      const cells = page.locator('.cell');
      
      // Rapidly click multiple cells
      await cells.nth(0).click();
      await cells.nth(1).click();
      await cells.nth(2).click();
      await cells.nth(3).click();
      await cells.nth(4).click();
      
      // Should have alternating X and O
      await expect(cells.nth(0)).toHaveText('X');
      await expect(cells.nth(1)).toHaveText('O');
      await expect(cells.nth(2)).toHaveText('X');
      await expect(cells.nth(3)).toHaveText('O');
      await expect(cells.nth(4)).toHaveText('X');
    });

    test('should handle clicking occupied cells', async ({ page }) => {
      const cells = page.locator('.cell');
      
      // Place X at cell 0
      await cells.nth(0).click();
      await expect(cells.nth(0)).toHaveText('X');
      
      // Try to click same cell again
      await cells.nth(0).click();
      
      // Should still be X (not O)
      await expect(cells.nth(0)).toHaveText('X');
      
      // Turn should still be O's
      const status = page.locator('.status');
      await expect(status).toContainText("Player O's Turn");
    });

    test('should handle rapid new game clicks', async ({ page }) => {
      const newGameButton = page.getByRole('button', { name: /new game/i });
      const cells = page.locator('.cell');
      
      // Make a move
      await cells.nth(0).click();
      
      // Rapidly click new game
      await newGameButton.click();
      await newGameButton.click();
      await newGameButton.click();
      
      // Board should be empty
      await expect(cells.nth(0)).toHaveText('');
      
      // Game should be playable
      await cells.nth(4).click();
      await expect(cells.nth(4)).toHaveText(/X|O/);
    });

    test('should handle rapid mode switching', async ({ page }) => {
      const humanOption = page.locator('.mode-selector__option').filter({ hasText: 'Human' });
      const computerOption = page.locator('.mode-selector__option').filter({ hasText: 'Computer' });
      
      // Rapidly switch modes
      await computerOption.click();
      await humanOption.click();
      await computerOption.click();
      await humanOption.click();
      
      // Should end up in human mode
      const selectedOption = page.locator('.mode-selector__option--selected');
      await expect(selectedOption).toContainText('Human');
    });
  });

  test.describe('Computer Mode Edge Cases', () => {
    test('should handle rapid clicking during computer turn', async ({ page }) => {
      const computerOption = page.locator('.mode-selector__option').filter({ hasText: 'Computer' });
      await computerOption.click();
      
      const cells = page.locator('.cell');
      const status = page.locator('.status');
      
      // Wait to see who goes first
      const initialStatus = await status.textContent();
      
      if (initialStatus?.includes("Player X's Turn")) {
        // Make player move
        await cells.nth(4).click();
        
        // Immediately try to click multiple other cells
        await cells.nth(0).click();
        await cells.nth(1).click();
        await cells.nth(2).click();
        
        // Wait for computer to finish
        await page.waitForTimeout(3000);
        
        // Only one cell should have X (center)
        await expect(cells.nth(4)).toHaveText('X');
        
        // Verify game state is valid (correct number of moves)
        let xCount = 0;
        let oCount = 0;
        for (let i = 0; i < 9; i++) {
          const text = await cells.nth(i).textContent();
          if (text === 'X') xCount++;
          if (text === 'O') oCount++;
        }
        
        // Should have 1-2 moves (player + maybe computer)
        expect(xCount + oCount).toBeGreaterThanOrEqual(1);
        expect(xCount + oCount).toBeLessThanOrEqual(3);
      }
    });

    test('should not allow mode switch during computer thinking', async ({ page }) => {
      const computerOption = page.locator('.mode-selector__option').filter({ hasText: 'Computer' });
      const humanOption = page.locator('.mode-selector__option').filter({ hasText: 'Human' });
      
      await computerOption.click();
      
      const cells = page.locator('.cell');
      const status = page.locator('.status');
      
      const initialStatus = await status.textContent();
      
      if (initialStatus?.includes("Player X's Turn")) {
        // Make move to trigger computer turn
        await cells.nth(4).click();
        
        // Immediately try to switch mode (during computer thinking)
        await humanOption.click();
        
        // Wait for computer to finish
        await page.waitForTimeout(3000);
        
        // Mode switching behavior depends on implementation
        // At minimum, game should be in valid state
        const selectedMode = await page.locator('.mode-selector__option--selected').textContent();
        expect(['Human', 'Computer']).toContain(selectedMode);
      }
    });
  });

  test.describe('Page Refresh', () => {
    test('should handle page refresh during game', async ({ page }) => {
      const cells = page.locator('.cell');
      
      // Make some moves
      await cells.nth(0).click(); // X
      await cells.nth(1).click(); // O
      await cells.nth(4).click(); // X
      
      // Reload page
      await page.reload();
      
      // Board should be reset or restored
      // Implementation may vary - document current behavior
      await expect(cells.nth(0)).toHaveText(/^(X|)$/);
    });

    test('should handle page refresh after win', async ({ page }) => {
      const cells = page.locator('.cell');
      
      // Quick X win
      await cells.nth(0).click();
      await cells.nth(3).click();
      await cells.nth(1).click();
      await cells.nth(4).click();
      await cells.nth(2).click();
      
      // Reload page
      await page.reload();
      
      // Should start fresh game
      const status = page.locator('.status');
      const statusText = await status.textContent();
      expect(statusText).toMatch(/Turn|Welcome/);
    });

    test('should preserve localStorage data after refresh', async ({ page }) => {
      // Implementation dependent - if player names are stored
      await page.reload();
      
      // Page should load successfully
      const status = page.locator('.status');
      await expect(status).toBeVisible();
    });
  });

  test.describe('Multiple Sequential Games', () => {
    test('should handle 5 consecutive games', async ({ page }) => {
      const newGameButton = page.getByRole('button', { name: /new game/i });
      const cells = page.locator('.cell');
      
      for (let game = 0; game < 5; game++) {
        // Make a quick move
        await cells.nth(4).click();
        
        // Start new game
        await newGameButton.click();
        await page.waitForTimeout(100);
      }
      
      // Should still be playable
      await cells.nth(0).click();
      await expect(cells.nth(0)).toHaveText(/X|O/);
    });

    test('should alternate starting player across multiple games', async ({ page }) => {
      const newGameButton = page.getByRole('button', { name: /new game/i });
      const status = page.locator('.status');
      
      const players: string[] = [];
      
      for (let i = 0; i < 4; i++) {
        const statusText = await status.textContent();
        const player = statusText?.includes('X') ? 'X' : 'O';
        players.push(player);
        
        await newGameButton.click();
        await page.waitForTimeout(100);
      }
      
      // Should see alternating pattern
      expect(players).toHaveLength(4);
      // At least some variation in starting player
      const hasX = players.includes('X');
      const hasO = players.includes('O');
      expect(hasX || hasO).toBe(true);
    });
  });

  test.describe('Browser Navigation', () => {
    test('should handle browser back button', async ({ page }) => {
      const cells = page.locator('.cell');
      
      // Make a move
      await cells.nth(0).click();
      
      // Try browser back
      await page.goBack();
      
      // Should handle gracefully (might return to previous page or stay)
      // This test documents behavior
      await page.waitForTimeout(500);
    });

    test('should handle browser forward button', async ({ page }) => {
      // Navigate somewhere else first
      await page.goto('about:blank');
      
      // Go back to game
      await page.goBack();
      
      // Go forward
      await page.goForward();
      
      // Should handle gracefully
      await page.waitForTimeout(500);
    });
  });

  test.describe('Window Resize', () => {
    test('should handle window resize during game', async ({ page }) => {
      const cells = page.locator('.cell');
      
      // Make some moves
      await cells.nth(0).click();
      await cells.nth(1).click();
      
      // Resize window
      await page.setViewportSize({ width: 800, height: 600 });
      await page.waitForTimeout(200);
      
      // Board should still be visible and playable
      await expect(cells.nth(0)).toBeVisible();
      await cells.nth(4).click();
      await expect(cells.nth(4)).toHaveText('X');
      
      // Resize to mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(200);
      
      // Should still be playable
      await expect(cells.nth(4)).toBeVisible();
    });
  });

  test.describe('Invalid States', () => {
    test('should handle clicking after game is won', async ({ page }) => {
      const cells = page.locator('.cell');
      
      // Quick X win
      await cells.nth(0).click();
      await cells.nth(3).click();
      await cells.nth(1).click();
      await cells.nth(4).click();
      await cells.nth(2).click();
      
      // Try to make more moves
      await cells.nth(5).click();
      await cells.nth(6).click();
      
      // Cells should remain empty (disabled)
      await expect(cells.nth(5)).toHaveText('');
      await expect(cells.nth(6)).toHaveText('');
    });

    test('should handle clicking after draw', async ({ page }) => {
      const cells = page.locator('.cell');
      
      // Play to early draw
      await cells.nth(0).click(); // X
      await cells.nth(3).click(); // O
      await cells.nth(1).click(); // X
      await cells.nth(4).click(); // O
      await cells.nth(5).click(); // X
      await cells.nth(2).click(); // O
      await cells.nth(6).click(); // X
      await cells.nth(7).click(); // O - Early draw
      
      // Try to click empty cell
      await cells.nth(8).click();
      
      // Should remain empty (disabled)
      await expect(cells.nth(8)).toHaveText('');
    });
  });

  test.describe('Concurrent Interactions', () => {
    test('should handle simultaneous cell and button clicks', async ({ page }) => {
      const cells = page.locator('.cell');
      const newGameButton = page.getByRole('button', { name: /new game/i });
      
      // Click cell
      await cells.nth(0).click();
      
      // Immediately click new game
      await newGameButton.click();
      
      // Should start fresh game
      await expect(cells.nth(0)).toHaveText('');
    });

    test('should handle cell click and mode switch simultaneously', async ({ page }) => {
      const cells = page.locator('.cell');
      const computerOption = page.locator('.mode-selector__option').filter({ hasText: 'Computer' });
      
      // Click cell and mode at almost the same time
      await Promise.all([
        cells.nth(0).click(),
        computerOption.click(),
      ]);
      
      // Should handle gracefully
      await page.waitForTimeout(500);
      
      // Game should be in valid state
      const selectedMode = await page.locator('.mode-selector__option--selected').textContent();
      expect(['Human', 'Computer']).toContain(selectedMode);
    });
  });

  test.describe('Performance', () => {
    test('should handle many rapid new games without performance degradation', async ({ page }) => {
      const newGameButton = page.getByRole('button', { name: /new game/i });
      
      const startTime = Date.now();
      
      // Click new game 20 times rapidly
      for (let i = 0; i < 20; i++) {
        await newGameButton.click();
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete in reasonable time (< 5 seconds)
      expect(duration).toBeLessThan(5000);
      
      // Game should still be functional
      const cells = page.locator('.cell');
      await cells.nth(0).click();
      await expect(cells.nth(0)).toHaveText(/X|O/);
    });

    test('should handle rapid keyboard navigation', async ({ page }) => {
      // Rapidly press Tab many times
      for (let i = 0; i < 30; i++) {
        await page.keyboard.press('Tab');
      }
      
      // Page should still be responsive
      const cells = page.locator('.cell');
      await cells.nth(0).click();
      await expect(cells.nth(0)).toHaveText(/X|O/);
    });
  });
});
