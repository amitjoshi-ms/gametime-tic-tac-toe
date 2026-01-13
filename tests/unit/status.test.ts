/**
 * Unit tests for status display with custom player names.
 * Tests that status messages use custom names correctly.
 */

import { describe, it, expect } from 'vitest';
import { getStatusMessage } from '../../src/ui/status';
import type { GameState } from '../../src/game/types';

describe('getStatusMessage with custom names', () => {
  it('should show custom name for X turn without symbol when using default X', () => {
    const state: GameState = {
      board: [null, null, null, null, null, null, null, null, null],
      currentPlayer: 'X',
      status: 'playing',
      playerConfigs: { X: { name: 'Alice', symbol: 'X' as const }, O: { name: 'Bob', symbol: 'O' as const } },
      gameMode: 'human',
      isComputerThinking: false,
      remoteSession: null,
    };

    const message = getStatusMessage(state);
    expect(message).toBe("Alice's Turn");
  });

  it('should show custom name for O turn without symbol when using default O', () => {
    const state: GameState = {
      board: ['X', null, null, null, null, null, null, null, null],
      currentPlayer: 'O',
      status: 'playing',
      playerConfigs: { X: { name: 'Alice', symbol: 'X' as const }, O: { name: 'Bob', symbol: 'O' as const } },
      gameMode: 'human',
      isComputerThinking: false,
      remoteSession: null,
    };

    const message = getStatusMessage(state);
    expect(message).toBe("Bob's Turn");
  });

  it('should show custom name when X wins without symbol when using default X', () => {
    const state: GameState = {
      board: ['X', 'X', 'X', 'O', 'O', null, null, null, null],
      currentPlayer: 'O',
      status: 'x-wins',
      playerConfigs: { X: { name: 'Alice', symbol: 'X' as const }, O: { name: 'Bob', symbol: 'O' as const } },
      gameMode: 'human',
      isComputerThinking: false,
      remoteSession: null,
    };

    const message = getStatusMessage(state);
    expect(message).toBe('🎉 Alice Wins!');
  });

  it('should show custom name when O wins without symbol when using default O', () => {
    const state: GameState = {
      board: ['X', 'X', null, 'O', 'O', 'O', null, null, null],
      currentPlayer: 'X',
      status: 'o-wins',
      playerConfigs: { X: { name: 'Alice', symbol: 'X' as const }, O: { name: 'Bob', symbol: 'O' as const } },
      gameMode: 'human',
      isComputerThinking: false,
      remoteSession: null,
    };

    const message = getStatusMessage(state);
    expect(message).toBe('🎉 Bob Wins!');
  });

  it('should show draw message regardless of names', () => {
    const state: GameState = {
      board: ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'],
      currentPlayer: 'X',
      status: 'draw',
      playerConfigs: { X: { name: 'Alice', symbol: 'X' as const }, O: { name: 'Bob', symbol: 'O' as const } },
      gameMode: 'human',
      isComputerThinking: false,
      remoteSession: null,
    };

    const message = getStatusMessage(state);
    expect(message).toBe("It's a Draw!");
  });

  it('should work with default player names without showing symbol', () => {
    const state: GameState = {
      board: [null, null, null, null, null, null, null, null, null],
      currentPlayer: 'X',
      status: 'playing',
      playerConfigs: { X: { name: 'Player X', symbol: 'X' as const }, O: { name: 'Player O', symbol: 'O' as const } },
      gameMode: 'human',
      isComputerThinking: false,
      remoteSession: null,
    };

    const message = getStatusMessage(state);
    expect(message).toBe("Player X's Turn");
  });

  it('should handle names with special characters without showing symbol for default', () => {
    const state: GameState = {
      board: [null, null, null, null, null, null, null, null, null],
      currentPlayer: 'X',
      status: 'playing',
      playerConfigs: { X: { name: "O'Brien", symbol: 'X' as const }, O: { name: 'José', symbol: 'O' as const } },
      gameMode: 'human',
      isComputerThinking: false,
      remoteSession: null,
    };

    const message = getStatusMessage(state);
    expect(message).toBe("O'Brien's Turn");
  });

  it('should show symbol when using custom symbol', () => {
    const state: GameState = {
      board: [null, null, null, null, null, null, null, null, null],
      currentPlayer: 'X',
      status: 'playing',
      playerConfigs: { X: { name: 'Alice', symbol: '★' as const }, O: { name: 'Bob', symbol: '🔵' as const } },
      gameMode: 'human',
      isComputerThinking: false,
    remoteSession: null,
    };

    const message = getStatusMessage(state);
    expect(message).toBe("Alice (★)'s Turn");
  });

  it('should show custom symbol in win message', () => {
    const state: GameState = {
      board: ['★', '★', '★', '🔵', '🔵', null, null, null, null],
      currentPlayer: 'O',
      status: 'x-wins',
      playerConfigs: { X: { name: 'Alice', symbol: '★' as const }, O: { name: 'Bob', symbol: '🔵' as const } },
      gameMode: 'human',
      isComputerThinking: false,
    remoteSession: null,
    };

    const message = getStatusMessage(state);
    expect(message).toBe('🎉 Alice (★) Wins!');
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
      remoteSession: null,
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
      remoteSession: null,
    };

    const message = getStatusMessage(state);
    expect(message).toBe('HAL 9000 is thinking');
  });

  it('should show normal turn message when not thinking without symbol for default', () => {
    const state: GameState = {
      board: [null, null, null, null, null, null, null, null, null],
      currentPlayer: 'X',
      status: 'playing',
      playerConfigs: { X: { name: 'Player X', symbol: 'X' as const }, O: { name: 'Computer', symbol: 'O' as const } },
      gameMode: 'computer',
      isComputerThinking: false,
      remoteSession: null,
    };

    const message = getStatusMessage(state);
    expect(message).toBe("Player X's Turn");
  });

  it('should prioritize thinking state over turn display', () => {
    const state: GameState = {
      board: ['X', null, null, null, null, null, null, null, null],
      currentPlayer: 'O',
      status: 'playing',
      playerConfigs: { X: { name: 'Alice', symbol: 'X' as const }, O: { name: 'Computer', symbol: 'O' as const } },
      gameMode: 'computer',
      isComputerThinking: true,
      remoteSession: null,
    };

    const message = getStatusMessage(state);
    // Should show "thinking" not "Computer's Turn"
    expect(message).toBe('Computer is thinking');
    expect(message).not.toContain('Turn');
  });
});

describe('getStatusMessage with demo mode', () => {
  it('should show demo prefix during turn', () => {
    const state: GameState = {
      board: [null, null, null, null, null, null, null, null, null],
      currentPlayer: 'X',
      status: 'playing',
      playerConfigs: { X: { name: 'Player X', symbol: 'X' as const }, O: { name: 'Player O', symbol: 'O' as const } },
      gameMode: 'demo',
      isComputerThinking: false,
    remoteSession: null,
    };

    const message = getStatusMessage(state);
    expect(message).toBe("🎬 Player X's Turn");
  });

  it('should show demo prefix when X wins', () => {
    const state: GameState = {
      board: ['X', 'X', 'X', 'O', 'O', null, null, null, null],
      currentPlayer: 'O',
      status: 'x-wins',
      playerConfigs: { X: { name: 'Player X', symbol: 'X' as const }, O: { name: 'Player O', symbol: 'O' as const } },
      gameMode: 'demo',
      isComputerThinking: false,
    remoteSession: null,
    };

    const message = getStatusMessage(state);
    expect(message).toBe('🎬 🎉 Player X Wins!');
  });

  it('should show demo prefix when O wins', () => {
    const state: GameState = {
      board: ['X', 'X', null, 'O', 'O', 'O', null, null, null],
      currentPlayer: 'X',
      status: 'o-wins',
      playerConfigs: { X: { name: 'Player X', symbol: 'X' as const }, O: { name: 'Player O', symbol: 'O' as const } },
      gameMode: 'demo',
      isComputerThinking: false,
    remoteSession: null,
    };

    const message = getStatusMessage(state);
    expect(message).toBe('🎬 🎉 Player O Wins!');
  });

  it('should show demo prefix on draw', () => {
    const state: GameState = {
      board: ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'],
      currentPlayer: 'X',
      status: 'draw',
      playerConfigs: { X: { name: 'Player X', symbol: 'X' as const }, O: { name: 'Player O', symbol: 'O' as const } },
      gameMode: 'demo',
      isComputerThinking: false,
    remoteSession: null,
    };

    const message = getStatusMessage(state);
    expect(message).toBe("🎬 It's a Draw!");
  });

  it('should show demo prefix when computer is thinking', () => {
    const state: GameState = {
      board: ['X', null, null, null, null, null, null, null, null],
      currentPlayer: 'O',
      status: 'playing',
      playerConfigs: { X: { name: 'Player X', symbol: 'X' as const }, O: { name: 'Player O', symbol: 'O' as const } },
      gameMode: 'demo',
      isComputerThinking: true,
    remoteSession: null,
    };

    const message = getStatusMessage(state);
    expect(message).toBe('🎬 Player O is thinking');
  });

  it('should show demo prefix with custom symbols in win message', () => {
    const state: GameState = {
      board: ['★', '★', '★', '🔵', '🔵', null, null, null, null],
      currentPlayer: 'O',
      status: 'x-wins',
      playerConfigs: { X: { name: 'Alice', symbol: '★' as const }, O: { name: 'Bob', symbol: '🔵' as const } },
      gameMode: 'demo',
      isComputerThinking: false,
    remoteSession: null,
    };

    const message = getStatusMessage(state);
    expect(message).toBe('🎬 🎉 Alice (★) Wins!');
  });
});
