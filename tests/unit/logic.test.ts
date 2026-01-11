/**
 * Unit tests for game logic functions.
 * Tests win detection, draw detection, and move validation.
 */

import { describe, it, expect } from 'vitest';
import {
  checkWin,
  isBoardFull,
  determineStatus,
  isValidMove,
  WINNING_LINES,
} from '../../src/game/logic';
import type { CellValue } from '../../src/game/types';

describe('WINNING_LINES', () => {
  it('should have 8 winning combinations', () => {
    expect(WINNING_LINES).toHaveLength(8);
  });

  it('should include all rows', () => {
    expect(WINNING_LINES).toContainEqual([0, 1, 2]); // Top row
    expect(WINNING_LINES).toContainEqual([3, 4, 5]); // Middle row
    expect(WINNING_LINES).toContainEqual([6, 7, 8]); // Bottom row
  });

  it('should include all columns', () => {
    expect(WINNING_LINES).toContainEqual([0, 3, 6]); // Left column
    expect(WINNING_LINES).toContainEqual([1, 4, 7]); // Middle column
    expect(WINNING_LINES).toContainEqual([2, 5, 8]); // Right column
  });

  it('should include both diagonals', () => {
    expect(WINNING_LINES).toContainEqual([0, 4, 8]); // Main diagonal
    expect(WINNING_LINES).toContainEqual([2, 4, 6]); // Anti-diagonal
  });
});

describe('checkWin', () => {
  it('should return false for empty board', () => {
    const board: CellValue[] = Array(9).fill(null);
    expect(checkWin(board, 'X')).toBe(false);
    expect(checkWin(board, 'O')).toBe(false);
  });

  it('should detect X wins in top row', () => {
    const board: CellValue[] = ['X', 'X', 'X', null, 'O', 'O', null, null, null];
    expect(checkWin(board, 'X')).toBe(true);
    expect(checkWin(board, 'O')).toBe(false);
  });

  it('should detect O wins in middle row', () => {
    const board: CellValue[] = ['X', null, 'X', 'O', 'O', 'O', null, 'X', null];
    expect(checkWin(board, 'O')).toBe(true);
    expect(checkWin(board, 'X')).toBe(false);
  });

  it('should detect wins in columns', () => {
    const board: CellValue[] = ['X', 'O', null, 'X', 'O', null, 'X', null, null];
    expect(checkWin(board, 'X')).toBe(true);
  });

  it('should detect wins in main diagonal', () => {
    const board: CellValue[] = ['X', 'O', null, 'O', 'X', null, null, null, 'X'];
    expect(checkWin(board, 'X')).toBe(true);
  });

  it('should detect wins in anti-diagonal', () => {
    const board: CellValue[] = [null, null, 'O', 'X', 'O', 'X', 'O', null, null];
    expect(checkWin(board, 'O')).toBe(true);
  });

  it('should return false when no winner yet', () => {
    const board: CellValue[] = ['X', 'O', 'X', null, null, null, null, null, null];
    expect(checkWin(board, 'X')).toBe(false);
    expect(checkWin(board, 'O')).toBe(false);
  });
});

describe('isBoardFull', () => {
  it('should return false for empty board', () => {
    const board: CellValue[] = Array(9).fill(null);
    expect(isBoardFull(board)).toBe(false);
  });

  it('should return false for partially filled board', () => {
    const board: CellValue[] = ['X', 'O', 'X', null, null, null, null, null, null];
    expect(isBoardFull(board)).toBe(false);
  });

  it('should return true for completely filled board', () => {
    const board: CellValue[] = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
    expect(isBoardFull(board)).toBe(true);
  });

  it('should return false when one cell is empty', () => {
    const board: CellValue[] = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', null];
    expect(isBoardFull(board)).toBe(false);
  });
});

describe('determineStatus', () => {
  it('should return x-wins when X has won', () => {
    const board: CellValue[] = ['X', 'X', 'X', null, 'O', 'O', null, null, null];
    expect(determineStatus(board, 'X')).toBe('x-wins');
  });

  it('should return o-wins when O has won', () => {
    const board: CellValue[] = ['X', null, 'X', 'O', 'O', 'O', null, 'X', null];
    expect(determineStatus(board, 'O')).toBe('o-wins');
  });

  it('should return draw when board is full with no winner', () => {
    // A draw scenario: X O X / X O O / O X X
    const board: CellValue[] = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
    expect(determineStatus(board, 'X')).toBe('draw');
  });

  it('should return playing when game is ongoing', () => {
    const board: CellValue[] = ['X', 'O', null, null, null, null, null, null, null];
    expect(determineStatus(board, 'O')).toBe('playing');
  });

  it('should check only the last player who moved', () => {
    // X wins but we check for O - should be playing if O didn't win
    const board: CellValue[] = ['X', 'X', null, 'O', 'O', null, null, null, null];
    expect(determineStatus(board, 'O')).toBe('playing');
  });
});

describe('isValidMove', () => {
  const emptyBoard: CellValue[] = Array(9).fill(null);
  const partialBoard: CellValue[] = ['X', 'O', null, null, null, null, null, null, null];

  it('should return true for empty cell when game is playing', () => {
    expect(isValidMove(emptyBoard, 0, 'playing')).toBe(true);
    expect(isValidMove(emptyBoard, 4, 'playing')).toBe(true);
    expect(isValidMove(emptyBoard, 8, 'playing')).toBe(true);
  });

  it('should return false for occupied cell', () => {
    expect(isValidMove(partialBoard, 0, 'playing')).toBe(false);
    expect(isValidMove(partialBoard, 1, 'playing')).toBe(false);
  });

  it('should return false when game is over', () => {
    expect(isValidMove(emptyBoard, 0, 'x-wins')).toBe(false);
    expect(isValidMove(emptyBoard, 0, 'o-wins')).toBe(false);
    expect(isValidMove(emptyBoard, 0, 'draw')).toBe(false);
  });

  it('should return false for out of bounds index', () => {
    expect(isValidMove(emptyBoard, -1, 'playing')).toBe(false);
    expect(isValidMove(emptyBoard, 9, 'playing')).toBe(false);
    expect(isValidMove(emptyBoard, 100, 'playing')).toBe(false);
  });

  it('should return true for empty cell in partial game', () => {
    expect(isValidMove(partialBoard, 2, 'playing')).toBe(true);
    expect(isValidMove(partialBoard, 8, 'playing')).toBe(true);
  });
});
