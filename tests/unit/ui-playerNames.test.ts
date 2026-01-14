/**
 * Unit tests for player names UI component.
 * Tests DOM creation, input handling, and remote mode options.
 *
 * @vitest-environment jsdom
 */

/* eslint-disable @typescript-eslint/non-nullable-type-assertion-style */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  renderPlayerNames,
  updatePlayerNames,
  type PlayerConfigChangeHandler,
} from '../../src/ui/playerNames';
import type { PlayerConfigs } from '../../src/game/types';

/**
 * Helper to get the parent .player-config-field element for a given input.
 * Uses parentElement traversal since jsdom may not fully support closest().
 */
function getPlayerField(container: HTMLElement, inputId: string): Element | null {
  const input = container.querySelector(`#${inputId}`);
  if (!input) return null;
  // Traverse up to find the .player-config-field parent
  let element: Element | null = input;
  while (element && element !== container) {
    if (element.classList.contains('player-config-field')) {
      return element;
    }
    element = element.parentElement;
  }
  return null;
}

describe('renderPlayerNames', () => {
  let container: HTMLElement;
  let mockOnChange: PlayerConfigChangeHandler;
  let defaultConfigs: PlayerConfigs;

  beforeEach(() => {
    container = document.createElement('div');
    mockOnChange = vi.fn();
    defaultConfigs = {
      X: { name: 'Player X', symbol: 'X' },
      O: { name: 'Player O', symbol: 'O' },
    };
  });

  it('should create input fields for both players', () => {
    renderPlayerNames(container, defaultConfigs, mockOnChange);

    const xInput = container.querySelector('#player-x-name');
    const oInput = container.querySelector('#player-o-name');

    expect(xInput).toBeTruthy();
    expect(oInput).toBeTruthy();
    expect(xInput).toBeInstanceOf(HTMLInputElement);
    expect(oInput).toBeInstanceOf(HTMLInputElement);
  });

  it('should set correct values from playerConfigs', () => {
    const configs: PlayerConfigs = {
      X: { name: 'Alice', symbol: 'X' },
      O: { name: 'Bob', symbol: 'O' },
    };
    renderPlayerNames(container, configs, mockOnChange);

    const xInput = container.querySelector('#player-x-name') as HTMLInputElement;
    const oInput = container.querySelector('#player-o-name') as HTMLInputElement;

    expect(xInput.value).toBe('Alice');
    expect(oInput.value).toBe('Bob');
  });

  it('should display player marks from symbols', () => {
    const configs: PlayerConfigs = {
      X: { name: 'Alice', symbol: '★' },
      O: { name: 'Bob', symbol: '🔵' },
    };
    renderPlayerNames(container, configs, mockOnChange);

    const xMark = container.querySelector('.player-name-label--x .player-mark');
    const oMark = container.querySelector('.player-name-label--o .player-mark');

    expect(xMark?.textContent).toBe('★');
    expect(oMark?.textContent).toBe('🔵');
  });

  describe('remote mode options', () => {
    it('should hide X field when local player is O', () => {
      renderPlayerNames(container, defaultConfigs, mockOnChange, {
        isRemoteMode: true,
        localPlayerSymbol: 'O',
      });

      const xField = getPlayerField(container, 'player-x-name');
      const oField = getPlayerField(container, 'player-o-name');

      expect(xField?.classList.contains('player-config-field--hidden')).toBe(true);
      expect(oField?.classList.contains('player-config-field--hidden')).toBe(false);
    });

    it('should hide O field when local player is X', () => {
      renderPlayerNames(container, defaultConfigs, mockOnChange, {
        isRemoteMode: true,
        localPlayerSymbol: 'X',
      });

      const xField = getPlayerField(container, 'player-x-name');
      const oField = getPlayerField(container, 'player-o-name');

      expect(xField?.classList.contains('player-config-field--hidden')).toBe(false);
      expect(oField?.classList.contains('player-config-field--hidden')).toBe(true);
    });

    it('should add hidden class to field in remote mode', () => {
      renderPlayerNames(container, defaultConfigs, mockOnChange, {
        isRemoteMode: true,
        localPlayerSymbol: 'X',
      });

      const xField = getPlayerField(container, 'player-x-name');
      const oField = getPlayerField(container, 'player-o-name');

      expect(xField?.classList.contains('player-config-field--hidden')).toBe(false);
      expect(oField?.classList.contains('player-config-field--hidden')).toBe(true);
    });

    it('should show both fields when not in remote mode', () => {
      renderPlayerNames(container, defaultConfigs, mockOnChange, {
        isRemoteMode: false,
      });

      const xField = getPlayerField(container, 'player-x-name');
      const oField = getPlayerField(container, 'player-o-name');

      expect(xField?.classList.contains('player-config-field--hidden')).toBe(false);
      expect(oField?.classList.contains('player-config-field--hidden')).toBe(false);
    });

    it('should show both fields when options not provided', () => {
      renderPlayerNames(container, defaultConfigs, mockOnChange);

      const xField = getPlayerField(container, 'player-x-name');
      const oField = getPlayerField(container, 'player-o-name');

      expect(xField?.classList.contains('player-config-field--hidden')).toBe(false);
      expect(oField?.classList.contains('player-config-field--hidden')).toBe(false);
    });
  });
});

describe('updatePlayerNames', () => {
  let container: HTMLElement;
  let mockOnChange: PlayerConfigChangeHandler;
  let defaultConfigs: PlayerConfigs;

  beforeEach(() => {
    container = document.createElement('div');
    mockOnChange = vi.fn();
    defaultConfigs = {
      X: { name: 'Player X', symbol: 'X' },
      O: { name: 'Player O', symbol: 'O' },
    };
    // Initial render
    renderPlayerNames(container, defaultConfigs, mockOnChange);
  });

  it('should update input values', () => {
    const newConfigs: PlayerConfigs = {
      X: { name: 'Alice', symbol: 'X' },
      O: { name: 'Bob', symbol: 'O' },
    };
    updatePlayerNames(container, newConfigs);

    const xInput = container.querySelector('#player-x-name') as HTMLInputElement;
    const oInput = container.querySelector('#player-o-name') as HTMLInputElement;

    expect(xInput.value).toBe('Alice');
    expect(oInput.value).toBe('Bob');
  });

  it('should update player marks', () => {
    const newConfigs: PlayerConfigs = {
      X: { name: 'Alice', symbol: '★' },
      O: { name: 'Bob', symbol: '🔵' },
    };
    updatePlayerNames(container, newConfigs);

    const xMark = container.querySelector('.player-name-label--x .player-mark');
    const oMark = container.querySelector('.player-name-label--o .player-mark');

    expect(xMark?.textContent).toBe('★');
    expect(oMark?.textContent).toBe('🔵');
  });

  describe('with remote mode options', () => {
    it('should hide remote player field on update', () => {
      // Start in non-remote mode
      renderPlayerNames(container, defaultConfigs, mockOnChange);

      // Update with remote mode options
      updatePlayerNames(container, defaultConfigs, {
        isRemoteMode: true,
        localPlayerSymbol: 'X',
      });

      const xField = getPlayerField(container, 'player-x-name');
      const oField = getPlayerField(container, 'player-o-name');

      expect(xField?.classList.contains('player-config-field--hidden')).toBe(false);
      expect(oField?.classList.contains('player-config-field--hidden')).toBe(true);
    });

    it('should update hidden class on fields', () => {
      // Start in non-remote mode
      renderPlayerNames(container, defaultConfigs, mockOnChange);

      // Update with remote mode options
      updatePlayerNames(container, defaultConfigs, {
        isRemoteMode: true,
        localPlayerSymbol: 'O',
      });

      const xField = getPlayerField(container, 'player-x-name');
      const oField = getPlayerField(container, 'player-o-name');

      expect(xField?.classList.contains('player-config-field--hidden')).toBe(true);
      expect(oField?.classList.contains('player-config-field--hidden')).toBe(false);
    });

    it('should use stored options if not provided on update', () => {
      // Render with remote mode options
      renderPlayerNames(container, defaultConfigs, mockOnChange, {
        isRemoteMode: true,
        localPlayerSymbol: 'X',
      });

      // Update without options - should preserve remote mode
      const newConfigs: PlayerConfigs = {
        X: { name: 'Alice', symbol: 'X' },
        O: { name: 'Bob', symbol: 'O' },
      };
      updatePlayerNames(container, newConfigs);

      const oField = getPlayerField(container, 'player-o-name');
      // Should still be hidden from stored options
      expect(oField?.classList.contains('player-config-field--hidden')).toBe(true);
    });
  });
});
