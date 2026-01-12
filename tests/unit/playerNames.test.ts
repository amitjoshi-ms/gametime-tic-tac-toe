/**
 * Unit tests for player names management.
 * Tests storage, loading, and persistence of custom player names.
 * Includes tests for demo mode player names.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getDefaultPlayerNames,
  loadPlayerNames,
  savePlayerNames,
  resetPlayerNames,
  getDemoPlayerNames,
  DEFAULT_DEMO_X_NAME,
  DEFAULT_DEMO_O_NAME,
} from '../../src/game/playerNames';

// Mock localStorage
const localStorageMock = ((): Storage => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string): void => {
      store[key] = value;
    },
    removeItem: (key: string): void => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
    key: (): null => null,
    length: 0,
  };
})();

beforeEach(() => {
  // Reset localStorage before each test
  localStorageMock.clear();
  vi.stubGlobal('localStorage', localStorageMock);
});

describe('getDefaultPlayerNames', () => {
  it('should return default player names', () => {
    const defaults = getDefaultPlayerNames();
    expect(defaults.X).toBe('Player X');
    expect(defaults.O).toBe('Player O');
  });

  it('should return a new object each time', () => {
    const defaults1 = getDefaultPlayerNames();
    const defaults2 = getDefaultPlayerNames();
    expect(defaults1).not.toBe(defaults2);
    expect(defaults1).toEqual(defaults2);
  });
});

describe('loadPlayerNames', () => {
  it('should return default names when localStorage is empty', () => {
    const names = loadPlayerNames();
    expect(names.X).toBe('Player X');
    expect(names.O).toBe('Player O');
  });

  it('should load saved names from localStorage', () => {
    const customNames = { X: 'Alice', O: 'Bob' };
    savePlayerNames(customNames);

    const loaded = loadPlayerNames();
    expect(loaded.X).toBe('Alice');
    expect(loaded.O).toBe('Bob');
  });

  it('should handle corrupted localStorage data gracefully', () => {
    localStorage.setItem('tictactoe_player_names', 'invalid json');

    const names = loadPlayerNames();
    expect(names.X).toBe('Player X');
    expect(names.O).toBe('Player O');
  });
});

describe('savePlayerNames', () => {
  it('should save player names to localStorage', () => {
    const names = { X: 'Alice', O: 'Bob' };
    savePlayerNames(names);

    const stored = localStorage.getItem('tictactoe_player_names');
    expect(stored).toBeTruthy();
    if (stored) {
      expect(JSON.parse(stored)).toEqual(names);
    }
  });

  it('should overwrite existing names', () => {
    savePlayerNames({ X: 'Alice', O: 'Bob' });
    savePlayerNames({ X: 'Charlie', O: 'Diana' });

    const loaded = loadPlayerNames();
    expect(loaded.X).toBe('Charlie');
    expect(loaded.O).toBe('Diana');
  });
});

describe('resetPlayerNames', () => {
  it('should reset names to defaults', () => {
    savePlayerNames({ X: 'Alice', O: 'Bob' });

    const reset = resetPlayerNames();
    expect(reset.X).toBe('Player X');
    expect(reset.O).toBe('Player O');
  });

  it('should persist reset to localStorage', () => {
    savePlayerNames({ X: 'Alice', O: 'Bob' });
    resetPlayerNames();

    const loaded = loadPlayerNames();
    expect(loaded.X).toBe('Player X');
    expect(loaded.O).toBe('Player O');
  });
});

describe('getDemoPlayerNames', () => {
  it('should return demo default names', () => {
    const names = getDemoPlayerNames();
    expect(names.X).toBe(DEFAULT_DEMO_X_NAME);
    expect(names.O).toBe(DEFAULT_DEMO_O_NAME);
  });

  it('should return a new object each time', () => {
    const names1 = getDemoPlayerNames();
    const names2 = getDemoPlayerNames();
    expect(names1).not.toBe(names2);
  });
});

describe('demo name constants', () => {
  it('should have correct default demo X name', () => {
    expect(DEFAULT_DEMO_X_NAME).toBe('Computer X');
  });

  it('should have correct default demo O name', () => {
    expect(DEFAULT_DEMO_O_NAME).toBe('Computer O');
  });
});
