/**
 * Computer opponent logic module.
 * Handles random move selection and thinking delay.
 *
 * @module game/computer
 */

import type { CellValue } from './types';

/** Thinking delay in milliseconds */
export const COMPUTER_THINKING_DELAY = 2000;

/**
 * Gets indices of all empty cells on the board.
 *
 * @param board - Current board state (9 elements)
 * @returns Array of indices (0-8) where cell is null
 *
 * @example
 * getAvailableCells(['X', null, 'O', null, ...]) // [1, 3, ...]
 */
export function getAvailableCells(board: CellValue[]): number[] {
  const available: number[] = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      available.push(i);
    }
  }
  return available;
}

/**
 * Selects a random cell from available positions.
 * Uses uniform distribution - all positions equally likely.
 *
 * @param available - Array of available cell indices
 * @returns Selected cell index
 * @throws Error if available array is empty
 *
 * @example
 * selectRandomCell([1, 3, 5, 7]) // Returns one of: 1, 3, 5, or 7
 */
export function selectRandomCell(available: number[]): number {
  if (available.length === 0) {
    throw new Error('No available cells to select from');
  }
  const randomIndex = Math.floor(Math.random() * available.length);
  const selectedCell = available[randomIndex];
  // This condition can never be true since randomIndex is 0 to length-1,
  // but satisfies TypeScript's type narrowing
  if (selectedCell === undefined) {
    throw new Error('Unexpected undefined cell');
  }
  return selectedCell;
}

/**
 * Immediately selects a computer move without delay.
 * Useful for testing or instant-play mode.
 *
 * @param board - Current board state
 * @returns Selected cell index, or -1 if no moves available
 */
export function selectComputerMove(board: CellValue[]): number {
  const available = getAvailableCells(board);
  if (available.length === 0) {
    return -1;
  }
  return selectRandomCell(available);
}

/**
 * Schedules a computer move after the thinking delay.
 * Returns a cleanup function to cancel the pending move.
 *
 * @param board - Current board state
 * @param onMove - Callback invoked with selected cell index
 * @returns Cleanup function to cancel pending move
 *
 * @example
 * const cancel = scheduleComputerMove(board, (cellIndex) => {
 *   makeMove(state, cellIndex);
 * });
 * // Later, if game reset:
 * cancel();
 */
export function scheduleComputerMove(
  board: CellValue[],
  onMove: (cellIndex: number) => void
): () => void {
  const cellIndex = selectComputerMove(board);

  // If no moves available, call onMove with -1 immediately
  if (cellIndex === -1) {
    onMove(-1);
    return () => {
      /* no-op cleanup */
    };
  }

  const timeoutId = setTimeout(() => {
    onMove(cellIndex);
  }, COMPUTER_THINKING_DELAY);

  // Return cleanup function
  return () => {
    clearTimeout(timeoutId);
  };
}
