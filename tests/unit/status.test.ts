/**
 * Unit tests for status display with custom player names.
 * Tests that status messages use custom names correctly.
 */

import { describe, it, expect } from 'vitest';
import { getStatusMessage } from '../../src/ui/status';
import type { GameState } from '../../src/game/types';

describe('getStatusMessage with custom names', () => {
  it('should show custom name for X turn', () => {
    const state: GameState = {
      board: [null, null, null, null, null, null, null, null, null],
      currentPlayer: 'X',
      status: 'playing',
      playerConfigs: { X: { name: 'Alice', symbol: 'X' as const }, O: { name: 'Bob', symbol: 'O' as const } },
      gameMode: 'human',
      isComputerThinking: false,
    };

    const message = getStatusMessage(state);
    expect(message).toBe("Alice (X)'s Turn");
  });

  it('should show custom name for O turn', () => {
    const state: GameState = {
      board: ['X', null, null, null, null, null, null, null, null],
      currentPlayer: 'O',
      status: 'playing',
      playerConfigs: { X: { name: 'Alice', symbol: 'X' as const }, O: { name: 'Bob', symbol: 'O' as const } },
      gameMode: 'human',
      isComputerThinking: false,
    };

    const message = getStatusMessage(state);
    expect(message).toBe("Bob (O)'s Turn");
  });

  it('should show custom name when X wins', () => {
    const state: GameState = {
      board: ['X', 'X', 'X', 'O', 'O', null, null, null, null],
      currentPlayer: 'O',
      status: 'x-wins',
      playerConfigs: { X: { name: 'Alice', symbol: 'X' as const }, O: { name: 'Bob', symbol: 'O' as const } },
      gameMode: 'human',
      isComputerThinking: false,
    };

    const message = getStatusMessage(state);
    expect(message).toBe('🎉 Alice (X) Wins!');
  });

  it('should show custom name when O wins', () => {
    const state: GameState = {
      board: ['X', 'X', null, 'O', 'O', 'O', null, null, null],
      currentPlayer: 'X',
      status: 'o-wins',
      playerConfigs: { X: { name: 'Alice', symbol: 'X' as const }, O: { name: 'Bob', symbol: 'O' as const } },
      gameMode: 'human',
      isComputerThinking: false,
    };

    const message = getStatusMessage(state);
    expect(message).toBe('🎉 Bob (O) Wins!');
  });

  it('should show draw message regardless of names', () => {
    const state: GameState = {
      board: ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'],
      currentPlayer: 'X',
      status: 'draw',
      playerConfigs: { X: { name: 'Alice', symbol: 'X' as const }, O: { name: 'Bob', symbol: 'O' as const } },
      gameMode: 'human',
      isComputerThinking: false,
    };

    const message = getStatusMessage(state);
    expect(message).toBe("It's a Draw!");
  });

  it('should work with default player names', () => {
    const state: GameState = {
      board: [null, null, null, null, null, null, null, null, null],
      currentPlayer: 'X',
      status: 'playing',
      playerConfigs: { X: { name: 'Player X', symbol: 'X' as const }, O: { name: 'Player O', symbol: 'O' as const } },
      gameMode: 'human',
      isComputerThinking: false,
    };

    const message = getStatusMessage(state);
    expect(message).toBe("Player X (X)'s Turn");
  });

  it('should handle names with special characters', () => {
    const state: GameState = {
      board: [null, null, null, null, null, null, null, null, null],
      currentPlayer: 'X',
      status: 'playing',
      playerConfigs: { X: { name: "O'Brien", symbol: 'X' as const }, O: { name: 'José', symbol: 'O' as const } },
      gameMode: 'human',
      isComputerThinking: false,
    };

    const message = getStatusMessage(state);
    expect(message).toBe("O'Brien (X)'s Turn");
  });
});

describe('getStatusMessage with computer thinking', () => {
  it('should show thinking message when computer is thinking', () => {
    const state: GameState = {
      board: ['X', null, null, null, null, null, null, null, null],
      currentPlayer: 'O',
      status: 'playing',
      playerConfigs: { X: { name: 'Player X', symbol: 'X' as const }, O: { name: 'Computer', symbol: 'O' as const } },
      gameMode: 'computer',
      isComputerThinking: true,
    };

    const message = getStatusMessage(state);
    expect(message).toBe('Computer is thinking');
  });

  it('should use custom computer name in thinking message', () => {
    const state: GameState = {
      board: ['X', null, null, null, null, null, null, null, null],
      currentPlayer: 'O',
      status: 'playing',
      playerConfigs: { X: { name: 'Alice', symbol: 'X' as const }, O: { name: 'HAL 9000', symbol: 'O' as const } },
      gameMode: 'computer',
      isComputerThinking: true,
    };

    const message = getStatusMessage(state);
    expect(message).toBe('HAL 9000 is thinking');
  });

  it('should show normal turn message when not thinking', () => {
    const state: GameState = {
      board: [null, null, null, null, null, null, null, null, null],
      currentPlayer: 'X',
      status: 'playing',
      playerConfigs: { X: { name: 'Player X', symbol: 'X' as const }, O: { name: 'Computer', symbol: 'O' as const } },
      gameMode: 'computer',
      isComputerThinking: false,
    };

    const message = getStatusMessage(state);
    expect(message).toBe("Player X (X)'s Turn");
  });

  it('should prioritize thinking state over turn display', () => {
    const state: GameState = {
      board: ['X', null, null, null, null, null, null, null, null],
      currentPlayer: 'O',
      status: 'playing',
      playerConfigs: { X: { name: 'Alice', symbol: 'X' as const }, O: { name: 'Computer', symbol: 'O' as const } },
      gameMode: 'computer',
      isComputerThinking: true,
    };

    const message = getStatusMessage(state);
    // Should show "thinking" not "Computer's Turn"
    expect(message).toBe('Computer is thinking');
    expect(message).not.toContain('Turn');
  });
});
