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
 * Checks if a player can complete any of their live lines with remaining moves.
 * 
 * @param board - Current board state
 * @param player - Player to check ('X' or 'O')
 * @param nextPlayer - Who moves next
 * @returns true if player can actually complete a line
 */
function canActuallyWin(
  board: CellValue[],
  player: 'X' | 'O',
  nextPlayer: 'X' | 'O'
): boolean {
  const opponent: 'X' | 'O' = player === 'X' ? 'O' : 'X';

  // Get all empty positions
  const emptyPositions = board
    .map((cell, idx) => (cell === null ? idx : -1))
    .filter((idx) => idx !== -1);

  // Special case: if only 1 empty cell left, check if current player can win
  if (emptyPositions.length === 1) {
    const emptyPos = emptyPositions[0];
    if (emptyPos === undefined) return false;
    
    // Check if filling this position wins for this player
    for (const [a, b, c] of WINNING_LINES) {
      const cells = [board[a], board[b], board[c]];
      
      // Skip if line has opponent marks
      if (cells.includes(opponent)) continue;
      
      // Check if this line needs only the empty position
      if ([a, b, c].includes(emptyPos)) {
        const marksInLine = [a, b, c].filter((pos) => board[pos] === player).length;
        if (marksInLine === 2) {
          // This player can win by filling the empty position
          // But only if it's their turn
          return nextPlayer === player;
        }
      }
    }
    return false;
  }

  // For multiple empty cells, assume the game should continue
  // (more complex analysis would require minimax)
  return true;
}

/**
 * Checks if the game is an early draw (no winning moves possible).
 *
 * An early draw occurs when neither player can possibly win, even with optimal play.
 * This can happen before the board is completely filled.
 *
 * Enhanced algorithm considers turn order and move sequences:
 * 1. If neither player has live lines (all lines blocked), it's a draw
 * 2. If only one player has live lines, check if they can complete any before being blocked
 * 3. If both have live lines, check if either can actually win considering whose turn it is
 *
 * @param board - Current board state
 * @param lastPlayer - The player who just moved (optional for turn-aware detection)
 * @returns true if neither player can win (early draw detected)
 */
export function isEarlyDraw(
  board: CellValue[],
  lastPlayer?: 'X' | 'O'
): boolean {
  // Check if either player has a live winning line
  const xHasLiveLine = hasLiveWinningLine(board, 'X');
  const oHasLiveLine = hasLiveWinningLine(board, 'O');

  // Early draw if neither player has any live lines
  if (!xHasLiveLine && !oHasLiveLine) {
    return true;
  }

  // If we know whose turn it is, do more sophisticated checking
  if (lastPlayer !== undefined) {
    const nextPlayer: 'X' | 'O' = lastPlayer === 'X' ? 'O' : 'X';

    // Check if either player can actually win
    const xCanWin = xHasLiveLine && canActuallyWin(board, 'X', nextPlayer);
    const oCanWin = oHasLiveLine && canActuallyWin(board, 'O', nextPlayer);

    // If neither can actually win, it's an early draw
    if (!xCanWin && !oCanWin) {
      return true;
    }
  }

  // Default: not an early draw (game continues)
  return false;
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
  if (isEarlyDraw(board, lastPlayer)) {
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
