/**
 * Unit tests for remote game logic.
 * Tests turn detection and local player symbol functions.
 *
 * @module tests/unit/remote
 */

import { describe, it, expect } from 'vitest';
import { isLocalPlayerTurn, getLocalPlayerSymbol } from '../../src/game/remote';
import { resetGame, createRemoteGameState } from '../../src/game/state';
import type { GameState, RemoteSession } from '../../src/game/types';

describe('isLocalPlayerTurn', () => {
  describe('non-remote modes', () => {
    it('should return false for human mode', () => {
      const state = resetGame('human');
      expect(isLocalPlayerTurn(state)).toBe(false);
    });

    it('should return false for computer mode', () => {
      const state = resetGame('computer');
      expect(isLocalPlayerTurn(state)).toBe(false);
    });

    it('should return false for demo mode', () => {
      const state = resetGame('demo');
      expect(isLocalPlayerTurn(state)).toBe(false);
    });
  });

  describe('remote mode without session', () => {
    it('should return false when remoteSession is null', () => {
      const state: GameState = {
        ...resetGame('remote'),
        remoteSession: null,
      };
      expect(isLocalPlayerTurn(state)).toBe(false);
    });
  });

  describe('remote mode with session', () => {
    function createRemoteState(
      localSymbol: 'X' | 'O',
      currentPlayer: 'X' | 'O',
      status: GameState['status'] = 'playing',
      connectionStatus: RemoteSession['connectionStatus'] = 'connected'
    ): GameState {
      const remoteSession: RemoteSession = {
        sessionId: 'TEST',
        sessionCode: 'TEST123',
        connectionStatus,
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
        lastStartingPlayer: 'X',
      };

      return {
        ...resetGame('remote'),
        currentPlayer,
        status,
        remoteSession,
      };
    }

    it('should return true when it is local player X turn', () => {
      const state = createRemoteState('X', 'X');
      expect(isLocalPlayerTurn(state)).toBe(true);
    });

    it('should return true when it is local player O turn', () => {
      const state = createRemoteState('O', 'O');
      expect(isLocalPlayerTurn(state)).toBe(true);
    });

    it('should return false when it is remote player turn (local X, current O)', () => {
      const state = createRemoteState('X', 'O');
      expect(isLocalPlayerTurn(state)).toBe(false);
    });

    it('should return false when it is remote player turn (local O, current X)', () => {
      const state = createRemoteState('O', 'X');
      expect(isLocalPlayerTurn(state)).toBe(false);
    });

    it('should return false when game is over (x-wins)', () => {
      const state = createRemoteState('X', 'X', 'x-wins');
      expect(isLocalPlayerTurn(state)).toBe(false);
    });

    it('should return false when game is over (o-wins)', () => {
      const state = createRemoteState('O', 'O', 'o-wins');
      expect(isLocalPlayerTurn(state)).toBe(false);
    });

    it('should return false when game is over (draw)', () => {
      const state = createRemoteState('X', 'X', 'draw');
      expect(isLocalPlayerTurn(state)).toBe(false);
    });

    it('should return false when connection is connecting', () => {
      const state = createRemoteState('X', 'X', 'playing', 'connecting');
      expect(isLocalPlayerTurn(state)).toBe(false);
    });

    it('should return false when connection is waiting', () => {
      const state = createRemoteState('X', 'X', 'playing', 'waiting');
      expect(isLocalPlayerTurn(state)).toBe(false);
    });

    it('should return false when connection is disconnected', () => {
      const state = createRemoteState('X', 'X', 'playing', 'disconnected');
      expect(isLocalPlayerTurn(state)).toBe(false);
    });

    it('should return false when connection is error', () => {
      const state = createRemoteState('X', 'X', 'playing', 'error');
      expect(isLocalPlayerTurn(state)).toBe(false);
    });
  });
});

describe('getLocalPlayerSymbol', () => {
  describe('non-remote modes', () => {
    it('should return null for human mode', () => {
      const state = resetGame('human');
      expect(getLocalPlayerSymbol(state)).toBe(null);
    });

    it('should return null for computer mode', () => {
      const state = resetGame('computer');
      expect(getLocalPlayerSymbol(state)).toBe(null);
    });

    it('should return null for demo mode', () => {
      const state = resetGame('demo');
      expect(getLocalPlayerSymbol(state)).toBe(null);
    });
  });

  describe('remote mode without session', () => {
    it('should return null when remoteSession is null', () => {
      const state: GameState = {
        ...resetGame('remote'),
        remoteSession: null,
      };
      expect(getLocalPlayerSymbol(state)).toBe(null);
    });
  });

  describe('remote mode with session', () => {
    it('should return X when local player is X (host)', () => {
      // createRemoteGameState takes isHost as first param - true means X
      const state = createRemoteGameState(true, 'Local');
      expect(getLocalPlayerSymbol(state)).toBe('X');
    });

    it('should return O when local player is O (guest)', () => {
      // createRemoteGameState takes isHost as first param - false means O
      const state = createRemoteGameState(false, 'Local');
      expect(getLocalPlayerSymbol(state)).toBe('O');
    });
  });
});
