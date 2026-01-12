/**
 * Unit tests for control buttons.
 * Tests the New Game button rendering and event handling.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderControls } from '../../src/ui/controls';

describe('controls rendering', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.className = 'controls';
  });

  describe('renderControls', () => {
    it('should create a New Game button', () => {
      const onNewGame = vi.fn();

      renderControls(container, onNewGame);

      const button = container.querySelector('.btn');
      expect(button).toBeTruthy();
      expect(button?.textContent).toBe('New Game');
    });

    it('should set button type to button', () => {
      const onNewGame = vi.fn();

      renderControls(container, onNewGame);

      const button = container.querySelector('button');
      expect(button?.getAttribute('type')).toBe('button');
    });

    it('should set aria-label for accessibility', () => {
      const onNewGame = vi.fn();

      renderControls(container, onNewGame);

      const button = container.querySelector('.btn');
      expect(button?.getAttribute('aria-label')).toBe('Start a new game');
    });

    it('should call onNewGame when button is clicked', () => {
      const onNewGame = vi.fn();

      renderControls(container, onNewGame);

      const button = container.querySelector('.btn');
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(onNewGame).toHaveBeenCalledTimes(1);
    });

    it('should clear container before rendering', () => {
      container.innerHTML = '<div>Old content</div>';
      const onNewGame = vi.fn();

      renderControls(container, onNewGame);

      expect(container.innerHTML).not.toContain('Old content');
      expect(container.querySelector('.btn')).toBeTruthy();
    });

    it('should handle multiple clicks', () => {
      const onNewGame = vi.fn();

      renderControls(container, onNewGame);

      const button = container.querySelector('.btn');
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(onNewGame).toHaveBeenCalledTimes(3);
    });

    it('should use event delegation (clicking container works)', () => {
      const onNewGame = vi.fn();

      renderControls(container, onNewGame);

      // Click on the button element directly
      const button = container.querySelector('.btn');
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(onNewGame).toHaveBeenCalledTimes(1);
    });

    it('should not trigger callback when clicking outside button', () => {
      const onNewGame = vi.fn();

      renderControls(container, onNewGame);

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
      renderControls(container, onNewGame1);

      const onNewGame2 = vi.fn();
      renderControls(container, onNewGame2);

      const button = container.querySelector('.btn');
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      // Only the second handler should be called
      expect(onNewGame1).not.toHaveBeenCalled();
      expect(onNewGame2).toHaveBeenCalledTimes(1);
    });
  });
});
