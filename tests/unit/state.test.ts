/**
 * Unit tests for game state management.
 * Tests state creation, move making, and game reset.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createInitialState,
  makeMove,
  resetGame,
  resetStartingPlayerState,
  setComputerThinking,
  isComputerTurn,
  resetRemoteGameKeepSymbols,
} from '../../src/game/state';
import type { GameState, RemoteSession } from '../../src/game/types';

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

  it('should include playerConfigs from localStorage by default', () => {
    const state = createInitialState();
    expect(state.playerConfigs).toBeDefined();
    expect(state.playerConfigs.X).toBeDefined();
    expect(state.playerConfigs.O).toBeDefined();
  });

  it('should use provided playerConfigs when parameter is given', () => {
    const customConfigs = {
      X: { name: 'Alice', symbol: 'X' as const },
      O: { name: 'Bob', symbol: 'O' as const },
    };
    const state = createInitialState(customConfigs);
    expect(state.playerConfigs).toEqual(customConfigs);
    expect(state.playerConfigs.X.name).toBe('Alice');
    expect(state.playerConfigs.O.name).toBe('Bob');
  });

  it('should not modify the original playerConfigs object', () => {
    const customConfigs = {
      X: { name: 'Alice', symbol: 'X' as const },
      O: { name: 'Bob', symbol: 'O' as const },
    };
    const state = createInitialState(customConfigs);
    customConfigs.X.name = 'Changed';
    expect(state.playerConfigs.X.name).toBe('Alice');
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

  it('should detect early draw before board is full', () => {
    // Play a game that results in early draw: X X O / O O X / X O _
    let state = createInitialState();
    state = makeMove(state, 0); // X at 0
    state = makeMove(state, 3); // O at 3
    state = makeMove(state, 1); // X at 1
    state = makeMove(state, 4); // O at 4
    state = makeMove(state, 5); // X at 5
    state = makeMove(state, 2); // O at 2
    state = makeMove(state, 6); // X at 6
    state = makeMove(state, 7); // O at 7 - Early draw detected!

    expect(state.status).toBe('draw');
    expect(state.board[8]).toBe(null); // Cell 8 is still empty
    // Verify board has one empty cell
    const emptyCells = state.board.filter((cell) => cell === null).length;
    expect(emptyCells).toBe(1);
  });
});

describe('resetGame', () => {
  beforeEach(() => {
    // Reset the module-level state before each test for deterministic behavior
    resetStartingPlayerState();
  });

  it('should return a fresh state with empty board', () => {
    const state = resetGame();
    expect(state.board).toHaveLength(9);
    expect(state.board.every((cell) => cell === null)).toBe(true);
    expect(state.status).toBe('playing');
  });

  it('should alternate starting player between resets', () => {
    // First reset - should start with X (deterministic due to beforeEach)
    const state1 = resetGame();
    expect(state1.currentPlayer).toBe('X');

    // Second reset - should start with O
    const state2 = resetGame();
    expect(state2.currentPlayer).toBe('O');

    // Third reset - should start with X again
    const state3 = resetGame();
    expect(state3.currentPlayer).toBe('X');

    // Fourth reset - should start with O again
    const state4 = resetGame();
    expect(state4.currentPlayer).toBe('O');
  });

  it('should create a new state after a played game', () => {
    const initialState = createInitialState();
    const afterMove1 = makeMove(initialState, 0);
    makeMove(afterMove1, 1);

    const freshState = resetGame();
    expect(freshState.board[0]).toBe(null);
    expect(freshState.board[1]).toBe(null);
    // Starting player will alternate
    expect(['X', 'O']).toContain(freshState.currentPlayer);
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

describe('setComputerThinking', () => {
  it('should set isComputerThinking to true', () => {
    const state = createInitialState();
    const newState = setComputerThinking(state, true);
    expect(newState.isComputerThinking).toBe(true);
  });

  it('should set isComputerThinking to false', () => {
    const state = { ...createInitialState(), isComputerThinking: true };
    const newState = setComputerThinking(state, false);
    expect(newState.isComputerThinking).toBe(false);
  });

  it('should not modify original state (immutability)', () => {
    const state = createInitialState();
    const newState = setComputerThinking(state, true);
    expect(state.isComputerThinking).toBe(false);
    expect(newState).not.toBe(state);
  });

  it('should preserve other state properties', () => {
    let state = createInitialState();
    state = makeMove(state, 0); // Place X
    const newState = setComputerThinking(state, true);
    
    expect(newState.board[0]).toBe('X');
    expect(newState.currentPlayer).toBe('O');
    expect(newState.status).toBe('playing');
  });
});

describe('isComputerTurn', () => {
  it('should return false in human mode', () => {
    const state = resetGame('human');
    expect(isComputerTurn(state)).toBe(false);
  });

  it('should return true when O turn in computer mode', () => {
    let state = resetGame('computer');
    state = makeMove(state, 0); // X moves, now O's turn
    expect(state.currentPlayer).toBe('O');
    expect(isComputerTurn(state)).toBe(true);
  });

  it('should return false when X turn in computer mode', () => {
    const state = resetGame('computer');
    // Assuming X starts
    if (state.currentPlayer === 'X') {
      expect(isComputerTurn(state)).toBe(false);
    }
  });

  it('should return false when game is over', () => {
    let state = resetGame('computer');
    // Create a winning state for X (diagonal)
    state = makeMove(state, 0); // X
    state = makeMove(state, 1); // O
    state = makeMove(state, 4); // X
    state = makeMove(state, 2); // O
    state = makeMove(state, 8); // X wins
    
    expect(state.status).toBe('x-wins');
    expect(isComputerTurn(state)).toBe(false);
  });

  it('should return false when computer is already thinking', () => {
    let state = resetGame('computer');
    state = makeMove(state, 0); // X moves, now O's turn
    state = setComputerThinking(state, true);
    
    expect(isComputerTurn(state)).toBe(false);
  });

  it('should return true when O starts in computer mode', () => {
    // Reset to ensure we can control starting player
    resetStartingPlayerState();
    resetGame('computer'); // X starts
    const state = resetGame('computer'); // O starts
    
    if (state.currentPlayer === 'O') {
      expect(isComputerTurn(state)).toBe(true);
    }
  });
});

describe('resetGame with game mode', () => {
  it('should preserve human mode when resetting', () => {
    const state = resetGame('human');
    expect(state.gameMode).toBe('human');
  });

  it('should preserve computer mode when resetting', () => {
    const state = resetGame('computer');
    expect(state.gameMode).toBe('computer');
  });

  it('should default to human mode when no mode provided', () => {
    const state = resetGame();
    expect(state.gameMode).toBe('human');
  });

  it('should reset isComputerThinking to false', () => {
    const state = resetGame('computer');
    expect(state.isComputerThinking).toBe(false);
  });
});

describe('resetRemoteGameKeepSymbols', () => {
  function createRemoteState(
    localSymbol: 'X' | 'O',
    currentPlayer: 'X' | 'O'
  ): GameState {
    const remoteSession: RemoteSession = {
      sessionId: 'TEST',
      sessionCode: 'TEST123',
      connectionStatus: 'connected',
      localPlayer: {
        symbol: localSymbol,
        name: 'Local Player',
        isLocal: true,
      },
      remotePlayer: {
        symbol: localSymbol === 'X' ? 'O' : 'X',
        name: 'Remote Player',
        isLocal: false,
      },
      error: null,
      isHost: localSymbol === 'X',
    };

    return {
      ...resetGame('remote'),
      currentPlayer,
      board: ['X', 'O', 'X', null, null, null, null, null, null],
      status: 'x-wins',
      remoteSession,
    };
  }

  it('should reset the board to empty', () => {
    const state = createRemoteState('X', 'O');
    const newState = resetRemoteGameKeepSymbols(state);

    expect(newState.board.every((cell) => cell === null)).toBe(true);
  });

  it('should keep the same current player (not swap)', () => {
    const state = createRemoteState('X', 'O');
    // After game ends, currentPlayer was O
    const newState = resetRemoteGameKeepSymbols(state);

    // Should keep same player order, X starts new game
    expect(newState.currentPlayer).toBe('X');
  });

  it('should reset status to playing', () => {
    const state = createRemoteState('X', 'O');
    expect(state.status).toBe('x-wins');

    const newState = resetRemoteGameKeepSymbols(state);
    expect(newState.status).toBe('playing');
  });

  it('should preserve remote session', () => {
    const state = createRemoteState('X', 'O');
    const newState = resetRemoteGameKeepSymbols(state);

    expect(newState.remoteSession).toBeDefined();
    expect(newState.remoteSession?.localPlayer.symbol).toBe('X');
    expect(newState.remoteSession?.remotePlayer.symbol).toBe('O');
  });

  it('should preserve player configs', () => {
    const state = createRemoteState('X', 'O');
    state.playerConfigs.X.name = 'Alice';
    state.playerConfigs.O.name = 'Bob';

    const newState = resetRemoteGameKeepSymbols(state);

    expect(newState.playerConfigs.X.name).toBe('Alice');
    expect(newState.playerConfigs.O.name).toBe('Bob');
  });

  it('should preserve game mode as remote', () => {
    const state = createRemoteState('X', 'O');
    const newState = resetRemoteGameKeepSymbols(state);

    expect(newState.gameMode).toBe('remote');
  });

  it('should create immutable state', () => {
    const state = createRemoteState('X', 'O');
    const newState = resetRemoteGameKeepSymbols(state);

    expect(newState).not.toBe(state);
    expect(newState.board).not.toBe(state.board);
  });
});
