/**
 * Unit tests for computer opponent logic.
 *
 * @module tests/unit/computer
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getAvailableCells,
  selectRandomCell,
  selectComputerMove,
  scheduleComputerMove,
  scheduleDemoRestart,
  COMPUTER_THINKING_DELAY,
  DEMO_RESTART_DELAY,
} from '../../src/game/computer';
import type { CellValue } from '../../src/game/types';

describe('computer', () => {
  describe('getAvailableCells', () => {
    it('should return all indices for empty board', () => {
      const board: CellValue[] = Array<CellValue>(9).fill(null);
      const available = getAvailableCells(board);
      expect(available).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('should return empty array for full board', () => {
      const board: CellValue[] = ['X', 'O', 'X', 'O', 'X', 'O', 'X', 'O', 'X'];
      const available = getAvailableCells(board);
      expect(available).toEqual([]);
    });

    it('should return only empty cell indices', () => {
      const board: CellValue[] = [
        'X',
        null,
        'O',
        null,
        'X',
        null,
        'O',
        null,
        'X',
      ];
      const available = getAvailableCells(board);
      expect(available).toEqual([1, 3, 5, 7]);
    });

    it('should return single index when one cell empty', () => {
      const board: CellValue[] = ['X', 'O', 'X', 'O', null, 'O', 'X', 'O', 'X'];
      const available = getAvailableCells(board);
      expect(available).toEqual([4]);
    });

    it('should handle board with only X moves', () => {
      const board: CellValue[] = [
        'X',
        null,
        null,
        null,
        'X',
        null,
        null,
        null,
        'X',
      ];
      const available = getAvailableCells(board);
      expect(available).toEqual([1, 2, 3, 5, 6, 7]);
    });
  });

  describe('selectRandomCell', () => {
    it('should return a value from the available array', () => {
      const available = [1, 3, 5, 7];
      const selected = selectRandomCell(available);
      expect(available).toContain(selected);
    });

    it('should return the only value when array has one element', () => {
      const available = [4];
      const selected = selectRandomCell(available);
      expect(selected).toBe(4);
    });

    it('should throw error for empty array', () => {
      expect(() => selectRandomCell([])).toThrow('No available cells to select from');
    });

    it('should return different values over multiple calls (statistical)', () => {
      const available = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      const results = new Set<number>();

      // Run 50 times - should get at least 2 different values
      for (let i = 0; i < 50; i++) {
        results.add(selectRandomCell(available));
      }

      expect(results.size).toBeGreaterThan(1);
    });

    it('should only return values from available array', () => {
      const available = [2, 4, 6];

      for (let i = 0; i < 20; i++) {
        const selected = selectRandomCell(available);
        expect(available).toContain(selected);
      }
    });
  });

  describe('selectComputerMove', () => {
    it('should return valid cell index for empty board', () => {
      const board: CellValue[] = Array<CellValue>(9).fill(null);
      const move = selectComputerMove(board);
      expect(move).toBeGreaterThanOrEqual(0);
      expect(move).toBeLessThanOrEqual(8);
    });

    it('should return -1 for full board', () => {
      const board: CellValue[] = ['X', 'O', 'X', 'O', 'X', 'O', 'X', 'O', 'X'];
      const move = selectComputerMove(board);
      expect(move).toBe(-1);
    });

    it('should return an empty cell index', () => {
      const board: CellValue[] = [
        'X',
        'O',
        'X',
        null,
        'O',
        null,
        'X',
        'O',
        null,
      ];
      const move = selectComputerMove(board);
      expect([3, 5, 8]).toContain(move);
    });

    it('should return the only available cell', () => {
      const board: CellValue[] = ['X', 'O', 'X', 'O', null, 'O', 'X', 'O', 'X'];
      const move = selectComputerMove(board);
      expect(move).toBe(4);
    });
  });

  describe('scheduleComputerMove', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should call onMove after COMPUTER_THINKING_DELAY', () => {
      const board: CellValue[] = Array<CellValue>(9).fill(null);
      const onMove = vi.fn();

      scheduleComputerMove(board, onMove);

      expect(onMove).not.toHaveBeenCalled();

      vi.advanceTimersByTime(COMPUTER_THINKING_DELAY);

      expect(onMove).toHaveBeenCalledTimes(1);
    });

    it('should pass valid cell index to onMove', () => {
      const board: CellValue[] = ['X', 'O', null, null, 'X', null, 'O', null, null];
      const onMove = vi.fn();

      scheduleComputerMove(board, onMove);
      vi.advanceTimersByTime(COMPUTER_THINKING_DELAY);

      expect(onMove).toHaveBeenCalledTimes(1);
      const firstCall = onMove.mock.calls[0];
      expect(firstCall).toBeDefined();
      const calledWith = firstCall?.[0] as number;
      expect([2, 3, 5, 7, 8]).toContain(calledWith);
    });

    it('should call onMove with -1 immediately for full board', () => {
      const board: CellValue[] = ['X', 'O', 'X', 'O', 'X', 'O', 'X', 'O', 'X'];
      const onMove = vi.fn();

      scheduleComputerMove(board, onMove);

      // Should be called immediately, not after delay
      expect(onMove).toHaveBeenCalledWith(-1);
    });

    it('should not call onMove if cancelled before delay', () => {
      const board: CellValue[] = Array<CellValue>(9).fill(null);
      const onMove = vi.fn();

      const cancel = scheduleComputerMove(board, onMove);

      vi.advanceTimersByTime(1000); // Halfway through delay
      cancel();
      vi.advanceTimersByTime(2000); // Past the delay

      expect(onMove).not.toHaveBeenCalled();
    });

    it('should return a cancel function', () => {
      const board: CellValue[] = Array<CellValue>(9).fill(null);
      const onMove = vi.fn();

      const cancel = scheduleComputerMove(board, onMove);

      expect(typeof cancel).toBe('function');
    });

    it('should use correct delay constant', () => {
      expect(COMPUTER_THINKING_DELAY).toBe(2000);
    });
  });

  describe('COMPUTER_THINKING_DELAY', () => {
    it('should be 2000 milliseconds', () => {
      expect(COMPUTER_THINKING_DELAY).toBe(2000);
    });
  });

  describe('DEMO_RESTART_DELAY', () => {
    it('should be 15000 milliseconds (15 seconds)', () => {
      expect(DEMO_RESTART_DELAY).toBe(15000);
    });
  });

  describe('scheduleDemoRestart', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should call onRestart after DEMO_RESTART_DELAY', () => {
      const onRestart = vi.fn();

      scheduleDemoRestart(onRestart);
      expect(onRestart).not.toHaveBeenCalled();

      vi.advanceTimersByTime(DEMO_RESTART_DELAY - 1);
      expect(onRestart).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(onRestart).toHaveBeenCalledTimes(1);
    });

    it('should return a cancel function', () => {
      const onRestart = vi.fn();
      const cancel = scheduleDemoRestart(onRestart);

      expect(typeof cancel).toBe('function');
    });

    it('should cancel restart when cancel function is called', () => {
      const onRestart = vi.fn();
      const cancel = scheduleDemoRestart(onRestart);

      vi.advanceTimersByTime(5000); // Some time before full delay
      cancel();
      vi.advanceTimersByTime(15000); // Well past the delay

      expect(onRestart).not.toHaveBeenCalled();
    });

    it('should allow multiple restarts to be scheduled independently', () => {
      const onRestart1 = vi.fn();
      const onRestart2 = vi.fn();

      scheduleDemoRestart(onRestart1);
      vi.advanceTimersByTime(5000);
      scheduleDemoRestart(onRestart2);

      vi.advanceTimersByTime(10000); // First should fire at 15000
      expect(onRestart1).toHaveBeenCalledTimes(1);
      expect(onRestart2).not.toHaveBeenCalled();

      vi.advanceTimersByTime(5000); // Second fires at 20000
      expect(onRestart2).toHaveBeenCalledTimes(1);
    });

    it('should use 15 second delay for result display', () => {
      expect(DEMO_RESTART_DELAY).toBe(15000);
    });
  });
});
