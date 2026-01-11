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
      playerNames: { X: 'Alice', O: 'Bob' },
    };

    const message = getStatusMessage(state);
    expect(message).toBe("Alice's Turn");
  });

  it('should show custom name for O turn', () => {
    const state: GameState = {
      board: ['X', null, null, null, null, null, null, null, null],
      currentPlayer: 'O',
      status: 'playing',
      playerNames: { X: 'Alice', O: 'Bob' },
    };

    const message = getStatusMessage(state);
    expect(message).toBe("Bob's Turn");
  });

  it('should show custom name when X wins', () => {
    const state: GameState = {
      board: ['X', 'X', 'X', 'O', 'O', null, null, null, null],
      currentPlayer: 'O',
      status: 'x-wins',
      playerNames: { X: 'Alice', O: 'Bob' },
    };

    const message = getStatusMessage(state);
    expect(message).toBe('🎉 Alice Wins!');
  });

  it('should show custom name when O wins', () => {
    const state: GameState = {
      board: ['X', 'X', null, 'O', 'O', 'O', null, null, null],
      currentPlayer: 'X',
      status: 'o-wins',
      playerNames: { X: 'Alice', O: 'Bob' },
    };

    const message = getStatusMessage(state);
    expect(message).toBe('🎉 Bob Wins!');
  });

  it('should show draw message regardless of names', () => {
    const state: GameState = {
      board: ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'],
      currentPlayer: 'X',
      status: 'draw',
      playerNames: { X: 'Alice', O: 'Bob' },
    };

    const message = getStatusMessage(state);
    expect(message).toBe("It's a Draw!");
  });

  it('should work with default player names', () => {
    const state: GameState = {
      board: [null, null, null, null, null, null, null, null, null],
      currentPlayer: 'X',
      status: 'playing',
      playerNames: { X: 'Player X', O: 'Player O' },
    };

    const message = getStatusMessage(state);
    expect(message).toBe("Player X's Turn");
  });

  it('should handle names with special characters', () => {
    const state: GameState = {
      board: [null, null, null, null, null, null, null, null, null],
      currentPlayer: 'X',
      status: 'playing',
      playerNames: { X: "O'Brien", O: 'José' },
    };

    const message = getStatusMessage(state);
    expect(message).toBe("O'Brien's Turn");
  });
});
