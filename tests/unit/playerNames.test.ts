/**
 * Unit tests for player names management.
 * Tests storage, loading, and persistence of custom player names and configs.
 * Includes tests for demo mode player names.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getDefaultPlayerNames,
  loadPlayerNames,
  savePlayerNames,
  resetPlayerNames,
  validatePlayerConfigs,
  loadPlayerConfigs,
  savePlayerConfigs,
  getDefaultPlayerConfigs,
} from '../../src/game/playerNames';
import type { PlayerConfigs, PlayerSymbol } from '../../src/game/types';

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

/* eslint-disable @typescript-eslint/no-deprecated */
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

    // Deprecated savePlayerNames now saves to player_configs key with full config
    const stored = localStorage.getItem('tictactoe_player_configs');
    expect(stored).toBeTruthy();
    if (stored) {
      const parsed = JSON.parse(stored) as { X: { name: string }; O: { name: string } };
      expect(parsed.X.name).toBe('Alice');
      expect(parsed.O.name).toBe('Bob');
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
/* eslint-enable @typescript-eslint/no-deprecated */

describe('validatePlayerConfigs', () => {
  it('should return true for valid configs with different symbols', () => {
    const validConfigs: PlayerConfigs = {
      X: { name: 'Alice', symbol: 'X' },
      O: { name: 'Bob', symbol: 'O' },
    };
    expect(validatePlayerConfigs(validConfigs)).toBe(true);
  });

  it('should return true for valid configs with custom symbols', () => {
    const validConfigs: PlayerConfigs = {
      X: { name: 'Player 1', symbol: '★' },
      O: { name: 'Player 2', symbol: '🔵' },
    };
    expect(validatePlayerConfigs(validConfigs)).toBe(true);
  });

  it('should return false for configs with duplicate symbols', () => {
    const invalidConfigs: PlayerConfigs = {
      X: { name: 'Alice', symbol: 'X' },
      O: { name: 'Bob', symbol: 'X' }, // Same symbol as X
    };
    expect(validatePlayerConfigs(invalidConfigs)).toBe(false);
  });

  it('should return false for configs with invalid symbols', () => {
    const invalidConfigs = {
      X: { name: 'Alice', symbol: 'Z' as unknown as PlayerSymbol }, // Not in AVAILABLE_SYMBOLS
      O: { name: 'Bob', symbol: 'O' },
    } as PlayerConfigs;
    expect(validatePlayerConfigs(invalidConfigs)).toBe(false);
  });

  it('should return false for null configs', () => {
    expect(validatePlayerConfigs(null as unknown as PlayerConfigs)).toBe(false);
  });

  it('should return false for undefined configs', () => {
    expect(validatePlayerConfigs(undefined as unknown as PlayerConfigs)).toBe(false);
  });

  it('should return false for non-object configs', () => {
    expect(validatePlayerConfigs('string' as unknown as PlayerConfigs)).toBe(false);
    expect(validatePlayerConfigs(123 as unknown as PlayerConfigs)).toBe(false);
  });

  it('should return false for configs missing X property', () => {
    const invalidConfigs = {
      O: { name: 'Bob', symbol: 'O' },
    } as unknown as PlayerConfigs;
    expect(validatePlayerConfigs(invalidConfigs)).toBe(false);
  });

  it('should return false for configs missing O property', () => {
    const invalidConfigs = {
      X: { name: 'Alice', symbol: 'X' },
    } as unknown as PlayerConfigs;
    expect(validatePlayerConfigs(invalidConfigs)).toBe(false);
  });

  it('should return false for configs with non-string symbol', () => {
    const invalidConfigs = {
      X: { name: 'Alice', symbol: 123 },
      O: { name: 'Bob', symbol: 'O' },
    } as unknown as PlayerConfigs;
    expect(validatePlayerConfigs(invalidConfigs)).toBe(false);
  });

  it('should return false for configs with non-string name', () => {
    const invalidConfigs = {
      X: { name: 123, symbol: 'X' },
      O: { name: 'Bob', symbol: 'O' },
    } as unknown as PlayerConfigs;
    expect(validatePlayerConfigs(invalidConfigs)).toBe(false);
  });

  it('should return false for configs with missing symbol property', () => {
    const invalidConfigs = {
      X: { name: 'Alice' },
      O: { name: 'Bob', symbol: 'O' },
    } as unknown as PlayerConfigs;
    expect(validatePlayerConfigs(invalidConfigs)).toBe(false);
  });

  it('should return false for configs with missing name property', () => {
    const invalidConfigs = {
      X: { symbol: 'X' },
      O: { name: 'Bob', symbol: 'O' },
    } as unknown as PlayerConfigs;
    expect(validatePlayerConfigs(invalidConfigs)).toBe(false);
  });
});

describe('loadPlayerConfigs', () => {
  it('should return default configs when localStorage is empty', () => {
    const configs = loadPlayerConfigs();
    const defaults = getDefaultPlayerConfigs();
    
    expect(configs.X.name).toBe(defaults.X.name);
    expect(configs.X.symbol).toBe(defaults.X.symbol);
    expect(configs.O.name).toBe(defaults.O.name);
    expect(configs.O.symbol).toBe(defaults.O.symbol);
  });

  it('should load valid configs from localStorage', () => {
    const customConfigs: PlayerConfigs = {
      X: { name: 'Alice', symbol: '★' },
      O: { name: 'Bob', symbol: '🔵' },
    };
    savePlayerConfigs(customConfigs);

    const loaded = loadPlayerConfigs();
    expect(loaded.X.name).toBe('Alice');
    expect(loaded.X.symbol).toBe('★');
    expect(loaded.O.name).toBe('Bob');
    expect(loaded.O.symbol).toBe('🔵');
  });

  it('should return defaults when stored data is invalid', () => {
    const invalidConfigs = {
      X: { name: 'Alice', symbol: 'X' },
      O: { name: 'Bob', symbol: 'X' }, // Same symbol - invalid
    };
    localStorage.setItem('tictactoe_player_configs', JSON.stringify(invalidConfigs));

    const loaded = loadPlayerConfigs();
    const defaults = getDefaultPlayerConfigs();
    expect(loaded).toEqual(defaults);
  });

  it('should return defaults when stored data is corrupted', () => {
    localStorage.setItem('tictactoe_player_configs', 'invalid json');

    const loaded = loadPlayerConfigs();
    const defaults = getDefaultPlayerConfigs();
    expect(loaded).toEqual(defaults);
  });

  it('should migrate from legacy PlayerNames format', () => {
    const legacyNames = { X: 'Alice', O: 'Bob' };
    localStorage.setItem('tictactoe_player_names', JSON.stringify(legacyNames));

    const loaded = loadPlayerConfigs();
    expect(loaded.X.name).toBe('Alice');
    expect(loaded.X.symbol).toBe('X'); // Default symbol
    expect(loaded.O.name).toBe('Bob');
    expect(loaded.O.symbol).toBe('O'); // Default symbol
  });

  it('should save migrated data to new storage key', () => {
    const legacyNames = { X: 'Charlie', O: 'Diana' };
    localStorage.setItem('tictactoe_player_names', JSON.stringify(legacyNames));

    loadPlayerConfigs();

    const stored = localStorage.getItem('tictactoe_player_configs');
    expect(stored).toBeTruthy();
    if (stored) {
      const parsed = JSON.parse(stored) as { X: { name: string }; O: { name: string } };
      expect(parsed.X.name).toBe('Charlie');
      expect(parsed.O.name).toBe('Diana');
    }
  });

  it('should prefer new format over legacy format', () => {
    // Set both formats
    const legacyNames = { X: 'Old X', O: 'Old O' };
    localStorage.setItem('tictactoe_player_names', JSON.stringify(legacyNames));

    const newConfigs: PlayerConfigs = {
      X: { name: 'New X', symbol: '★' },
      O: { name: 'New O', symbol: '🔵' },
    };
    localStorage.setItem('tictactoe_player_configs', JSON.stringify(newConfigs));

    const loaded = loadPlayerConfigs();
    expect(loaded.X.name).toBe('New X');
    expect(loaded.X.symbol).toBe('★');
  });

  it('should handle missing legacy data gracefully', () => {
    // No data in either format
    const loaded = loadPlayerConfigs();
    const defaults = getDefaultPlayerConfigs();
    expect(loaded).toEqual(defaults);
  });

  it('should validate migrated data before returning', () => {
    // This tests that even if legacy data exists, it still validates the result
    const legacyNames = { X: 'Alice', O: 'Bob' };
    localStorage.setItem('tictactoe_player_names', JSON.stringify(legacyNames));

    const loaded = loadPlayerConfigs();
    // Should have valid structure
    expect(validatePlayerConfigs(loaded)).toBe(true);
  });
});

describe('savePlayerConfigs', () => {
  it('should save valid configs to localStorage', () => {
    const configs: PlayerConfigs = {
      X: { name: 'Alice', symbol: '★' },
      O: { name: 'Bob', symbol: '🔵' },
    };
    savePlayerConfigs(configs);

    const stored = localStorage.getItem('tictactoe_player_configs');
    expect(stored).toBeTruthy();
    if (stored) {
      const parsed = JSON.parse(stored) as { X: { name: string; symbol: string }; O: { name: string; symbol: string } };
      expect(parsed.X.name).toBe('Alice');
      expect(parsed.X.symbol).toBe('★');
      expect(parsed.O.name).toBe('Bob');
      expect(parsed.O.symbol).toBe('🔵');
    }
  });

  it('should not save invalid configs', () => {
    const invalidConfigs = {
      X: { name: 'Alice', symbol: 'X' },
      O: { name: 'Bob', symbol: 'X' }, // Same symbol - invalid
    } as PlayerConfigs;

    // Clear storage first
    localStorage.removeItem('tictactoe_player_configs');
    
    savePlayerConfigs(invalidConfigs);

    const stored = localStorage.getItem('tictactoe_player_configs');
    expect(stored).toBeNull();
  });

  it('should overwrite existing configs', () => {
    const firstConfigs: PlayerConfigs = {
      X: { name: 'Alice', symbol: 'X' },
      O: { name: 'Bob', symbol: 'O' },
    };
    savePlayerConfigs(firstConfigs);

    const secondConfigs: PlayerConfigs = {
      X: { name: 'Charlie', symbol: '★' },
      O: { name: 'Diana', symbol: '🔵' },
    };
    savePlayerConfigs(secondConfigs);

    const loaded = loadPlayerConfigs();
    expect(loaded.X.name).toBe('Charlie');
    expect(loaded.O.name).toBe('Diana');
  });
});
