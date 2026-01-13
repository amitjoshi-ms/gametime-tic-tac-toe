/**
 * Player configuration management with localStorage persistence.
 * Handles custom player names and symbols with default fallbacks.
 *
 * @module game/playerNames
 */

import { getStorageItem, setStorageItem } from '../utils/storage';
import type { PlayerConfigs, PlayerNames, PlayerSymbol } from './types';
import { AVAILABLE_SYMBOLS } from './types';

const STORAGE_KEY = 'player_configs';
const LEGACY_STORAGE_KEY = 'player_names';

/** Default name for Player X */
export const DEFAULT_X_NAME = 'Player X';

/** Default name for Player O */
export const DEFAULT_O_NAME = 'Player O';

/** Default name for computer opponent */
export const DEFAULT_COMPUTER_NAME = 'Computer';

/** Default symbol for Player X */
export const DEFAULT_X_SYMBOL: PlayerSymbol = 'X';

/** Default symbol for Player O */
export const DEFAULT_O_SYMBOL: PlayerSymbol = 'O';

/**
 * Gets the default player configurations.
 *
 * @returns Default player configs
 */
export function getDefaultPlayerConfigs(): PlayerConfigs {
  return {
    X: { name: DEFAULT_X_NAME, symbol: DEFAULT_X_SYMBOL },
    O: { name: DEFAULT_O_NAME, symbol: DEFAULT_O_SYMBOL },
  };
}

/**
 * Validates that player symbols are different and valid.
 *
 * @param configs - Player configs to validate
 * @returns true if configs are valid
 */
export function validatePlayerConfigs(configs: PlayerConfigs): boolean {
  // Check structure exists
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!configs || typeof configs !== 'object') return false;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!configs.X || !configs.O) return false;
  if (typeof configs.X.symbol !== 'string' || typeof configs.O.symbol !== 'string') return false;
  if (typeof configs.X.name !== 'string' || typeof configs.O.name !== 'string') return false;

  // Symbols must be different
  if (configs.X.symbol === configs.O.symbol) {
    return false;
  }

  // Symbols must be from available list
  if (
    !AVAILABLE_SYMBOLS.includes(configs.X.symbol) ||
    !AVAILABLE_SYMBOLS.includes(configs.O.symbol)
  ) {
    return false;
  }

  return true;
}

/**
 * Loads player configs from localStorage or returns defaults.
 * Handles migration from legacy PlayerNames format.
 *
 * @returns Player configs from storage or defaults
 */
export function loadPlayerConfigs(): PlayerConfigs {
  // Try loading new format
  const stored = getStorageItem<PlayerConfigs | null>(STORAGE_KEY, null);

  if (stored && validatePlayerConfigs(stored)) {
    return stored;
  }

  // Try migrating from legacy format
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const legacyNames = getStorageItem<PlayerNames | null>(
    LEGACY_STORAGE_KEY,
    null
  );
  if (legacyNames) {
    const migrated: PlayerConfigs = {
      X: { name: legacyNames.X, symbol: DEFAULT_X_SYMBOL },
      O: { name: legacyNames.O, symbol: DEFAULT_O_SYMBOL },
    };
    savePlayerConfigs(migrated);
    return migrated;
  }

  // Return defaults
  return getDefaultPlayerConfigs();
}

/**
 * Saves player configs to localStorage.
 *
 * @param configs - Player configs to save
 */
export function savePlayerConfigs(configs: PlayerConfigs): void {
  if (validatePlayerConfigs(configs)) {
    setStorageItem(STORAGE_KEY, configs);
  }
}

/**
 * Resets player configs to defaults and saves to localStorage.
 *
 * @returns Default player configs
 */
export function resetPlayerConfigs(): PlayerConfigs {
  const defaults = getDefaultPlayerConfigs();
  savePlayerConfigs(defaults);
  return defaults;
}

/**
 * Gets the local player's name for remote mode.
 * Uses Player X's name since that's typically what users customize
 * (they play as X in human vs human or human vs computer modes).
 *
 * @returns The local player's name from localStorage
 */
export function getLocalPlayerName(): string {
  const configs = loadPlayerConfigs();
  // Use X's name as the "local player" name since users typically customize that
  // If X's name is default, fall back to O's name in case they customized that instead
  if (configs.X.name !== DEFAULT_X_NAME) {
    return configs.X.name;
  }
  if (configs.O.name !== DEFAULT_O_NAME) {
    return configs.O.name;
  }
  return DEFAULT_X_NAME;
}

/**
 * @deprecated Use getDefaultPlayerConfigs instead
 */
// eslint-disable-next-line @typescript-eslint/no-deprecated
export function getDefaultPlayerNames(): PlayerNames {
  return {
    X: DEFAULT_X_NAME,
    O: DEFAULT_O_NAME,
  };
}

/**
 * @deprecated Use loadPlayerConfigs instead
 */
// eslint-disable-next-line @typescript-eslint/no-deprecated
export function loadPlayerNames(): PlayerNames {
  const configs = loadPlayerConfigs();
  return {
    X: configs.X.name,
    O: configs.O.name,
  };
}

/**
 * @deprecated Use savePlayerConfigs instead
 */
// eslint-disable-next-line @typescript-eslint/no-deprecated
export function savePlayerNames(names: PlayerNames): void {
  const configs = loadPlayerConfigs();
  const updated: PlayerConfigs = {
    X: { ...configs.X, name: names.X },
    O: { ...configs.O, name: names.O },
  };
  savePlayerConfigs(updated);
}

/**
 * @deprecated Use resetPlayerConfigs instead
 */
// eslint-disable-next-line @typescript-eslint/no-deprecated
export function resetPlayerNames(): PlayerNames {
  const configs = resetPlayerConfigs();
  return {
    X: configs.X.name,
    O: configs.O.name,
  };
}
