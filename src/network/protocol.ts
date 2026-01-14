/**
 * Protocol definitions for P2P game communication.
 * Handles message types, serialization, and validation.
 *
 * @module network/protocol
 */

import type {
  Player,
  CellValue,
  GameMessage,
  HandshakeMessage,
  MoveMessage,
  RematchRequestMessage,
  RematchResponseMessage,
  DisconnectMessage,
  GameResetMessage,
  PlayerUpdateMessage,
} from '../game/types';

/** Current protocol version - increment on breaking changes */
export const PROTOCOL_VERSION = 1;

/** Session ID character set (unambiguous alphanumeric) */
export const SESSION_ID_CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

/** Session ID length */
export const SESSION_ID_LENGTH = 6;

/**
 * Generates a random session ID.
 * Uses unambiguous characters (no 0/O, 1/I/L).
 *
 * @returns 6-character session ID
 *
 * @example
 * generateSessionId() // 'A3K9PW'
 */
export function generateSessionId(): string {
  let id = '';
  for (let i = 0; i < SESSION_ID_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * SESSION_ID_CHARS.length);
    const char = SESSION_ID_CHARS[randomIndex];
    if (char !== undefined) {
      id += char;
    }
  }
  return id;
}

/**
 * Serializes a message for transmission.
 *
 * @param message - Message to serialize
 * @returns JSON string
 */
export function serializeMessage(message: GameMessage): string {
  return JSON.stringify(message);
}

/**
 * Type guard for HandshakeMessage.
 */
function isHandshakeMessage(obj: unknown): obj is HandshakeMessage {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const candidate = obj as Record<string, unknown>;
  return (
    candidate.type === 'handshake' &&
    typeof candidate.playerName === 'string' &&
    typeof candidate.protocolVersion === 'number'
  );
}

/**
 * Type guard for MoveMessage.
 */
function isMoveMessage(obj: unknown): obj is MoveMessage {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const candidate = obj as Record<string, unknown>;
  return (
    candidate.type === 'move' &&
    typeof candidate.cellIndex === 'number' &&
    (candidate.player === 'X' || candidate.player === 'O') &&
    typeof candidate.moveNumber === 'number'
  );
}

/**
 * Type guard for RematchRequestMessage.
 */
function isRematchRequestMessage(obj: unknown): obj is RematchRequestMessage {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const candidate = obj as Record<string, unknown>;
  return candidate.type === 'rematch-request';
}

/**
 * Type guard for RematchResponseMessage.
 */
function isRematchResponseMessage(obj: unknown): obj is RematchResponseMessage {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const candidate = obj as Record<string, unknown>;
  // startingPlayer is optional, only present when accepted
  const hasValidStartingPlayer =
    candidate.startingPlayer === undefined ||
    candidate.startingPlayer === 'X' ||
    candidate.startingPlayer === 'O';
  return (
    candidate.type === 'rematch-response' &&
    typeof candidate.accepted === 'boolean' &&
    hasValidStartingPlayer
  );
}

/**
 * Type guard for DisconnectMessage.
 */
function isDisconnectMessage(obj: unknown): obj is DisconnectMessage {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const candidate = obj as Record<string, unknown>;
  return (
    candidate.type === 'disconnect' &&
    (candidate.reason === 'left' || candidate.reason === 'error')
  );
}

/**
 * Type guard for GameResetMessage.
 */
function isGameResetMessage(obj: unknown): obj is GameResetMessage {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const candidate = obj as Record<string, unknown>;
  return candidate.type === 'game-reset';
}

/**
 * Type guard for PlayerUpdateMessage.
 */
function isPlayerUpdateMessage(obj: unknown): obj is PlayerUpdateMessage {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const candidate = obj as Record<string, unknown>;
  return (
    candidate.type === 'player-update' &&
    typeof candidate.name === 'string' &&
    typeof candidate.symbol === 'string'
  );
}

/**
 * Deserializes a received message.
 * Validates structure and returns typed message.
 *
 * @param data - Raw string from DataChannel
 * @returns Parsed message or null if invalid
 */
export function deserializeMessage(data: string): GameMessage | null {
  try {
    const parsed: unknown = JSON.parse(data);

    if (isHandshakeMessage(parsed)) {
      return parsed;
    }
    if (isMoveMessage(parsed)) {
      return parsed;
    }
    if (isRematchRequestMessage(parsed)) {
      return parsed;
    }
    if (isRematchResponseMessage(parsed)) {
      return parsed;
    }
    if (isDisconnectMessage(parsed)) {
      return parsed;
    }
    if (isGameResetMessage(parsed)) {
      return parsed;
    }
    if (isPlayerUpdateMessage(parsed)) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Validates a move message against current game state.
 *
 * @param message - Move message to validate
 * @param board - Current board state
 * @param expectedPlayer - Player whose turn it is
 * @param expectedMoveNumber - Expected move sequence number
 * @returns true if move is valid
 */
export function validateMoveMessage(
  message: MoveMessage,
  board: CellValue[],
  expectedPlayer: Player,
  expectedMoveNumber: number
): boolean {
  // Check player matches expected turn
  if (message.player !== expectedPlayer) {
    return false;
  }

  // Check move number matches expected sequence
  if (message.moveNumber !== expectedMoveNumber) {
    return false;
  }

  // Check cell index is valid
  if (message.cellIndex < 0 || message.cellIndex > 8) {
    return false;
  }

  // Check cell is empty
  if (board[message.cellIndex] !== null) {
    return false;
  }

  return true;
}

/**
 * Creates a handshake message.
 *
 * @param playerName - Local player's display name
 * @returns Handshake message
 */
export function createHandshakeMessage(playerName: string): HandshakeMessage {
  return {
    type: 'handshake',
    playerName,
    protocolVersion: PROTOCOL_VERSION,
  };
}

/**
 * Creates a move message.
 *
 * @param cellIndex - Index of the cell being marked
 * @param player - Player making the move
 * @param moveNumber - Sequence number of this move
 * @returns Move message
 */
export function createMoveMessage(
  cellIndex: number,
  player: Player,
  moveNumber: number
): MoveMessage {
  return {
    type: 'move',
    cellIndex,
    player,
    moveNumber,
  };
}

/**
 * Creates a rematch request message.
 *
 * @returns Rematch request message
 */
export function createRematchRequestMessage(): RematchRequestMessage {
  return {
    type: 'rematch-request',
  };
}

/**
 * Creates a rematch response message.
 *
 * @param accepted - Whether rematch is accepted
 * @param startingPlayer - Which player starts (required when accepted)
 * @returns Rematch response message
 */
export function createRematchResponseMessage(
  accepted: boolean,
  startingPlayer?: Player
): RematchResponseMessage {
  if (accepted && startingPlayer) {
    return {
      type: 'rematch-response',
      accepted,
      startingPlayer,
    };
  }
  return {
    type: 'rematch-response',
    accepted,
  };
}

/**
 * Creates a disconnect message.
 *
 * @param reason - Reason for disconnection
 * @returns Disconnect message
 */
export function createDisconnectMessage(
  reason: 'left' | 'error'
): DisconnectMessage {
  return {
    type: 'disconnect',
    reason,
  };
}

/**
 * Creates a game reset message.
 *
 * @returns Game reset message
 */
export function createGameResetMessage(): GameResetMessage {
  return {
    type: 'game-reset',
  };
}

/**
 * Creates a player update message.
 *
 * @param name - Updated player name
 * @param symbol - Updated player symbol
 * @returns Player update message
 */
export function createPlayerUpdateMessage(
  name: string,
  symbol: string
): PlayerUpdateMessage {
  return {
    type: 'player-update',
    name,
    symbol,
  };
}
