/**
 * Pure functions for game rules and win detection.
 * These functions have no side effects and are easily testable.
 *
 * @module game/logic
 */

import type { CellValue, GameStatus, WinningLine } from './types';

/**
 * All 8 possible winning combinations.
 * Each tuple contains the indices of a winning line.
 *
 * Board index mapping:
 * ```
 * 0 | 1 | 2
 * ---------
 * 3 | 4 | 5
 * ---------
 * 6 | 7 | 8
 * ```
 */
export const WINNING_LINES: WinningLine[] = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6],
];

/**
 * Checks if the given player has won.
 *
 * @param board - Current board state (9 elements)
 * @param playerSymbol - Player symbol to check
 * @returns true if player has 3 in a row
 */
export function checkWin(board: CellValue[], playerSymbol: CellValue): boolean {
  if (playerSymbol === null) return false;
  return WINNING_LINES.some(
    ([a, b, c]) =>
      board[a] === playerSymbol &&
      board[b] === playerSymbol &&
      board[c] === playerSymbol
  );
}

/**
 * Checks if the board is completely filled.
 *
 * @param board - Current board state
 * @returns true if all 9 cells are occupied
 */
export function isBoardFull(board: CellValue[]): boolean {
  return board.every((cell) => cell !== null);
}

/**
 * Checks if the game is an early draw (no winning moves possible).
 * A line is "blocked" if it contains both X and O.
 * If all 8 winning lines are blocked, neither player can win.
 *
 * @param board - Current board state
 * @returns true if all winning lines are blocked (early draw)
 */
export function isEarlyDraw(board: CellValue[]): boolean {
  return WINNING_LINES.every(([a, b, c]) => {
    const cells = [board[a], board[b], board[c]];
    const hasX = cells.includes('X');
    const hasO = cells.includes('O');
    // Line is blocked if it has both X and O
    return hasX && hasO;
  });
}

/**
 * Determines the game status after a move.
 *
 * @param board - Current board state
 * @param lastPlayer - The player who just moved
 * @param playerConfigs - Player configurations with symbols
 * @returns Updated game status
 */
export function determineStatus(
  board: CellValue[],
  lastPlayer: 'X' | 'O',
  playerConfigs: { X: { symbol: CellValue }; O: { symbol: CellValue } }
): GameStatus {
  // Check if the player who just moved has won
  const playerSymbol = playerConfigs[lastPlayer].symbol;
  if (checkWin(board, playerSymbol)) {
    return lastPlayer === 'X' ? 'x-wins' : 'o-wins';
  }

  // Check for early draw (all winning lines blocked)
  if (isEarlyDraw(board)) {
    return 'draw';
  }

  // Check for draw (board full with no winner)
  if (isBoardFull(board)) {
    return 'draw';
  }

  // Game continues
  return 'playing';
}

/**
 * Checks if a move is valid.
 *
 * @param board - Current board state
 * @param cellIndex - Index to check (0-8)
 * @param status - Current game status
 * @returns true if the cell is empty and game is in progress
 */
export function isValidMove(
  board: CellValue[],
  cellIndex: number,
  status: GameStatus
): boolean {
  // Game must be in progress
  if (status !== 'playing') {
    return false;
  }

  // Index must be in valid range
  if (cellIndex < 0 || cellIndex > 8) {
    return false;
  }

  // Cell must be empty
  return board[cellIndex] === null;
}
