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
  isEarlyDraw,
  WINNING_LINES,
} from '../../src/game/logic';
import type { CellValue, PlayerConfigs } from '../../src/game/types';

// Default player configs for testing
const defaultPlayerConfigs: PlayerConfigs = {
  X: { name: 'Player X', symbol: 'X' },
  O: { name: 'Player O', symbol: 'O' },
};

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
    const board: CellValue[] = Array<CellValue>(9).fill(null);
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

  // Comprehensive tests for all 8 winning lines for X
  describe('X winning lines', () => {
    it('should detect X wins in top row [0,1,2]', () => {
      const board: CellValue[] = ['X', 'X', 'X', null, 'O', null, 'O', null, null];
      expect(checkWin(board, 'X')).toBe(true);
    });

    it('should detect X wins in middle row [3,4,5]', () => {
      const board: CellValue[] = [null, 'O', null, 'X', 'X', 'X', 'O', null, null];
      expect(checkWin(board, 'X')).toBe(true);
    });

    it('should detect X wins in bottom row [6,7,8]', () => {
      const board: CellValue[] = ['O', null, 'O', null, null, null, 'X', 'X', 'X'];
      expect(checkWin(board, 'X')).toBe(true);
    });

    it('should detect X wins in left column [0,3,6]', () => {
      const board: CellValue[] = ['X', 'O', null, 'X', 'O', null, 'X', null, null];
      expect(checkWin(board, 'X')).toBe(true);
    });

    it('should detect X wins in middle column [1,4,7]', () => {
      const board: CellValue[] = ['O', 'X', null, null, 'X', 'O', null, 'X', null];
      expect(checkWin(board, 'X')).toBe(true);
    });

    it('should detect X wins in right column [2,5,8]', () => {
      const board: CellValue[] = [null, 'O', 'X', null, null, 'X', 'O', null, 'X'];
      expect(checkWin(board, 'X')).toBe(true);
    });

    it('should detect X wins in main diagonal [0,4,8]', () => {
      const board: CellValue[] = ['X', 'O', null, 'O', 'X', null, null, null, 'X'];
      expect(checkWin(board, 'X')).toBe(true);
    });

    it('should detect X wins in anti-diagonal [2,4,6]', () => {
      const board: CellValue[] = ['O', null, 'X', null, 'X', null, 'X', 'O', null];
      expect(checkWin(board, 'X')).toBe(true);
    });
  });

  // Comprehensive tests for all 8 winning lines for O
  describe('O winning lines', () => {
    it('should detect O wins in top row [0,1,2]', () => {
      const board: CellValue[] = ['O', 'O', 'O', 'X', null, 'X', null, 'X', null];
      expect(checkWin(board, 'O')).toBe(true);
    });

    it('should detect O wins in middle row [3,4,5]', () => {
      const board: CellValue[] = ['X', null, 'X', 'O', 'O', 'O', null, 'X', null];
      expect(checkWin(board, 'O')).toBe(true);
    });

    it('should detect O wins in bottom row [6,7,8]', () => {
      const board: CellValue[] = ['X', 'X', null, null, 'X', null, 'O', 'O', 'O'];
      expect(checkWin(board, 'O')).toBe(true);
    });

    it('should detect O wins in left column [0,3,6]', () => {
      const board: CellValue[] = ['O', 'X', null, 'O', null, 'X', 'O', null, 'X'];
      expect(checkWin(board, 'O')).toBe(true);
    });

    it('should detect O wins in middle column [1,4,7]', () => {
      const board: CellValue[] = [null, 'O', 'X', 'X', 'O', null, null, 'O', 'X'];
      expect(checkWin(board, 'O')).toBe(true);
    });

    it('should detect O wins in right column [2,5,8]', () => {
      const board: CellValue[] = ['X', null, 'O', null, 'X', 'O', null, 'X', 'O'];
      expect(checkWin(board, 'O')).toBe(true);
    });

    it('should detect O wins in main diagonal [0,4,8]', () => {
      const board: CellValue[] = ['O', 'X', null, 'X', 'O', null, null, 'X', 'O'];
      expect(checkWin(board, 'O')).toBe(true);
    });

    it('should detect O wins in anti-diagonal [2,4,6]', () => {
      const board: CellValue[] = [null, 'X', 'O', 'X', 'O', null, 'O', null, 'X'];
      expect(checkWin(board, 'O')).toBe(true);
    });
  });
});

describe('isBoardFull', () => {
  it('should return false for empty board', () => {
    const board: CellValue[] = Array<CellValue>(9).fill(null);
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

describe('isEarlyDraw', () => {
  it('should return false for empty board', () => {
    const board: CellValue[] = Array<CellValue>(9).fill(null);
    expect(isEarlyDraw(board)).toBe(false);
  });

  it('should return false when at least one line is not blocked', () => {
    // Board: X O _ / X O _ / _ _ _
    // Top-right diagonal [2,4,6] has no marks yet
    const board: CellValue[] = ['X', 'O', null, 'X', 'O', null, null, null, null];
    expect(isEarlyDraw(board)).toBe(false);
  });

  it('should return false for board with winning path still available', () => {
    // Board: X X _ / O O _ / _ _ _
    // Top row can still be won by X
    const board: CellValue[] = ['X', 'X', null, 'O', 'O', null, null, null, null];
    expect(isEarlyDraw(board)).toBe(false);
  });

  it('should return false when one player can still win diagonally', () => {
    // Board: X O _ / O X _ / _ _ X
    // Main diagonal [0,4,8] is all X - already a win, but line not blocked
    const board: CellValue[] = ['X', 'O', null, 'O', 'X', null, null, null, 'X'];
    expect(isEarlyDraw(board)).toBe(false);
  });

  it('should return false for typical mid-game position', () => {
    // Board: X _ _ / _ O _ / _ _ _
    const board: CellValue[] = ['X', null, null, null, 'O', null, null, null, null];
    expect(isEarlyDraw(board)).toBe(false);
  });

  it('should handle actual draw board (all cells filled)', () => {
    // Board: X O X / X O O / O X X
    const board: CellValue[] = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
    expect(isEarlyDraw(board)).toBe(true);
  });

  it('should return false when main diagonal is not blocked', () => {
    // Board: X O X / O X O / O X _
    // Main diagonal [0,4,8] has X, X, null - not blocked
    const board: CellValue[] = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', null];
    expect(isEarlyDraw(board)).toBe(false);
  });
});

describe('determineStatus', () => {
  it('should return x-wins when X has won', () => {
    const board: CellValue[] = ['X', 'X', 'X', null, 'O', 'O', null, null, null];
    expect(determineStatus(board, 'X', defaultPlayerConfigs)).toBe('x-wins');
  });

  it('should return o-wins when O has won', () => {
    const board: CellValue[] = ['X', null, 'X', 'O', 'O', 'O', null, 'X', null];
    expect(determineStatus(board, 'O', defaultPlayerConfigs)).toBe('o-wins');
  });

  it('should return draw when board is full with no winner', () => {
    // A draw scenario: X O X / X O O / O X X
    const board: CellValue[] = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
    expect(determineStatus(board, 'X', defaultPlayerConfigs)).toBe('draw');
  });

  it('should return playing when game is ongoing', () => {
    const board: CellValue[] = ['X', 'O', null, null, null, null, null, null, null];
    expect(determineStatus(board, 'O', defaultPlayerConfigs)).toBe('playing');
  });

  it('should return playing when winning path still exists', () => {
    // Board: X X _ / O O _ / _ _ _
    const board: CellValue[] = ['X', 'X', null, 'O', 'O', null, null, null, null];
    expect(determineStatus(board, 'O', defaultPlayerConfigs)).toBe('playing');
  });

  it('should detect draw when opponent cannot win on last move', () => {
    // Board: X O X / O X O / O X _
    // X has main diagonal [0,4,8] but it's O's turn (X just played)
    // O has no live lines, will block X's diagonal → draw
    const board: CellValue[] = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', null];
    expect(determineStatus(board, 'X', defaultPlayerConfigs)).toBe('draw');
  });

  it('should check only the last player who moved', () => {
    // X wins but we check for O - should be playing if O didn't win
    const board: CellValue[] = ['X', 'X', null, 'O', 'O', null, null, null, null];
    expect(determineStatus(board, 'O', defaultPlayerConfigs)).toBe('playing');
  });
});

describe('isValidMove', () => {
  const emptyBoard: CellValue[] = Array<CellValue>(9).fill(null);
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

describe('checkWin with custom symbols', () => {
  it('should detect win with star symbol in top row', () => {
    const board: CellValue[] = ['★', '★', '★', null, '🔵', '🔵', null, null, null];
    expect(checkWin(board, '★')).toBe(true);
    expect(checkWin(board, '🔵')).toBe(false);
  });

  it('should detect win with emoji symbols in column', () => {
    const board: CellValue[] = ['🔵', '★', null, '🔵', '★', null, '🔵', null, null];
    expect(checkWin(board, '🔵')).toBe(true);
    expect(checkWin(board, '★')).toBe(false);
  });

  it('should detect win with shape symbols in diagonal', () => {
    const board: CellValue[] = ['●', '■', null, '■', '●', null, null, null, '●'];
    expect(checkWin(board, '●')).toBe(true);
    expect(checkWin(board, '■')).toBe(false);
  });

  it('should detect win with moon and sun emojis', () => {
    const board: CellValue[] = [null, null, '🌙', '★', '🌙', '★', '🌙', null, null];
    expect(checkWin(board, '🌙')).toBe(true);
    expect(checkWin(board, '★')).toBe(false);
  });

  it('should return false when no winner with custom symbols', () => {
    const board: CellValue[] = ['★', '🔵', '★', null, null, null, null, null, null];
    expect(checkWin(board, '★')).toBe(false);
    expect(checkWin(board, '🔵')).toBe(false);
  });
});

describe('determineStatus with custom symbols', () => {
  it('should return x-wins when X wins with star symbol', () => {
    const board: CellValue[] = ['★', '★', '★', null, '🔵', '🔵', null, null, null];
    const customConfigs: PlayerConfigs = {
      X: { name: 'Player X', symbol: '★' },
      O: { name: 'Player O', symbol: '🔵' },
    };
    expect(determineStatus(board, 'X', customConfigs)).toBe('x-wins');
  });

  it('should return o-wins when O wins with emoji symbol', () => {
    const board: CellValue[] = ['★', null, '★', '🔵', '🔵', '🔵', null, '★', null];
    const customConfigs: PlayerConfigs = {
      X: { name: 'Player X', symbol: '★' },
      O: { name: 'Player O', symbol: '🔵' },
    };
    expect(determineStatus(board, 'O', customConfigs)).toBe('o-wins');
  });

  it('should return draw when board is full with custom symbols', () => {
    // Draw scenario with custom symbols: ● ■ ● / ● ■ ■ / ■ ● ●
    const board: CellValue[] = ['●', '■', '●', '●', '■', '■', '■', '●', '●'];
    const customConfigs: PlayerConfigs = {
      X: { name: 'Player X', symbol: '●' },
      O: { name: 'Player O', symbol: '■' },
    };
    expect(determineStatus(board, 'X', customConfigs)).toBe('draw');
  });

  it('should return playing when game is ongoing with custom symbols', () => {
    const board: CellValue[] = ['⭐', '🌙', null, null, null, null, null, null, null];
    const customConfigs: PlayerConfigs = {
      X: { name: 'Player X', symbol: '⭐' },
      O: { name: 'Player O', symbol: '🌙' },
    };
    expect(determineStatus(board, 'O', customConfigs)).toBe('playing');
  });

  it('should detect early draw with custom symbols', () => {
    // Board: ◆ ▲ ◆ / ▲ ◆ ▲ / ▲ ◆ _
    // All lines blocked except main diagonal which has all X, so will be early draw when last move is O
    const board: CellValue[] = ['◆', '▲', '◆', '▲', '◆', '▲', '▲', '◆', null];
    const customConfigs: PlayerConfigs = {
      X: { name: 'Player X', symbol: '◆' },
      O: { name: 'Player O', symbol: '▲' },
    };
    expect(determineStatus(board, 'X', customConfigs)).toBe('draw');
  });

  it('should work with sun and moon emoji symbols', () => {
    const board: CellValue[] = ['☀️', '☀️', '☀️', null, '🌙', '🌙', null, null, null];
    const customConfigs: PlayerConfigs = {
      X: { name: 'Player X', symbol: '☀️' },
      O: { name: 'Player O', symbol: '🌙' },
    };
    expect(determineStatus(board, 'X', customConfigs)).toBe('x-wins');
  });
});
