/**
 * Comprehensive unit tests for early draw detection.
 * Tests various board configurations and move counts where early draw should or should not be detected.
 */

import { describe, it, expect } from 'vitest';
import { isEarlyDraw, determineStatus } from '../../src/game/logic';
import type { CellValue } from '../../src/game/types';

describe('isEarlyDraw - Comprehensive Early Draw Detection', () => {
  describe('Early Draw at 8 Moves (1 Empty Cell)', () => {
    interface EarlyDrawTestCase {
      name: string;
      board: CellValue[];
      emptyPosition: number;
    }

    const earlyDrawCases: EarlyDrawTestCase[] = [
      {
        name: 'X X O / O O X / X O _ (empty at 8)',
        board: ['X', 'X', 'O', 'O', 'O', 'X', 'X', 'O', null],
        emptyPosition: 8,
      },
      {
        name: 'X O X / X O O / O X _ (empty at 8)',
        board: ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', null],
        emptyPosition: 8,
      },
      {
        name: 'X O O / O X X / X _ O (empty at 7)',
        board: ['X', 'O', 'O', 'O', 'X', 'X', 'X', null, 'O'],
        emptyPosition: 7,
      },
      {
        name: 'X X O / O O X / X _ O (empty at 7)',
        board: ['X', 'X', 'O', 'O', 'O', 'X', 'X', null, 'O'],
        emptyPosition: 7,
      },
    ];

    earlyDrawCases.forEach(({ name, board, emptyPosition }) => {
      it(`should detect early draw: ${name}`, () => {
        expect(isEarlyDraw(board)).toBe(true);
        expect(board[emptyPosition]).toBe(null);
        
        // Verify exactly 8 cells are filled
        const filledCount = board.filter((cell) => cell !== null).length;
        expect(filledCount).toBe(8);
      });
    });
  });

  describe('Early Draw with Full Board (9 Moves)', () => {
    it('should detect early draw when board is completely filled', () => {
      // Board: X O X / X O O / O X X
      const board: CellValue[] = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
      expect(isEarlyDraw(board)).toBe(true);
      
      // Verify all cells filled
      expect(board.every((cell) => cell !== null)).toBe(true);
    });

    it('should detect early draw on full board with alternate pattern', () => {
      // Board: O X X / X O O / O X X
      const board: CellValue[] = ['O', 'X', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
      expect(isEarlyDraw(board)).toBe(true);
      expect(board.every((cell) => cell !== null)).toBe(true);
    });
  });

  describe('NOT Early Draw - Lines Still Unblocked', () => {
    interface NotEarlyDrawTestCase {
      name: string;
      board: CellValue[];
      reason: string;
    }

    const notEarlyDrawCases: NotEarlyDrawTestCase[] = [
      {
        name: 'X X _ / O O _ / _ _ _',
        board: ['X', 'X', null, 'O', 'O', null, null, null, null],
        reason: 'Top row can still be won by X',
      },
      {
        name: 'X O X / O X O / O X _',
        board: ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', null],
        reason: 'Main diagonal [0,4,8] only has X, not blocked',
      },
      {
        name: 'X _ _ / _ O _ / _ _ _',
        board: ['X', null, null, null, 'O', null, null, null, null],
        reason: 'Early game - many lines not blocked yet',
      },
      {
        name: 'X O _ / O X _ / _ _ X',
        board: ['X', 'O', null, 'O', 'X', null, null, null, 'X'],
        reason: 'X has winning position on main diagonal',
      },
      {
        name: 'X _ _ / X _ _ / X _ _',
        board: ['X', null, null, 'X', null, null, 'X', null, null],
        reason: 'X already won left column',
      },
      {
        name: 'X X _ / O O X / X O O',
        board: ['X', 'X', null, 'O', 'O', 'X', 'X', 'O', 'O'],
        reason: 'Top row [0,1,2] only has X in filled cells',
      },
      {
        name: '_ O _ / _ O _ / _ O _',
        board: [null, 'O', null, null, 'O', null, null, 'O', null],
        reason: 'O already won middle column',
      },
    ];

    notEarlyDrawCases.forEach(({ name, board, reason }) => {
      it(`should NOT detect early draw: ${name} - ${reason}`, () => {
        expect(isEarlyDraw(board)).toBe(false);
      });
    });
  });

  describe('Early Draw with Various Move Counts', () => {
    it('should detect early draw at 8 moves (minimum practical early draw)', () => {
      // After 8 moves (4 X, 4 O), all lines can be blocked
      const board: CellValue[] = ['X', 'X', 'O', 'O', 'O', 'X', 'X', 'O', null];
      const filledCount = board.filter((cell) => cell !== null).length;
      expect(filledCount).toBe(8);
      expect(isEarlyDraw(board)).toBe(true);
    });

    it('should NOT detect early draw at 7 moves', () => {
      // With 7 moves, typically can't block all 8 lines
      const board: CellValue[] = ['X', 'O', 'X', 'O', 'X', 'X', 'O', null, null];
      const filledCount = board.filter((cell) => cell !== null).length;
      expect(filledCount).toBe(7);
      expect(isEarlyDraw(board)).toBe(false);
    });

    it('should NOT detect early draw at 6 moves', () => {
      const board: CellValue[] = ['X', 'O', 'X', 'O', 'X', 'O', null, null, null];
      const filledCount = board.filter((cell) => cell !== null).length;
      expect(filledCount).toBe(6);
      expect(isEarlyDraw(board)).toBe(false);
    });

    it('should NOT detect early draw at 5 moves', () => {
      const board: CellValue[] = ['X', 'O', 'X', 'O', 'X', null, null, null, null];
      const filledCount = board.filter((cell) => cell !== null).length;
      expect(filledCount).toBe(5);
      expect(isEarlyDraw(board)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should return false for empty board', () => {
      const board: CellValue[] = Array<CellValue>(9).fill(null);
      expect(isEarlyDraw(board)).toBe(false);
    });

    it('should return false for board with only X marks', () => {
      const board: CellValue[] = ['X', 'X', 'X', null, null, null, null, null, null];
      expect(isEarlyDraw(board)).toBe(false);
    });

    it('should return false for board with only O marks', () => {
      const board: CellValue[] = ['O', 'O', 'O', null, null, null, null, null, null];
      expect(isEarlyDraw(board)).toBe(false);
    });

    it('should handle board where winning move was just made', () => {
      // X just won top row, but function should still detect blocked status
      const board: CellValue[] = ['X', 'X', 'X', 'O', 'O', null, null, null, null];
      expect(isEarlyDraw(board)).toBe(false); // Not all lines blocked
    });
  });
});

describe('determineStatus - Early Draw Integration', () => {
  describe('Should Return Draw Status', () => {
    it('should return draw when early draw detected at 8 moves', () => {
      const board: CellValue[] = ['X', 'X', 'O', 'O', 'O', 'X', 'X', 'O', null];
      expect(determineStatus(board, 'O')).toBe('draw');
      expect(determineStatus(board, 'X')).toBe('draw');
    });

    it('should return draw for full board with no winner', () => {
      const board: CellValue[] = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
      expect(determineStatus(board, 'X')).toBe('draw');
    });

    it('should return draw for multiple early draw scenarios', () => {
      const scenarios: CellValue[][] = [
        ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', null],
        ['X', 'O', 'O', 'O', 'X', 'X', 'X', null, 'O'],
        ['X', 'X', 'O', 'O', 'O', 'X', 'X', null, 'O'],
      ];

      scenarios.forEach((board) => {
        expect(determineStatus(board, 'X')).toBe('draw');
        expect(determineStatus(board, 'O')).toBe('draw');
      });
    });
  });

  describe('Should Return Playing Status (Not Early Draw)', () => {
    it('should return playing when at least one line is unblocked', () => {
      const board: CellValue[] = ['X', 'X', null, 'O', 'O', null, null, null, null];
      expect(determineStatus(board, 'O')).toBe('playing');
    });

    it('should return playing for mid-game positions', () => {
      const board: CellValue[] = ['X', 'O', null, 'O', 'X', null, null, null, null];
      expect(determineStatus(board, 'X')).toBe('playing');
    });
  });

  describe('Should Prioritize Win Over Draw', () => {
    it('should return x-wins even if other lines are blocked', () => {
      // X wins top row
      const board: CellValue[] = ['X', 'X', 'X', 'O', 'O', null, null, null, null];
      expect(determineStatus(board, 'X')).toBe('x-wins');
    });

    it('should return o-wins when O wins diagonal', () => {
      // O wins anti-diagonal
      const board: CellValue[] = ['X', 'X', 'O', 'X', 'O', 'X', 'O', null, null];
      expect(determineStatus(board, 'O')).toBe('o-wins');
    });
  });
});
