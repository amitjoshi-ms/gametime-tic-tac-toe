/**
 * Type definitions for the Tic-Tac-Toe game.
 * These types represent the core domain model.
 *
 * @module game/types
 */

/** Possible values for a cell on the board */
export type CellValue = 'X' | 'O' | null;

/** The two players */
export type Player = 'X' | 'O';

/** Possible game outcomes */
export type GameStatus = 'playing' | 'x-wins' | 'o-wins' | 'draw';

/** Player names for both X and O */
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
 */
export interface GameState {
  /** 9-element array representing the 3x3 board (indices 0-8) */
  board: CellValue[];
  /** Which player moves next */
  currentPlayer: Player;
  /** Current game status */
  status: GameStatus;
  /** Custom names for both players */
  playerNames: PlayerNames;
}

/**
 * Tuple of 3 indices representing a winning line.
 * Used to check rows, columns, and diagonals.
 */
export type WinningLine = [number, number, number];
