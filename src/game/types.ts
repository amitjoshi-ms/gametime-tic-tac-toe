/**
 * Type definitions for the Tic-Tac-Toe game.
 * These types represent the core domain model.
 *
 * @module game/types
 */

/**
 * Available symbols for players to choose from.
 * Includes classic letters, shapes, and emojis for variety.
 */
export const AVAILABLE_SYMBOLS = [
  'X',
  'O',
  '●',
  '■',
  '▲',
  '◆',
  '★',
  '🔵',
  '🔴',
  '⭐',
  '🌙',
  '☀️',
] as const;

/** Type representing any available player symbol */
export type PlayerSymbol = (typeof AVAILABLE_SYMBOLS)[number];

/** Possible values for a cell on the board */
export type CellValue = PlayerSymbol | null;

/** The two players (internal representation) */
export type Player = 'X' | 'O';

/** Possible game outcomes */
export type GameStatus = 'playing' | 'x-wins' | 'o-wins' | 'draw';

/**
 * Game mode determines opponent behavior.
 * - 'human': Two human players take turns
 * - 'computer': Human vs AI opponent
 */
export type GameMode = 'human' | 'computer';

/** Player configuration including name and symbol */
export interface PlayerConfig {
  name: string;
  symbol: PlayerSymbol;
}

/** Player configurations for both players */
export interface PlayerConfigs {
  X: PlayerConfig;
  O: PlayerConfig;
}

/** @deprecated Use PlayerConfigs instead */
export interface PlayerNames {
  X: string;
  O: string;
}

/**
 * Complete game state at any point in time.
 *
 * Invariants:
 * - board always has exactly 9 elements
 * - If status !== 'playing', no more moves are accepted
 * - Number of X marks >= number of O marks (X always goes first)
 * - isComputerThinking can only be true when gameMode === 'computer' and currentPlayer === 'O'
 */
export interface GameState {
  /** 9-element array representing the 3x3 board (indices 0-8) */
  board: CellValue[];
  /** Which player moves next */
  currentPlayer: Player;
  /** Current game status */
  status: GameStatus;
  /** Custom configurations (name and symbol) for both players */
  playerConfigs: PlayerConfigs;
  /** Current game mode (human vs computer) */
  gameMode: GameMode;
  /** True while computer is "thinking" (during delay before move) */
  isComputerThinking: boolean;
}

/**
 * Tuple of 3 indices representing a winning line.
 * Used to check rows, columns, and diagonals.
 */
export type WinningLine = [number, number, number];
