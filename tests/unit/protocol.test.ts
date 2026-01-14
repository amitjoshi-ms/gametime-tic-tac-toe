/**
 * Unit tests for protocol functions.
 * Tests message serialization, deserialization, and validation.
 */

import { describe, it, expect } from 'vitest';
import {
  generateSessionId,
  serializeMessage,
  deserializeMessage,
  validateMoveMessage,
  createHandshakeMessage,
  createMoveMessage,
  createRematchRequestMessage,
  createRematchResponseMessage,
  createDisconnectMessage,
  createGameResetMessage,
  createPlayerUpdateMessage,
  PROTOCOL_VERSION,
  SESSION_ID_CHARS,
  SESSION_ID_LENGTH,
} from '../../src/network/protocol';
import type { CellValue, MoveMessage } from '../../src/game/types';

describe('generateSessionId', () => {
  it('should generate 6-character ID', () => {
    const id = generateSessionId();
    expect(id).toHaveLength(SESSION_ID_LENGTH);
  });

  it('should only use unambiguous characters', () => {
    // Generate multiple IDs to test character set
    for (let i = 0; i < 100; i++) {
      const id = generateSessionId();
      for (const char of id) {
        expect(SESSION_ID_CHARS).toContain(char);
      }
    }
  });

  it('should not contain ambiguous characters (0, O, 1, I, L)', () => {
    // Generate multiple IDs
    for (let i = 0; i < 100; i++) {
      const id = generateSessionId();
      expect(id).not.toContain('0');
      expect(id).not.toContain('1');
      expect(id).not.toContain('I');
      expect(id).not.toContain('L');
      expect(id).not.toContain('O');
    }
  });

  it('should generate unique IDs', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateSessionId());
    }
    // With 30 characters and 6 positions, collisions should be very rare
    expect(ids.size).toBeGreaterThan(95);
  });
});

describe('serializeMessage/deserializeMessage', () => {
  it('should roundtrip handshake message', () => {
    const original = createHandshakeMessage('Alice');
    const serialized = serializeMessage(original);
    const deserialized = deserializeMessage(serialized);

    expect(deserialized).toEqual(original);
    expect(deserialized?.type).toBe('handshake');
    if (deserialized?.type === 'handshake') {
      expect(deserialized.playerName).toBe('Alice');
      expect(deserialized.protocolVersion).toBe(PROTOCOL_VERSION);
    }
  });

  it('should roundtrip move message', () => {
    const original = createMoveMessage(4, 'X', 1);
    const serialized = serializeMessage(original);
    const deserialized = deserializeMessage(serialized);

    expect(deserialized).toEqual(original);
    expect(deserialized?.type).toBe('move');
    if (deserialized?.type === 'move') {
      expect(deserialized.cellIndex).toBe(4);
      expect(deserialized.player).toBe('X');
      expect(deserialized.moveNumber).toBe(1);
    }
  });

  it('should roundtrip rematch request message', () => {
    const original = createRematchRequestMessage();
    const serialized = serializeMessage(original);
    const deserialized = deserializeMessage(serialized);

    expect(deserialized).toEqual(original);
    expect(deserialized?.type).toBe('rematch-request');
  });

  it('should roundtrip rematch response message (accepted)', () => {
    const original = createRematchResponseMessage(true);
    const serialized = serializeMessage(original);
    const deserialized = deserializeMessage(serialized);

    expect(deserialized).toEqual(original);
    expect(deserialized?.type).toBe('rematch-response');
    if (deserialized?.type === 'rematch-response') {
      expect(deserialized.accepted).toBe(true);
    }
  });

  it('should roundtrip rematch response message (declined)', () => {
    const original = createRematchResponseMessage(false);
    const serialized = serializeMessage(original);
    const deserialized = deserializeMessage(serialized);

    expect(deserialized).toEqual(original);
    if (deserialized?.type === 'rematch-response') {
      expect(deserialized.accepted).toBe(false);
    }
  });

  it('should roundtrip disconnect message (left)', () => {
    const original = createDisconnectMessage('left');
    const serialized = serializeMessage(original);
    const deserialized = deserializeMessage(serialized);

    expect(deserialized).toEqual(original);
    expect(deserialized?.type).toBe('disconnect');
    if (deserialized?.type === 'disconnect') {
      expect(deserialized.reason).toBe('left');
    }
  });

  it('should roundtrip disconnect message (error)', () => {
    const original = createDisconnectMessage('error');
    const serialized = serializeMessage(original);
    const deserialized = deserializeMessage(serialized);

    expect(deserialized).toEqual(original);
    if (deserialized?.type === 'disconnect') {
      expect(deserialized.reason).toBe('error');
    }
  });

  it('should return null for invalid JSON', () => {
    expect(deserializeMessage('not json')).toBeNull();
    expect(deserializeMessage('{')).toBeNull();
    expect(deserializeMessage('')).toBeNull();
  });

  it('should return null for unknown message type', () => {
    expect(deserializeMessage('{"type": "unknown"}')).toBeNull();
    expect(deserializeMessage('{"type": "foo", "data": 123}')).toBeNull();
  });

  it('should return null for malformed messages', () => {
    // Handshake missing playerName
    expect(
      deserializeMessage('{"type": "handshake", "protocolVersion": 1}')
    ).toBeNull();

    // Move missing cellIndex
    expect(
      deserializeMessage('{"type": "move", "player": "X", "moveNumber": 1}')
    ).toBeNull();

    // Move with invalid player
    expect(
      deserializeMessage(
        '{"type": "move", "cellIndex": 0, "player": "Z", "moveNumber": 1}'
      )
    ).toBeNull();

    // Rematch response missing accepted
    expect(deserializeMessage('{"type": "rematch-response"}')).toBeNull();

    // Disconnect with invalid reason
    expect(
      deserializeMessage('{"type": "disconnect", "reason": "timeout"}')
    ).toBeNull();
  });
});

describe('validateMoveMessage', () => {
  it('should accept valid move', () => {
    const message: MoveMessage = {
      type: 'move',
      cellIndex: 4,
      player: 'X',
      moveNumber: 1,
    };
    const board = Array<CellValue>(9).fill(null);

    expect(validateMoveMessage(message, board, 'X', 1)).toBe(true);
  });

  it('should reject move for wrong player', () => {
    const message: MoveMessage = {
      type: 'move',
      cellIndex: 4,
      player: 'O',
      moveNumber: 1,
    };
    const board = Array<CellValue>(9).fill(null);

    expect(validateMoveMessage(message, board, 'X', 1)).toBe(false);
  });

  it('should reject move to occupied cell', () => {
    const message: MoveMessage = {
      type: 'move',
      cellIndex: 4,
      player: 'X',
      moveNumber: 2,
    };
    const board = Array<CellValue>(9).fill(null);
    board[4] = 'O';

    expect(validateMoveMessage(message, board, 'X', 2)).toBe(false);
  });

  it('should reject move with wrong sequence number', () => {
    const message: MoveMessage = {
      type: 'move',
      cellIndex: 4,
      player: 'X',
      moveNumber: 2,
    };
    const board = Array<CellValue>(9).fill(null);

    expect(validateMoveMessage(message, board, 'X', 1)).toBe(false);
  });

  it('should reject move with invalid cell index (negative)', () => {
    const message: MoveMessage = {
      type: 'move',
      cellIndex: -1,
      player: 'X',
      moveNumber: 1,
    };
    const board = Array<CellValue>(9).fill(null);

    expect(validateMoveMessage(message, board, 'X', 1)).toBe(false);
  });

  it('should reject move with invalid cell index (too high)', () => {
    const message: MoveMessage = {
      type: 'move',
      cellIndex: 9,
      player: 'X',
      moveNumber: 1,
    };
    const board = Array<CellValue>(9).fill(null);

    expect(validateMoveMessage(message, board, 'X', 1)).toBe(false);
  });

  it('should accept moves at board boundaries', () => {
    const board = Array<CellValue>(9).fill(null);

    // First cell
    const message1: MoveMessage = {
      type: 'move',
      cellIndex: 0,
      player: 'X',
      moveNumber: 1,
    };
    expect(validateMoveMessage(message1, board, 'X', 1)).toBe(true);

    // Last cell
    const message2: MoveMessage = {
      type: 'move',
      cellIndex: 8,
      player: 'O',
      moveNumber: 2,
    };
    board[0] = 'X';
    expect(validateMoveMessage(message2, board, 'O', 2)).toBe(true);
  });
});

describe('createHandshakeMessage', () => {
  it('should create valid handshake message', () => {
    const message = createHandshakeMessage('TestPlayer');
    expect(message.type).toBe('handshake');
    expect(message.playerName).toBe('TestPlayer');
    expect(message.protocolVersion).toBe(PROTOCOL_VERSION);
  });
});

describe('createMoveMessage', () => {
  it('should create valid move message', () => {
    const message = createMoveMessage(3, 'O', 4);
    expect(message.type).toBe('move');
    expect(message.cellIndex).toBe(3);
    expect(message.player).toBe('O');
    expect(message.moveNumber).toBe(4);
  });
});

describe('createGameResetMessage', () => {
  it('should create valid game reset message', () => {
    const message = createGameResetMessage();
    expect(message.type).toBe('game-reset');
  });

  it('should roundtrip through serialization', () => {
    const original = createGameResetMessage();
    const serialized = serializeMessage(original);
    const deserialized = deserializeMessage(serialized);

    expect(deserialized).toEqual(original);
    expect(deserialized?.type).toBe('game-reset');
  });
});

describe('createPlayerUpdateMessage', () => {
  it('should create valid player update message', () => {
    const message = createPlayerUpdateMessage('Alice', '🎮');
    expect(message.type).toBe('player-update');
    expect(message.name).toBe('Alice');
    expect(message.symbol).toBe('🎮');
  });

  it('should roundtrip through serialization', () => {
    const original = createPlayerUpdateMessage('Bob', '⭐');
    const serialized = serializeMessage(original);
    const deserialized = deserializeMessage(serialized);

    expect(deserialized).toEqual(original);
    expect(deserialized?.type).toBe('player-update');
    if (deserialized?.type === 'player-update') {
      expect(deserialized.name).toBe('Bob');
      expect(deserialized.symbol).toBe('⭐');
    }
  });

  it('should handle empty name', () => {
    const message = createPlayerUpdateMessage('', 'X');
    expect(message.name).toBe('');
    expect(message.symbol).toBe('X');
  });
});
