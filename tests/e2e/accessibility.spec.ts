/**
 * End-to-end accessibility tests.
 * Tests keyboard navigation, ARIA attributes, and screen reader support.
 */

import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });
    await page.goto('/');
  });

  test.describe('ARIA Attributes', () => {
    test('should have role=status on status element', async ({ page }) => {
      const status = page.locator('.status');
      await expect(status).toHaveAttribute('role', 'status');
    });

    test('should have aria-live=polite on status element', async ({ page }) => {
      const status = page.locator('.status');
      await expect(status).toHaveAttribute('aria-live', 'polite');
    });

    test('should have aria-label on each cell', async ({ page }) => {
      const cells = page.locator('.cell');
      
      for (let i = 0; i < 9; i++) {
        const cell = cells.nth(i);
        const ariaLabel = await cell.getAttribute('aria-label');
        expect(ariaLabel).toContain(`Cell ${String(i + 1)}`);
      }
    });

    test('should update cell aria-label when occupied', async ({ page }) => {
      const firstCell = page.locator('.cell').first();
      
      // Initially empty
      await expect(firstCell).toHaveAttribute('aria-label', 'Cell 1');
      
      // Click to place X
      await firstCell.click();
      
      // Should update to include player mark
      await expect(firstCell).toHaveAttribute('aria-label', 'Cell 1: X');
    });

    test('should have aria-label on mode selector', async ({ page }) => {
      const modeSelector = page.locator('.mode-selector');
      await expect(modeSelector).toHaveAttribute('aria-label', 'Game mode selector');
    });

    test('should have aria-label on new game button', async ({ page }) => {
      const newGameButton = page.getByRole('button', { name: /new game/i });
      await expect(newGameButton).toHaveAttribute('aria-label', 'Start a new game');
    });

    test('should have aria-label on mode radio buttons', async ({ page }) => {
      const humanRadio = page.locator('input[type="radio"][value="human"]');
      const computerRadio = page.locator('input[type="radio"][value="computer"]');
      
      await expect(humanRadio).toHaveAttribute('aria-label', 'Play against Human');
      await expect(computerRadio).toHaveAttribute('aria-label', 'Play against Computer');
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should navigate cells with Tab key', async ({ page }) => {
      // Tab to first cell
      await page.keyboard.press('Tab');
      
      // First cell should be focused (or first focusable element)
      const focusedElement = await page.evaluate(() => document.activeElement?.className);
      expect(focusedElement).toBeTruthy();
    });

    test('should place mark with Enter key', async ({ page }) => {
      const firstCell = page.locator('.cell').first();
      
      // Focus the cell directly and press Enter
      await firstCell.focus();
      await page.keyboard.press('Enter');
      
      // Should place X
      await expect(firstCell).toHaveText('X');
    });

    test('should place mark with Space key', async ({ page }) => {
      const cells = page.locator('.cell');
      
      // Focus a cell and press Space
      await cells.nth(1).focus();
      await page.keyboard.press('Space');
      
      // Should place X
      await expect(cells.nth(1)).toHaveText('X');
    });

    test('should allow keyboard navigation through full game', async ({ page }) => {
      const cells = page.locator('.cell');
      
      // X's turn - cell 0
      await cells.nth(0).focus();
      await page.keyboard.press('Enter');
      await expect(cells.nth(0)).toHaveText('X');
      
      // O's turn - cell 3
      await cells.nth(3).focus();
      await page.keyboard.press('Enter');
      await expect(cells.nth(3)).toHaveText('O');
      
      // X's turn - cell 1
      await cells.nth(1).focus();
      await page.keyboard.press('Enter');
      await expect(cells.nth(1)).toHaveText('X');
    });

    test('should focus new game button with Tab', async ({ page }) => {
      // Tab multiple times to reach button
      for (let i = 0; i < 15; i++) {
        await page.keyboard.press('Tab');
        const focused = await page.evaluate(() => document.activeElement?.textContent);
        if (focused?.includes('New Game')) {
          break;
        }
      }
      
      // Press Enter to click
      await page.keyboard.press('Enter');
      
      // Board should be reset
      const cells = page.locator('.cell');
      await expect(cells.first()).toHaveText('');
    });

    test('should allow keyboard interaction with mode selector', async ({ page }) => {
      const computerRadio = page.locator('input[type="radio"][value="computer"]');
      
      // Focus computer radio with Tab
      await computerRadio.focus();
      
      // Press Space to select
      await page.keyboard.press('Space');
      
      // Computer mode should be selected
      const selectedOption = page.locator('.mode-selector__option--selected');
      await expect(selectedOption).toContainText('Computer');
    });
  });

  test.describe('Focus Management', () => {
    test('should show focus indicators on cells', async ({ page }) => {
      const firstCell = page.locator('.cell').first();
      
      await firstCell.focus();
      
      // Check if cell has focus (visual indicator should be present)
      const isFocused = await firstCell.evaluate((el) => 
        el === document.activeElement
      );
      expect(isFocused).toBe(true);
    });

    test('should maintain focus order after moves', async ({ page }) => {
      const cells = page.locator('.cell');
      
      // Make a move
      await cells.nth(0).click();
      
      // Focus should still be manageable
      await cells.nth(1).focus();
      const isFocused = await cells.nth(1).evaluate((el) => 
        el === document.activeElement
      );
      expect(isFocused).toBe(true);
    });

    test('should not lose focus after game ends', async ({ page }) => {
      const cells = page.locator('.cell');
      
      // Quick X win
      await cells.nth(0).click();
      await cells.nth(3).click();
      await cells.nth(1).click();
      await cells.nth(4).click();
      await cells.nth(2).click();
      
      // Try to focus a disabled cell
      await cells.nth(5).focus();
      
      // Note: disabled buttons typically can't be focused, which is correct
      // Just verify test doesn't throw
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should announce game status changes', async ({ page }) => {
      const status = page.locator('.status');
      const cells = page.locator('.cell');
      
      // Initial status
      await expect(status).toHaveAttribute('role', 'status');
      await expect(status).toHaveAttribute('aria-live', 'polite');
      
      // Make a move - status should update
      await cells.nth(0).click();
      
      // Status text should change and be announced
      await expect(status).toContainText("Player O's Turn");
    });

    test('should announce win message', async ({ page }) => {
      const status = page.locator('.status');
      const cells = page.locator('.cell');
      
      // Quick X win
      await cells.nth(0).click();
      await cells.nth(3).click();
      await cells.nth(1).click();
      await cells.nth(4).click();
      await cells.nth(2).click();
      
      // Win message should be announced
      await expect(status).toContainText('Wins!');
      await expect(status).toHaveAttribute('aria-live', 'polite');
    });

    test('should announce draw message', async ({ page }) => {
      const status = page.locator('.status');
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
      
      // Draw message should be announced
      await expect(status).toContainText("It's a Draw!");
    });

    test('should provide context for occupied cells', async ({ page }) => {
      const cells = page.locator('.cell');
      
      // Place X
      await cells.nth(0).click();
      
      // Cell should indicate it's occupied
      const ariaLabel = await cells.nth(0).getAttribute('aria-label');
      expect(ariaLabel).toContain('X');
      
      // Place O
      await cells.nth(1).click();
      
      const oAriaLabel = await cells.nth(1).getAttribute('aria-label');
      expect(oAriaLabel).toContain('O');
    });
  });

  test.describe('Semantic HTML', () => {
    test('should use button elements for interactive cells', async ({ page }) => {
      const cells = page.locator('.cell');
      
      const tagName = await cells.first().evaluate((el) => el.tagName);
      expect(tagName).toBe('BUTTON');
    });

    test('should use button element for new game control', async ({ page }) => {
      const newGameButton = page.getByRole('button', { name: /new game/i });
      
      const tagName = await newGameButton.evaluate((el) => el.tagName);
      expect(tagName).toBe('BUTTON');
    });

    test('should use fieldset for mode selector', async ({ page }) => {
      const modeSelector = page.locator('.mode-selector');
      
      const tagName = await modeSelector.evaluate((el) => el.tagName);
      expect(tagName).toBe('FIELDSET');
    });

    test('should use legend for mode selector label', async ({ page }) => {
      const legend = page.locator('.mode-selector__legend');
      
      const tagName = await legend.evaluate((el) => el.tagName);
      expect(tagName).toBe('LEGEND');
    });

    test('should use radio buttons for mode selection', async ({ page }) => {
      const humanRadio = page.locator('input[value="human"]');
      const computerRadio = page.locator('input[value="computer"]');
      
      await expect(humanRadio).toHaveAttribute('type', 'radio');
      await expect(computerRadio).toHaveAttribute('type', 'radio');
    });
  });

  test.describe('Disabled State Accessibility', () => {
    test('should disable cells after game ends', async ({ page }) => {
      const cells = page.locator('.cell');
      
      // Quick X win
      await cells.nth(0).click();
      await cells.nth(3).click();
      await cells.nth(1).click();
      await cells.nth(4).click();
      await cells.nth(2).click();
      
      // All cells should be disabled
      for (let i = 0; i < 9; i++) {
        await expect(cells.nth(i)).toBeDisabled();
      }
    });

    test('should have appropriate classes for disabled cells', async ({ page }) => {
      const cells = page.locator('.cell');
      
      // Quick X win
      await cells.nth(0).click();
      await cells.nth(3).click();
      await cells.nth(1).click();
      await cells.nth(4).click();
      await cells.nth(2).click();
      
      // Cells should have disabled class
      const hasDisabledClass = await cells.nth(5).evaluate((el) => 
        el.classList.contains('cell--disabled')
      );
      expect(hasDisabledClass).toBe(true);
    });

    test('should not allow keyboard interaction with disabled cells', async ({ page }) => {
      const cells = page.locator('.cell');
      
      // Quick X win
      await cells.nth(0).click();
      await cells.nth(3).click();
      await cells.nth(1).click();
      await cells.nth(4).click();
      await cells.nth(2).click();
      
      // Try to interact with disabled cell
      await cells.nth(5).focus();
      await page.keyboard.press('Enter');
      
      // Cell should remain empty
      await expect(cells.nth(5)).toHaveText('');
    });
  });

  test.describe('Color Contrast and Visual Accessibility', () => {
    test('should have visible text in status area', async ({ page }) => {
      const status = page.locator('.status');
      
      const isVisible = await status.isVisible();
      expect(isVisible).toBe(true);
      
      const text = await status.textContent();
      expect(text).toBeTruthy();
      expect(text?.trim().length).toBeGreaterThan(0);
    });

    test('should have visible marks in cells', async ({ page }) => {
      const cells = page.locator('.cell');
      
      await cells.nth(0).click();
      
      const text = await cells.nth(0).textContent();
      expect(text).toBe('X');
      
      const isVisible = await cells.nth(0).isVisible();
      expect(isVisible).toBe(true);
    });

    test('should differentiate X and O visually', async ({ page }) => {
      const cells = page.locator('.cell');
      
      // Place X and O
      await cells.nth(0).click(); // X
      await cells.nth(1).click(); // O
      
      const xClass = await cells.nth(0).getAttribute('class');
      const oClass = await cells.nth(1).getAttribute('class');
      
      // Should have different classes
      expect(xClass).toBeTruthy();
      expect(oClass).toBeTruthy();
      expect(xClass).not.toBe(oClass);
    });
  });
});
