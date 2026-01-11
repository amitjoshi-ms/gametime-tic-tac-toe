/**
 * Unit tests for game state management.
 * Tests state creation, move making, and game reset.
 */

import { describe, it, expect } from 'vitest';
import { createInitialState, makeMove, resetGame } from '../../src/game/state';

describe('createInitialState', () => {
  it('should create an empty board with 9 cells', () => {
    const state = createInitialState();
    expect(state.board).toHaveLength(9);
    expect(state.board.every((cell) => cell === null)).toBe(true);
  });

  it('should start with X as the current player', () => {
    const state = createInitialState();
    expect(state.currentPlayer).toBe('X');
  });

  it('should start with playing status', () => {
    const state = createInitialState();
    expect(state.status).toBe('playing');
  });

  it('should create a new state each time', () => {
    const state1 = createInitialState();
    const state2 = createInitialState();
    expect(state1).not.toBe(state2);
    expect(state1.board).not.toBe(state2.board);
  });
});

describe('makeMove', () => {
  it('should place X at the specified cell', () => {
    const state = createInitialState();
    const newState = makeMove(state, 0);

    expect(newState.board[0]).toBe('X');
    expect(newState.currentPlayer).toBe('O');
  });

  it('should alternate players after each move', () => {
    let state = createInitialState();
    expect(state.currentPlayer).toBe('X');

    state = makeMove(state, 0);
    expect(state.currentPlayer).toBe('O');

    state = makeMove(state, 1);
    expect(state.currentPlayer).toBe('X');

    state = makeMove(state, 2);
    expect(state.currentPlayer).toBe('O');
  });

  it('should not modify the original state (immutability)', () => {
    const state = createInitialState();
    const originalBoard = [...state.board];
    const newState = makeMove(state, 0);

    expect(state.board).toEqual(originalBoard);
    expect(state).not.toBe(newState);
    expect(state.board).not.toBe(newState.board);
  });

  it('should return the same state reference for invalid moves', () => {
    const state = createInitialState();
    const stateAfterMove = makeMove(state, 0);
    
    // Try to place on occupied cell
    const sameState = makeMove(stateAfterMove, 0);
    expect(sameState).toBe(stateAfterMove);
  });

  it('should not allow moves after game is won', () => {
    // Set up a winning scenario for X
    let state = createInitialState();
    state = makeMove(state, 0); // X at 0
    state = makeMove(state, 3); // O at 3
    state = makeMove(state, 1); // X at 1
    state = makeMove(state, 4); // O at 4
    state = makeMove(state, 2); // X at 2 - X wins (top row)

    expect(state.status).toBe('x-wins');

    // Attempt move after win
    const stateAfterAttempt = makeMove(state, 5);
    expect(stateAfterAttempt).toBe(state); // Same reference
  });

  it('should detect X win correctly', () => {
    let state = createInitialState();
    state = makeMove(state, 0); // X
    state = makeMove(state, 3); // O
    state = makeMove(state, 1); // X
    state = makeMove(state, 4); // O
    state = makeMove(state, 2); // X wins (top row)

    expect(state.status).toBe('x-wins');
  });

  it('should detect O win correctly', () => {
    let state = createInitialState();
    state = makeMove(state, 0); // X at 0
    state = makeMove(state, 3); // O at 3
    state = makeMove(state, 1); // X at 1
    state = makeMove(state, 4); // O at 4
    state = makeMove(state, 8); // X at 8
    state = makeMove(state, 5); // O at 5 - O wins (middle row)

    expect(state.status).toBe('o-wins');
  });

  it('should detect draw correctly', () => {
    // Play a draw game: X O X / X O O / O X X
    let state = createInitialState();
    state = makeMove(state, 0); // X at 0
    state = makeMove(state, 1); // O at 1
    state = makeMove(state, 2); // X at 2
    state = makeMove(state, 4); // O at 4
    state = makeMove(state, 3); // X at 3
    state = makeMove(state, 5); // O at 5
    state = makeMove(state, 7); // X at 7
    state = makeMove(state, 6); // O at 6
    state = makeMove(state, 8); // X at 8 - Draw

    expect(state.status).toBe('draw');
  });
});

describe('resetGame', () => {
  it('should return a fresh initial state', () => {
    const state = resetGame();
    expect(state.board).toHaveLength(9);
    expect(state.board.every((cell) => cell === null)).toBe(true);
    expect(state.currentPlayer).toBe('X');
    expect(state.status).toBe('playing');
  });

  it('should be equivalent to createInitialState', () => {
    const state1 = resetGame();
    const state2 = createInitialState();

    expect(state1).toEqual(state2);
  });

  it('should create a new state after a played game', () => {
    const initialState = createInitialState();
    const afterMove1 = makeMove(initialState, 0);
    makeMove(afterMove1, 1);

    const freshState = resetGame();
    expect(freshState.board[0]).toBe(null);
    expect(freshState.board[1]).toBe(null);
    expect(freshState.currentPlayer).toBe('X');
  });
});

describe('full game scenarios', () => {
  it('should handle a complete X win game (diagonal)', () => {
    let state = createInitialState();

    // X: 0, O: 1, X: 4, O: 2, X: 8 (diagonal win)
    state = makeMove(state, 0); // X
    expect(state.status).toBe('playing');

    state = makeMove(state, 1); // O
    expect(state.status).toBe('playing');

    state = makeMove(state, 4); // X
    expect(state.status).toBe('playing');

    state = makeMove(state, 2); // O
    expect(state.status).toBe('playing');

    state = makeMove(state, 8); // X wins (main diagonal)
    expect(state.status).toBe('x-wins');
    expect(state.board[0]).toBe('X');
    expect(state.board[4]).toBe('X');
    expect(state.board[8]).toBe('X');
  });

  it('should handle a complete O win game (column)', () => {
    let state = createInitialState();

    // X: 0, O: 1, X: 3, O: 4, X: 8, O: 7 (middle column win)
    state = makeMove(state, 0); // X
    state = makeMove(state, 1); // O
    state = makeMove(state, 3); // X
    state = makeMove(state, 4); // O
    state = makeMove(state, 8); // X
    state = makeMove(state, 7); // O wins (middle column)

    expect(state.status).toBe('o-wins');
  });
});
