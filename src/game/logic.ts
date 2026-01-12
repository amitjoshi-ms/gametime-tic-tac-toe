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
 * @param player - Player to check ('X' or 'O')
 * @returns true if player has 3 in a row
 */
export function checkWin(board: CellValue[], player: 'X' | 'O'): boolean {
  return WINNING_LINES.some(
    ([a, b, c]) =>
      board[a] === player && board[b] === player && board[c] === player
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
 * Checks if a player has any "live" winning line.
 * A line is "live" for a player if it contains only their marks and empty cells
 * (no opponent marks). This means the player could potentially complete that line.
 *
 * @param board - Current board state
 * @param player - Player to check ('X' or 'O')
 * @returns true if player has at least one live winning line
 */
function hasLiveWinningLine(board: CellValue[], player: 'X' | 'O'): boolean {
  const opponent: 'X' | 'O' = player === 'X' ? 'O' : 'X';
  
  return WINNING_LINES.some(([a, b, c]) => {
    const cells = [board[a], board[b], board[c]];
    // Line is live if it has no opponent marks
    return !cells.includes(opponent);
  });
}

/**
 * Checks if the game is an early draw (no winning moves possible).
 * 
 * An early draw occurs when neither player has any "live" winning line
 * (a line that could potentially be completed). This can happen before
 * the board is completely filled.
 * 
 * Algorithm: For each player, check if they have any winning line that
 * contains only their marks and empty cells (no opponent marks). If neither
 * player has such a line, the game is mathematically a draw.
 *
 * @param board - Current board state
 * @returns true if neither player can win (early draw detected)
 */
export function isEarlyDraw(board: CellValue[]): boolean {
  // Check if either player has a live winning line
  const xHasLiveLine = hasLiveWinningLine(board, 'X');
  const oHasLiveLine = hasLiveWinningLine(board, 'O');
  
  // Early draw if neither player has any live lines
  return !xHasLiveLine && !oHasLiveLine;
}

/**
 * Determines the game status after a move.
 *
 * @param board - Current board state
 * @param lastPlayer - The player who just moved
 * @returns Updated game status
 */
export function determineStatus(
  board: CellValue[],
  lastPlayer: 'X' | 'O'
): GameStatus {
  // Check if the player who just moved has won
  if (checkWin(board, lastPlayer)) {
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
