/**
 * End-to-end tests for Demo Mode.
 * Tests computer vs computer gameplay with auto-restart functionality.
 *
 * @module tests/e2e/demo
 */

import { test, expect } from '@playwright/test';

test.describe('Demo Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh
    await page.addInitScript(() => {
      localStorage.clear();
    });
    await page.goto('/');
  });

  test.describe('Demo Button', () => {
    test('should display a Start Demo button', async ({ page }) => {
      const demoButton = page.getByRole('button', { name: /start demo/i });
      await expect(demoButton).toBeVisible();
    });

    test('should change to Stop Demo when demo is active', async ({ page }) => {
      const demoButton = page.getByRole('button', { name: /start demo/i });
      await demoButton.click();

      await expect(
        page.getByRole('button', { name: /stop demo/i })
      ).toBeVisible();
    });

    test('should change back to Start Demo when demo is stopped', async ({
      page,
    }) => {
      // Start demo
      const startButton = page.getByRole('button', { name: /start demo/i });
      await startButton.click();

      // Stop demo
      const stopButton = page.getByRole('button', { name: /stop demo/i });
      await stopButton.click();

      // Should show Start Demo again
      await expect(
        page.getByRole('button', { name: /start demo/i })
      ).toBeVisible();
    });
  });

  test.describe('Demo Start', () => {
    test('should start demo on button click', async ({ page }) => {
      const demoButton = page.getByRole('button', { name: /start demo/i });
      await demoButton.click();

      // Verify demo indicator appears in status
      await expect(page.locator('.status')).toContainText('🎬');
    });

    test('should show demo indicator prefix in status messages', async ({
      page,
    }) => {
      await page.getByRole('button', { name: /start demo/i }).click();

      // Status should show demo prefix
      const status = page.locator('.status');
      await expect(status).toContainText('🎬');
    });

    test('should disable mode selector during demo', async ({ page }) => {
      await page.getByRole('button', { name: /start demo/i }).click();

      // Check the fieldset has the disabled attribute
      const modeSelector = page.locator('.mode-selector');
      await expect(modeSelector).toHaveAttribute('disabled', '');
    });
  });

  test.describe('Demo Stop', () => {
    test('should stop demo on button click', async ({ page }) => {
      // Start demo
      await page.getByRole('button', { name: /start demo/i }).click();

      // Stop demo
      await page.getByRole('button', { name: /stop demo/i }).click();

      // Demo indicator should be gone
      await expect(page.locator('.status')).not.toContainText('🎬');
    });

    test('should re-enable mode selector when demo stops', async ({ page }) => {
      // Start demo
      await page.getByRole('button', { name: /start demo/i }).click();
      await expect(page.locator('.mode-selector')).toHaveAttribute(
        'disabled',
        ''
      );

      // Stop demo
      await page.getByRole('button', { name: /stop demo/i }).click();

      // Mode selector should be enabled again (no disabled attribute)
      await expect(page.locator('.mode-selector')).not.toHaveAttribute(
        'disabled'
      );
    });
  });

  test.describe('Cell Clicks Blocked', () => {
    test('should ignore cell clicks during demo mode', async ({ page }) => {
      // Start demo
      await page.getByRole('button', { name: /start demo/i }).click();

      // Wait for demo to settle
      await page.waitForTimeout(500);

      // Try to click on a cell using force since cells may be disabled during thinking
      const firstCell = page.locator('.cell').first();
      await firstCell.click({ force: true, timeout: 1000 }).catch(() => {
        // Expected - cells might be disabled/blocked
      });

      // Wait a moment to ensure no human move registered
      await page.waitForTimeout(100);

      // The demo should continue autonomously - human clicks ignored
      // We verify by checking that the demo indicator is still present
      await expect(page.locator('.status')).toContainText('🎬');
    });
  });

  test.describe('Computer Moves', () => {
    test('should make automatic moves with delays', async ({ page }) => {
      await page.getByRole('button', { name: /start demo/i }).click();

      // Wait for at least one move to happen (2 second delay + buffer)
      await page.waitForTimeout(2500);

      // Check that at least one cell has been filled
      const cells = page.locator('.cell');
      let filledCells = 0;
      for (let i = 0; i < 9; i++) {
        const text = await cells.nth(i).textContent();
        if (text === 'X' || text === 'O') {
          filledCells++;
        }
      }

      // At least one move should have been made
      expect(filledCells).toBeGreaterThan(0);
    });

    test('should alternate between X and O', async ({ page }) => {
      await page.getByRole('button', { name: /start demo/i }).click();

      // Wait for a few moves (at least 2)
      await page.waitForTimeout(5000);

      const cells = page.locator('.cell');
      let xCount = 0;
      let oCount = 0;

      for (let i = 0; i < 9; i++) {
        const text = await cells.nth(i).textContent();
        if (text === 'X') xCount++;
        if (text === 'O') oCount++;
      }

      // X and O counts should be close (X goes first, so could have one more)
      expect(Math.abs(xCount - oCount)).toBeLessThanOrEqual(1);
      expect(xCount + oCount).toBeGreaterThanOrEqual(2);
    });
  });

  test.describe('Custom Names', () => {
    test('should display custom player names in demo status', async ({
      page,
    }) => {
      // First, set custom names before starting demo
      const xInput = page.locator('#player-x-name');
      const oInput = page.locator('#player-o-name');

      await xInput.clear();
      await xInput.fill('Alpha Bot');
      await oInput.clear();
      await oInput.fill('Beta Bot');

      // Wait for the inputs to register
      await page.waitForTimeout(100);

      // Start demo
      await page.getByRole('button', { name: /start demo/i }).click();

      // Wait for status to update with demo prefix
      await expect(page.locator('.status')).toContainText('🎬');

      // Status should contain one of our custom names (whichever's turn it is)
      // Use a polling assertion since names might take a moment to appear
      await expect(async () => {
        const status = await page.locator('.status').textContent();
        const hasCustomName =
          (status?.includes('Alpha Bot') ?? false) ||
          (status?.includes('Beta Bot') ?? false);
        expect(hasCustomName).toBe(true);
      }).toPass({ timeout: 3000 });
    });
  });

  test.describe('Game Completion and Auto-Restart', () => {
    // Use longer timeout for these tests since games take time
    test.setTimeout(60000);

    test('should show result after game completes', async ({ page }) => {
      await page.getByRole('button', { name: /start demo/i }).click();

      // Wait for game to potentially complete (max 9 moves * 2 sec + buffer)
      // We'll check periodically for a result
      const status = page.locator('.status');

      // Wait up to 25 seconds for a game result
      await expect(async () => {
        const text = await status.textContent();
        const hasResult =
          (text?.includes('Wins!') ?? false) ||
          (text?.includes('Draw') ?? false) ||
          (text?.includes('wins') ?? false);
        expect(hasResult).toBe(true);
      }).toPass({ timeout: 25000 });

      // Verify demo indicator is still present
      await expect(status).toContainText('🎬');
    });

    test('should auto-restart after result display', async ({ page }) => {
      await page.getByRole('button', { name: /start demo/i }).click();

      const status = page.locator('.status');

      // Wait for first game to complete
      await expect(async () => {
        const text = await status.textContent();
        const hasResult =
          (text?.includes('Wins!') ?? false) ||
          (text?.includes('Draw') ?? false) ||
          (text?.includes('wins') ?? false);
        expect(hasResult).toBe(true);
      }).toPass({ timeout: 25000 });

      // Wait for auto-restart (15 second display + 2 second first move + buffer)
      // After restart, status should show a turn message or thinking state
      await expect(async () => {
        const text = await status.textContent();
        const hasNewGame =
          (text?.includes('Turn') ?? false) ||
          (text?.includes('thinking') ?? false);
        const isNotResult =
          !(text?.includes('Wins!') ?? false) &&
          !(text?.includes('Draw') ?? false);
        expect(hasNewGame && isNotResult).toBe(true);
      }).toPass({ timeout: 25000 });
    });

    test('should stop auto-restart if demo is stopped during result display', async ({
      page,
    }) => {
      await page.getByRole('button', { name: /start demo/i }).click();

      const status = page.locator('.status');

      // Wait for game to complete
      await expect(async () => {
        const text = await status.textContent();
        const hasResult =
          (text?.includes('Wins!') ?? false) ||
          (text?.includes('Draw') ?? false) ||
          (text?.includes('wins') ?? false);
        expect(hasResult).toBe(true);
      }).toPass({ timeout: 25000 });

      // Stop demo during result display
      await page.getByRole('button', { name: /stop demo/i }).click();

      // Wait a bit to verify demo doesn't restart
      await page.waitForTimeout(2000);

      // Demo should not have restarted (no demo indicator)
      await expect(status).not.toContainText('🎬');
    });
  });

  test.describe('Mode Restoration', () => {
    test('should restore previous mode when demo stops', async ({ page }) => {
      // Select Computer mode by clicking on the label element directly
      const computerOption = page.locator(
        '.mode-selector__option:has-text("Computer")'
      );
      await computerOption.click();
      await expect(
        page.locator('.mode-selector__option--selected')
      ).toContainText('Computer');

      // Start and stop demo
      await page.getByRole('button', { name: /start demo/i }).click();
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: /stop demo/i }).click();

      // Should be back in Computer mode
      await expect(
        page.locator('.mode-selector__option--selected')
      ).toContainText('Computer');
    });

    test('should restore Human mode if that was selected before demo', async ({
      page,
    }) => {
      // Human mode is default
      await expect(
        page.locator('.mode-selector__option--selected')
      ).toContainText('Human');

      // Start and stop demo
      await page.getByRole('button', { name: /start demo/i }).click();
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: /stop demo/i }).click();

      // Should be back in Human mode
      await expect(
        page.locator('.mode-selector__option--selected')
      ).toContainText('Human');
    });
  });
});
