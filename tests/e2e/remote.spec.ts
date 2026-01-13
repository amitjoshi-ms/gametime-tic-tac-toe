/**
 * End-to-end tests for Remote Multiplayer mode.
 * Tests the UI flow for creating and joining remote sessions.
 *
 * Note: These tests focus on UI interactions. Full WebRTC connection testing
 * would require mocking or a test signaling server, which is out of scope.
 */

import { test, expect } from '@playwright/test';

test.describe('Remote Multiplayer', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh
    await page.addInitScript(() => {
      localStorage.clear();
    });
    await page.goto('/');
  });

  test.describe('Mode Selection', () => {
    test('should show Remote option in mode selector', async ({ page }) => {
      const remoteOption = page.locator('.mode-selector__option', { hasText: 'Remote' });
      await expect(remoteOption).toBeVisible();
    });

    test('should display remote panel when Remote mode is selected', async ({ page }) => {
      // Click on Remote mode
      const remoteOption = page.locator('.mode-selector__option', { hasText: 'Remote' });
      await remoteOption.click();

      // Remote panel should be visible
      const remotePanel = page.locator('.remote-panel');
      await expect(remotePanel).toBeVisible();
    });

    test('should show select phase with Create and Join options', async ({ page }) => {
      // Select Remote mode
      await page.locator('.mode-selector__option', { hasText: 'Remote' }).click();

      // Should show selection phase
      const createButton = page.getByRole('button', { name: /create game/i });
      const joinButton = page.getByRole('button', { name: /join game/i });

      await expect(createButton).toBeVisible();
      await expect(joinButton).toBeVisible();
    });
  });

  test.describe('Create Session Flow', () => {
    test('should show creating phase when Create is clicked', async ({ page }) => {
      // Select Remote mode and click Create
      await page.locator('.mode-selector__option', { hasText: 'Remote' }).click();
      await page.getByRole('button', { name: /create game/i }).click();

      // Should show creating phase with spinner or waiting indicator
      const remotePanel = page.locator('.remote-panel');
      await expect(remotePanel).toContainText(/creating|waiting|connecting|session/i, {
        timeout: 10000,
      });
    });

    test('should have Cancel button after session is created', async ({ page }) => {
      // Select Remote mode and click Create
      await page.locator('.mode-selector__option', { hasText: 'Remote' }).click();
      await page.getByRole('button', { name: /create game/i }).click();

      // Wait for session to be created (waiting phase has Cancel button)
      // Use longer timeout for CI where WebRTC offer creation can be slow
      await expect(page.locator('.remote-panel')).toContainText(/session:/i, {
        timeout: 30000,
      });

      // Cancel button should be visible in waiting phase
      const cancelButton = page.getByRole('button', { name: /cancel/i });
      await expect(cancelButton).toBeVisible();
    });

    // Note: Cancel functionality tests are skipped until we can mock WebRTC
    // The cancel button works, but the panel state after cancel depends on
    // network operations timing which is hard to test without mocking
  });

  test.describe('Join Session Flow', () => {
    test('should show join phase with code input when Join is clicked', async ({ page }) => {
      // Select Remote mode and click Join
      await page.locator('.mode-selector__option', { hasText: 'Remote' }).click();
      await page.getByRole('button', { name: /join game/i }).click();

      // Should show code input field
      const codeInput = page.locator('.remote-panel__code-input');
      await expect(codeInput).toBeVisible();
    });

    test('should have Back button in join phase', async ({ page }) => {
      // Select Remote mode and click Join
      await page.locator('.mode-selector__option', { hasText: 'Remote' }).click();
      await page.getByRole('button', { name: /join game/i }).click();

      // Back button should be visible
      const backButton = page.getByRole('button', { name: /back/i });
      await expect(backButton).toBeVisible();
    });

    test('should return to select phase when Back is clicked in join', async ({ page }) => {
      // Select Remote mode and click Join
      await page.locator('.mode-selector__option', { hasText: 'Remote' }).click();
      await page.getByRole('button', { name: /join game/i }).click();

      // Click Back
      await page.getByRole('button', { name: /back/i }).click();

      // Should return to select phase
      const createButton = page.getByRole('button', { name: /create game/i });
      await expect(createButton).toBeVisible();
    });

    test('should have Join button to submit session code', async ({ page }) => {
      // Select Remote mode and click Join Game (first from select phase)
      await page.locator('.mode-selector__option', { hasText: 'Remote' }).click();
      
      // Wait for select phase and click Join Game
      const selectJoinButton = page.getByRole('button', { name: /join game/i });
      await expect(selectJoinButton).toBeVisible();
      await selectJoinButton.click();

      // Now in join phase - should have code input
      const codeInput = page.locator('.remote-panel__code-input');
      await expect(codeInput).toBeVisible();

      // And a Join button for submitting the code (type=submit)
      const submitJoinButton = page.getByRole('button', { name: /^join$/i });
      await expect(submitJoinButton).toBeVisible();
    });

    test('should allow typing session code', async ({ page }) => {
      // Select Remote mode and click Join
      await page.locator('.mode-selector__option', { hasText: 'Remote' }).click();
      await page.getByRole('button', { name: /join game/i }).click();

      // Type a code
      const codeInput = page.locator('.remote-panel__code-input');
      await codeInput.fill('TEST123');

      await expect(codeInput).toHaveValue('TEST123');
    });
  });

  test.describe('Mode Switching', () => {
    test('should switch back to Human mode and hide remote panel', async ({ page }) => {
      // Select Remote mode
      await page.locator('.mode-selector__option', { hasText: 'Remote' }).click();
      const remotePanel = page.locator('.remote-panel');
      await expect(remotePanel).toBeVisible();

      // Switch back to Human mode
      await page.locator('.mode-selector__option', { hasText: 'Human' }).click();

      // Remote panel should be hidden
      await expect(remotePanel).not.toBeVisible();
    });

    // Note: Mode switching during active session tests are skipped
    // as they require WebRTC mocking to properly test cancel behavior
  });

  test.describe('Accessibility', () => {
    test('should have accessible button labels', async ({ page }) => {
      // Select Remote mode
      await page.locator('.mode-selector__option', { hasText: 'Remote' }).click();

      // Buttons should be accessible by role and name
      await expect(page.getByRole('button', { name: /create game/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /join game/i })).toBeVisible();
    });

    test('should have accessible code input', async ({ page }) => {
      // Select Remote mode and click Join
      await page.locator('.mode-selector__option', { hasText: 'Remote' }).click();
      await page.getByRole('button', { name: /join game/i }).click();

      // Code input should have appropriate attributes
      const codeInput = page.locator('.remote-panel__code-input');
      await expect(codeInput).toHaveAttribute('placeholder');
    });
  });

  test.describe('Visual States', () => {
    test('should indicate Remote mode is selected', async ({ page }) => {
      // Select Remote mode
      await page.locator('.mode-selector__option', { hasText: 'Remote' }).click();

      // Remote option should have selected class
      const selectedOption = page.locator('.mode-selector__option--selected');
      await expect(selectedOption).toContainText('Remote');
    });
  });
});
