/**
 * Unit tests for control buttons.
 * Tests the New Game button rendering and event handling.
 * 
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderControls, updateControls, type ControlsOptions } from '../../src/ui/controls';

describe('controls rendering', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.className = 'controls';
  });

  describe('renderControls', () => {
    it('should create a New Game button', () => {
      const onNewGame = vi.fn();
      const onDemoToggle = vi.fn();

      renderControls(container, onNewGame, onDemoToggle, false);

      const button = container.querySelector('.btn-new-game');
      expect(button).toBeTruthy();
      expect(button?.textContent).toBe('New Game');
    });

    it('should set button type to button', () => {
      const onNewGame = vi.fn();
      const onDemoToggle = vi.fn();

      renderControls(container, onNewGame, onDemoToggle, false);

      const button = container.querySelector('button');
      expect(button?.getAttribute('type')).toBe('button');
    });

    it('should set aria-label for accessibility', () => {
      const onNewGame = vi.fn();
      const onDemoToggle = vi.fn();

      renderControls(container, onNewGame, onDemoToggle, false);

      const button = container.querySelector('.btn-new-game');
      expect(button?.getAttribute('aria-label')).toBe('Start a new game');
    });

    it('should call onNewGame when button is clicked', () => {
      const onNewGame = vi.fn();
      const onDemoToggle = vi.fn();

      renderControls(container, onNewGame, onDemoToggle, false);

      const button = container.querySelector('.btn-new-game');
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(onNewGame).toHaveBeenCalledTimes(1);
    });

    it('should clear container before rendering', () => {
      container.innerHTML = '<div>Old content</div>';
      const onNewGame = vi.fn();
      const onDemoToggle = vi.fn();

      renderControls(container, onNewGame, onDemoToggle, false);

      expect(container.innerHTML).not.toContain('Old content');
      expect(container.querySelector('.btn')).toBeTruthy();
    });

    it('should handle multiple clicks', () => {
      const onNewGame = vi.fn();
      const onDemoToggle = vi.fn();

      renderControls(container, onNewGame, onDemoToggle, false);

      const button = container.querySelector('.btn-new-game');
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(onNewGame).toHaveBeenCalledTimes(3);
    });

    it('should use event delegation (clicking container works)', () => {
      const onNewGame = vi.fn();
      const onDemoToggle = vi.fn();

      renderControls(container, onNewGame, onDemoToggle, false);

      // Click on the button element directly
      const button = container.querySelector('.btn-new-game');
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(onNewGame).toHaveBeenCalledTimes(1);
    });

    it('should not trigger callback when clicking outside button', () => {
      const onNewGame = vi.fn();
      const onDemoToggle = vi.fn();

      renderControls(container, onNewGame, onDemoToggle, false);

      // Add extra content
      const extraDiv = document.createElement('div');
      extraDiv.className = 'other';
      container.appendChild(extraDiv);

      // Click on the extra div
      extraDiv.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(onNewGame).not.toHaveBeenCalled();
    });

    it('should support re-rendering with different handler', () => {
      const onNewGame1 = vi.fn();
      const onDemoToggle = vi.fn();
      renderControls(container, onNewGame1, onDemoToggle, false);

      const onNewGame2 = vi.fn();
      renderControls(container, onNewGame2, onDemoToggle, false);

      const button = container.querySelector('.btn-new-game');
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      // Only the second handler should be called
      expect(onNewGame1).not.toHaveBeenCalled();
      expect(onNewGame2).toHaveBeenCalledTimes(1);
    });
  });

  describe('remote mode behavior', () => {
    it('should show "Request Rematch" instead of "New Game" when game is over in remote mode', () => {
      const onNewGame = vi.fn();
      const onDemoToggle = vi.fn();
      const options: ControlsOptions = {
        isDemoActive: false,
        gameMode: 'remote',
        gameStatus: 'x-wins',
        isRematchPending: false,
      };

      renderControls(container, onNewGame, onDemoToggle, options);

      const button = container.querySelector('.btn-new-game');
      expect(button?.textContent).toBe('Request Rematch');
      expect(button?.getAttribute('aria-label')).toBe('Request a rematch with opponent');
    });

    it('should show "Rematch Requested..." when rematch is pending', () => {
      const onNewGame = vi.fn();
      const onDemoToggle = vi.fn();
      const options: ControlsOptions = {
        isDemoActive: false,
        gameMode: 'remote',
        gameStatus: 'x-wins',
        isRematchPending: true,
      };

      renderControls(container, onNewGame, onDemoToggle, options);

      const button = container.querySelector('.btn-new-game') as HTMLButtonElement;
      expect(button?.textContent).toBe('Rematch Requested...');
      expect(button?.disabled).toBe(true);
    });

    it('should hide demo button in remote mode', () => {
      const onNewGame = vi.fn();
      const onDemoToggle = vi.fn();
      const options: ControlsOptions = {
        isDemoActive: false,
        gameMode: 'remote',
        gameStatus: 'playing',
      };

      renderControls(container, onNewGame, onDemoToggle, options);

      const demoBtn = container.querySelector('.btn-demo');
      expect(demoBtn).toBeNull();
    });

    it('should show demo button in human mode', () => {
      const onNewGame = vi.fn();
      const onDemoToggle = vi.fn();
      const options: ControlsOptions = {
        isDemoActive: false,
        gameMode: 'human',
        gameStatus: 'playing',
      };

      renderControls(container, onNewGame, onDemoToggle, options);

      const demoBtn = container.querySelector('.btn-demo');
      expect(demoBtn).not.toBeNull();
    });

    it('should show "New Game" during playing state in remote mode', () => {
      const onNewGame = vi.fn();
      const onDemoToggle = vi.fn();
      const options: ControlsOptions = {
        isDemoActive: false,
        gameMode: 'remote',
        gameStatus: 'playing',
      };

      renderControls(container, onNewGame, onDemoToggle, options);

      const button = container.querySelector('.btn-new-game');
      expect(button?.textContent).toBe('New Game');
    });

    it('should call onNewGame handler when Request Rematch is clicked', () => {
      const onNewGame = vi.fn();
      const onDemoToggle = vi.fn();
      const options: ControlsOptions = {
        isDemoActive: false,
        gameMode: 'remote',
        gameStatus: 'o-wins',
        isRematchPending: false,
      };

      renderControls(container, onNewGame, onDemoToggle, options);

      const button = container.querySelector('.btn-new-game');
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(onNewGame).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateControls in remote mode', () => {
    it('should update button to "Request Rematch" when game ends', () => {
      const onNewGame = vi.fn();
      const onDemoToggle = vi.fn();
      
      // Start with playing state
      renderControls(container, onNewGame, onDemoToggle, {
        isDemoActive: false,
        gameMode: 'remote',
        gameStatus: 'playing',
      });

      expect(container.querySelector('.btn-new-game')?.textContent).toBe('New Game');

      // Game ends
      updateControls(container, {
        isDemoActive: false,
        gameMode: 'remote',
        gameStatus: 'x-wins',
        isRematchPending: false,
      });

      expect(container.querySelector('.btn-new-game')?.textContent).toBe('Request Rematch');
    });

    it('should update button to disabled when rematch pending', () => {
      const onNewGame = vi.fn();
      const onDemoToggle = vi.fn();
      
      renderControls(container, onNewGame, onDemoToggle, {
        isDemoActive: false,
        gameMode: 'remote',
        gameStatus: 'x-wins',
        isRematchPending: false,
      });

      const button = container.querySelector('.btn-new-game') as HTMLButtonElement;
      expect(button?.disabled).toBe(false);

      updateControls(container, {
        isDemoActive: false,
        gameMode: 'remote',
        gameStatus: 'x-wins',
        isRematchPending: true,
      });

      expect(button?.disabled).toBe(true);
      expect(button?.textContent).toBe('Rematch Requested...');
    });

    it('should restore "New Game" when game resets after rematch', () => {
      const onNewGame = vi.fn();
      const onDemoToggle = vi.fn();
      
      // Game is over with rematch pending
      renderControls(container, onNewGame, onDemoToggle, {
        isDemoActive: false,
        gameMode: 'remote',
        gameStatus: 'x-wins',
        isRematchPending: true,
      });

      // Rematch accepted, game resets to playing
      updateControls(container, {
        isDemoActive: false,
        gameMode: 'remote',
        gameStatus: 'playing',
        isRematchPending: false,
      });

      const button = container.querySelector('.btn-new-game') as HTMLButtonElement;
      expect(button?.textContent).toBe('New Game');
      expect(button?.disabled).toBe(false);
    });

    it('should hide demo button in remote mode via updateControls', () => {
      const onNewGame = vi.fn();
      const onDemoToggle = vi.fn();
      
      // Start in human mode with demo button visible
      renderControls(container, onNewGame, onDemoToggle, {
        isDemoActive: false,
        gameMode: 'human',
        gameStatus: 'playing',
      });

      const demoBtn = container.querySelector('.btn-demo') as HTMLButtonElement;
      expect(demoBtn).not.toBeNull();
      expect(demoBtn?.style.display).not.toBe('none');

      // Switch to remote mode
      updateControls(container, {
        isDemoActive: false,
        gameMode: 'remote',
        gameStatus: 'playing',
      });

      expect(demoBtn?.style.display).toBe('none');
    });
  });});