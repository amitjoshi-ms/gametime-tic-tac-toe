/**
 * Unit tests for board rendering.
 * Tests the board UI component rendering and event handling.
 * 
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderBoard, updateBoard } from '../../src/ui/board';
import type { GameState, CellValue } from '../../src/game/types';

describe('board rendering', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.className = 'board';
  });

  describe('renderBoard', () => {
    it('should create 9 cell elements', () => {
      const state: GameState = {
        board: Array.from({ length: 9 }, (): CellValue => null),
        currentPlayer: 'X',
        status: 'playing',
        playerConfigs: { X: { name: 'Player X', symbol: 'X' }, O: { name: 'Player O', symbol: 'O' } },
        gameMode: 'human',
        isComputerThinking: false,
      };
      const onCellClick = vi.fn();

      renderBoard(container, state, onCellClick);

      const cells = container.querySelectorAll('.cell');
      expect(cells).toHaveLength(9);
    });

    it('should render empty cells initially', () => {
      const state: GameState = {
        board: Array.from({ length: 9 }, (): CellValue => null),
        currentPlayer: 'X',
        status: 'playing',
        playerConfigs: { X: { name: 'Player X', symbol: 'X' }, O: { name: 'Player O', symbol: 'O' } },
        gameMode: 'human',
        isComputerThinking: false,
      };
      const onCellClick = vi.fn();

      renderBoard(container, state, onCellClick);

      const cells = container.querySelectorAll('.cell');
      cells.forEach((cell) => {
        expect(cell.textContent).toBe('');
      });
    });

    it('should render X marks correctly', () => {
      const state: GameState = {
        board: ['X', null, null, null, 'X', null, null, null, 'X'],
        currentPlayer: 'O',
        status: 'playing',
        playerConfigs: { X: { name: 'Player X', symbol: 'X' }, O: { name: 'Player O', symbol: 'O' } },
        gameMode: 'human',
        isComputerThinking: false,
      };
      const onCellClick = vi.fn();

      renderBoard(container, state, onCellClick);

      const cells = container.querySelectorAll('.cell');
      expect(cells[0]?.textContent).toBe('X');
      expect(cells[4]?.textContent).toBe('X');
      expect(cells[8]?.textContent).toBe('X');
    });

    it('should render O marks correctly', () => {
      const state: GameState = {
        board: ['O', 'X', null, 'O', null, null, 'O', null, null],
        currentPlayer: 'X',
        status: 'playing',
        playerConfigs: { X: { name: 'Player X', symbol: 'X' }, O: { name: 'Player O', symbol: 'O' } },
        gameMode: 'human',
        isComputerThinking: false,
      };
      const onCellClick = vi.fn();

      renderBoard(container, state, onCellClick);

      const cells = container.querySelectorAll('.cell');
      expect(cells[0]?.textContent).toBe('O');
      expect(cells[3]?.textContent).toBe('O');
      expect(cells[6]?.textContent).toBe('O');
    });

    it('should add cell--occupied class to occupied cells', () => {
      const state: GameState = {
        board: ['X', 'O', null, null, null, null, null, null, null],
        currentPlayer: 'X',
        status: 'playing',
        playerConfigs: { X: { name: 'Player X', symbol: 'X' }, O: { name: 'Player O', symbol: 'O' } },
        gameMode: 'human',
        isComputerThinking: false,
      };
      const onCellClick = vi.fn();

      renderBoard(container, state, onCellClick);

      const cells = container.querySelectorAll('.cell');
      expect(cells[0]?.classList.contains('cell--occupied')).toBe(true);
      expect(cells[1]?.classList.contains('cell--occupied')).toBe(true);
      expect(cells[2]?.classList.contains('cell--occupied')).toBe(false);
    });

    it('should disable all cells when game is over (x-wins)', () => {
      const state: GameState = {
        board: ['X', 'X', 'X', 'O', 'O', null, null, null, null],
        currentPlayer: 'O',
        status: 'x-wins',
        playerConfigs: { X: { name: 'Player X', symbol: 'X' }, O: { name: 'Player O', symbol: 'O' } },
        gameMode: 'human',
        isComputerThinking: false,
      };
      const onCellClick = vi.fn();

      renderBoard(container, state, onCellClick);

      const cells = container.querySelectorAll<HTMLButtonElement>('.cell');
      cells.forEach((cell) => {
        expect(cell.disabled).toBe(true);
        expect(cell.classList.contains('cell--disabled')).toBe(true);
      });
    });

    it('should disable all cells when game is draw', () => {
      const state: GameState = {
        board: ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'],
        currentPlayer: 'X',
        status: 'draw',
        playerConfigs: { X: { name: 'Player X', symbol: 'X' }, O: { name: 'Player O', symbol: 'O' } },
        gameMode: 'human',
        isComputerThinking: false,
      };
      const onCellClick = vi.fn();

      renderBoard(container, state, onCellClick);

      const cells = container.querySelectorAll<HTMLButtonElement>('.cell');
      cells.forEach((cell) => {
        expect(cell.disabled).toBe(true);
      });
    });

    it('should set data-index attribute for each cell', () => {
      const state: GameState = {
        board: Array.from({ length: 9 }, (): CellValue => null),
        currentPlayer: 'X',
        status: 'playing',
        playerConfigs: { X: { name: 'Player X', symbol: 'X' }, O: { name: 'Player O', symbol: 'O' } },
        gameMode: 'human',
        isComputerThinking: false,
      };
      const onCellClick = vi.fn();

      renderBoard(container, state, onCellClick);

      const cells = container.querySelectorAll('.cell');
      cells.forEach((cell, index) => {
        expect(cell.getAttribute('data-index')).toBe(String(index));
      });
    });

    it('should set aria-label for each cell', () => {
      const state: GameState = {
        board: Array.from({ length: 9 }, (): CellValue => null),
        currentPlayer: 'X',
        status: 'playing',
        playerConfigs: { X: { name: 'Player X', symbol: 'X' }, O: { name: 'Player O', symbol: 'O' } },
        gameMode: 'human',
        isComputerThinking: false,
      };
      const onCellClick = vi.fn();

      renderBoard(container, state, onCellClick);

      const cells = container.querySelectorAll('.cell');
      cells.forEach((cell, index) => {
        expect(cell.getAttribute('aria-label')).toBe(`Cell ${String(index + 1)}`);
      });
    });

    it('should update aria-label for occupied cells', () => {
      const state: GameState = {
        board: ['X', 'O', null, null, null, null, null, null, null],
        currentPlayer: 'X',
        status: 'playing',
        playerConfigs: { X: { name: 'Player X', symbol: 'X' }, O: { name: 'Player O', symbol: 'O' } },
        gameMode: 'human',
        isComputerThinking: false,
      };
      const onCellClick = vi.fn();

      renderBoard(container, state, onCellClick);

      const cells = container.querySelectorAll('.cell');
      expect(cells[0]?.getAttribute('aria-label')).toBe('Cell 1: X');
      expect(cells[1]?.getAttribute('aria-label')).toBe('Cell 2: O');
      expect(cells[2]?.getAttribute('aria-label')).toBe('Cell 3');
    });

    it('should call onCellClick when a cell is clicked', () => {
      const state: GameState = {
        board: Array.from({ length: 9 }, (): CellValue => null),
        currentPlayer: 'X',
        status: 'playing',
        playerConfigs: { X: { name: 'Player X', symbol: 'X' }, O: { name: 'Player O', symbol: 'O' } },
        gameMode: 'human',
        isComputerThinking: false,
      };
      const onCellClick = vi.fn();

      renderBoard(container, state, onCellClick);

      const firstCell = container.querySelector('.cell');
      firstCell?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(onCellClick).toHaveBeenCalledWith(0);
    });

    it('should add board--thinking class when computer is thinking', () => {
      const state: GameState = {
        board: ['X', null, null, null, null, null, null, null, null],
        currentPlayer: 'O',
        status: 'playing',
        playerConfigs: { X: { name: 'Player X', symbol: 'X' }, O: { name: 'Computer', symbol: 'O' } },
        gameMode: 'computer',
        isComputerThinking: true,
      };
      const onCellClick = vi.fn();

      renderBoard(container, state, onCellClick);

      expect(container.classList.contains('board--thinking')).toBe(true);
    });

    it('should not add board--thinking class when computer is not thinking', () => {
      const state: GameState = {
        board: Array.from({ length: 9 }, (): CellValue => null),
        currentPlayer: 'X',
        status: 'playing',
        playerConfigs: { X: { name: 'Player X', symbol: 'X' }, O: { name: 'Computer', symbol: 'O' } },
        gameMode: 'computer',
        isComputerThinking: false,
      };
      const onCellClick = vi.fn();

      renderBoard(container, state, onCellClick);

      expect(container.classList.contains('board--thinking')).toBe(false);
    });
  });

  describe('updateBoard', () => {
    it('should update cell content without full re-render', () => {
      const initialState: GameState = {
        board: Array.from({ length: 9 }, (): CellValue => null),
        currentPlayer: 'X',
        status: 'playing',
        playerConfigs: { X: { name: 'Player X', symbol: 'X' }, O: { name: 'Player O', symbol: 'O' } },
        gameMode: 'human',
        isComputerThinking: false,
      };
      const onCellClick = vi.fn();

      renderBoard(container, initialState, onCellClick);

      const updatedState: GameState = {
        board: ['X', null, null, null, null, null, null, null, null],
        currentPlayer: 'O',
        status: 'playing',
        playerConfigs: { X: { name: 'Player X', symbol: 'X' }, O: { name: 'Player O', symbol: 'O' } },
        gameMode: 'human',
        isComputerThinking: false,
      };

      updateBoard(container, updatedState);

      const cells = container.querySelectorAll('.cell');
      expect(cells[0]?.textContent).toBe('X');
    });

    it('should disable cells when game ends', () => {
      const playingState: GameState = {
        board: ['X', 'X', null, 'O', 'O', null, null, null, null],
        currentPlayer: 'X',
        status: 'playing',
        playerConfigs: { X: { name: 'Player X', symbol: 'X' }, O: { name: 'Player O', symbol: 'O' } },
        gameMode: 'human',
        isComputerThinking: false,
      };
      const onCellClick = vi.fn();

      renderBoard(container, playingState, onCellClick);

      const wonState: GameState = {
        board: ['X', 'X', 'X', 'O', 'O', null, null, null, null],
        currentPlayer: 'X',
        status: 'x-wins',
        playerConfigs: { X: { name: 'Player X', symbol: 'X' }, O: { name: 'Player O', symbol: 'O' } },
        gameMode: 'human',
        isComputerThinking: false,
      };

      updateBoard(container, wonState);

      const cells = container.querySelectorAll<HTMLButtonElement>('.cell');
      cells.forEach((cell) => {
        expect(cell.disabled).toBe(true);
      });
    });

    it('should update thinking state class', () => {
      const state: GameState = {
        board: ['X', null, null, null, null, null, null, null, null],
        currentPlayer: 'O',
        status: 'playing',
        playerConfigs: { X: { name: 'Player X', symbol: 'X' }, O: { name: 'Computer', symbol: 'O' } },
        gameMode: 'computer',
        isComputerThinking: false,
      };
      const onCellClick = vi.fn();

      renderBoard(container, state, onCellClick);

      const thinkingState: GameState = {
        ...state,
        isComputerThinking: true,
      };

      updateBoard(container, thinkingState);

      expect(container.classList.contains('board--thinking')).toBe(true);
    });

    it('should update aria-labels when cells change', () => {
      const state: GameState = {
        board: Array.from({ length: 9 }, (): CellValue => null),
        currentPlayer: 'X',
        status: 'playing',
        playerConfigs: { X: { name: 'Player X', symbol: 'X' }, O: { name: 'Player O', symbol: 'O' } },
        gameMode: 'human',
        isComputerThinking: false,
      };
      const onCellClick = vi.fn();

      renderBoard(container, state, onCellClick);

      const updatedState: GameState = {
        board: ['X', 'O', null, null, null, null, null, null, null],
        currentPlayer: 'X',
        status: 'playing',
        playerConfigs: { X: { name: 'Player X', symbol: 'X' }, O: { name: 'Player O', symbol: 'O' } },
        gameMode: 'human',
        isComputerThinking: false,
      };

      updateBoard(container, updatedState);

      const cells = container.querySelectorAll('.cell');
      expect(cells[0]?.getAttribute('aria-label')).toBe('Cell 1: X');
      expect(cells[1]?.getAttribute('aria-label')).toBe('Cell 2: O');
    });
  });
});
