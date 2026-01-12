/**
 * Player name management with localStorage persistence.
 * Handles custom player names with default fallbacks.
 *
 * @module game/playerNames
 */

import { getStorageItem, setStorageItem } from '../utils/storage';
import type { PlayerNames } from './types';

const STORAGE_KEY = 'player_names';

/** Default name for Player X */
export const DEFAULT_X_NAME = 'Player X';

/** Default name for Player O */
export const DEFAULT_O_NAME = 'Player O';

/** Default name for computer opponent */
export const DEFAULT_COMPUTER_NAME = 'Computer';

/**
 * Gets the default player names.
 *
 * @returns Default player names
 */
export function getDefaultPlayerNames(): PlayerNames {
  return {
    X: DEFAULT_X_NAME,
    O: DEFAULT_O_NAME,
  };
}

/**
 * Loads player names from localStorage or returns defaults.
 *
 * @returns Player names from storage or defaults
 */
export function loadPlayerNames(): PlayerNames {
  return getStorageItem<PlayerNames>(STORAGE_KEY, getDefaultPlayerNames());
}

/**
 * Saves player names to localStorage.
 *
 * @param names - Player names to save
 */
export function savePlayerNames(names: PlayerNames): void {
  setStorageItem(STORAGE_KEY, names);
}

/**
 * Resets player names to defaults and saves to localStorage.
 *
 * @returns Default player names
 */
export function resetPlayerNames(): PlayerNames {
  const defaults = getDefaultPlayerNames();
  savePlayerNames(defaults);
  return defaults;
}
