/**
 * Local storage utilities for persisting game data.
 * Provides safe localStorage access with fallbacks.
 *
 * @module utils/storage
 */

import type { GameMode } from '../game/types';

const STORAGE_PREFIX = 'tictactoe_';
const GAME_MODE_KEY = 'game_mode';

/**
 * Gets a value from localStorage.
 *
 * @param key - Storage key (will be prefixed automatically)
 * @param defaultValue - Default value if key doesn't exist
 * @returns Stored value or default
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Sets a value in localStorage.
 *
 * @param key - Storage key (will be prefixed automatically)
 * @param value - Value to store (will be JSON stringified)
 */
export function setStorageItem(key: string, value: unknown): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // Fail silently if localStorage is not available
  }
}

/**
 * Removes a value from localStorage.
 *
 * @param key - Storage key (will be prefixed automatically)
 */
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    // Fail silently if localStorage is not available
  }
}

/**
 * Loads the saved game mode from localStorage.
 *
 * @returns Saved game mode or 'human' as default
 */
export function loadGameMode(): GameMode {
  return getStorageItem<GameMode>(GAME_MODE_KEY, 'human');
}

/**
 * Saves the game mode to localStorage.
 *
 * @param mode - Game mode to save
 */
export function saveGameMode(mode: GameMode): void {
  setStorageItem(GAME_MODE_KEY, mode);
}
