/**
 * Type definitions for the Tic-Tac-Toe game.
 * These types represent the core domain model.
 *
 * @module game/types
 */

/**
 * Available symbols for players to choose from.
 * Includes classic letters, shapes, and emojis for variety.
 */
export const AVAILABLE_SYMBOLS = [
  'X',
  'O',
  '●',
  '■',
  '▲',
  '◆',
  '★',
  '🔵',
  '🔴',
  '⭐',
  '🌙',
  '☀️',
] as const;

/** Type representing any available player symbol */
export type PlayerSymbol = (typeof AVAILABLE_SYMBOLS)[number];

/** Possible values for a cell on the board */
export type CellValue = PlayerSymbol | null;

/** The two players (internal representation) */
export type Player = 'X' | 'O';

/** Possible game outcomes */
export type GameStatus = 'playing' | 'x-wins' | 'o-wins' | 'draw';

/**
 * Game mode determines opponent behavior.
 * - 'human': Two human players take turns
 * - 'computer': Human (X) vs AI opponent (O)
 * - 'demo': AI vs AI (both players computer-controlled)
 * - 'remote': Two human players on different devices via P2P
 */
export type GameMode = 'human' | 'computer' | 'demo' | 'remote';

/**
 * Connection state for remote multiplayer.
 */
export type ConnectionStatus =
  | 'idle'
  | 'creating'
  | 'waiting'
  | 'waiting-for-peer'
  | 'joining'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

/**
 * Player information for remote game.
 */
export interface RemotePlayer {
  /** Display name (from localStorage or default) */
  name: string;
  /** Assigned symbol (X for creator, O for joiner) */
  symbol: Player;
  /** Whether this is the local player */
  isLocal: boolean;
}

/**
 * Remote multiplayer session state.
 */
export interface RemoteSession {
  /** 6-character session identifier for display */
  sessionId: string;
  /** Full encoded SDP for connection */
  sessionCode: string | null;
  /** Current connection status */
  connectionStatus: ConnectionStatus;
  /** Local player info */
  localPlayer: RemotePlayer;
  /** Remote player info (null until connected) */
  remotePlayer: RemotePlayer | null;
  /** Error message if connection failed */
  error: string | null;
  /** Whether local player is the session creator (host) */
  isHost: boolean;
  /** Who started the last/current game (for alternating starts on rematch) */
  lastStartingPlayer: Player;
}

/** Player configuration including name and symbol */
export interface PlayerConfig {
  name: string;
  symbol: PlayerSymbol;
}

/** Player configurations for both players */
export interface PlayerConfigs {
  X: PlayerConfig;
  O: PlayerConfig;
}

/** @deprecated Use PlayerConfigs instead */
export interface PlayerNames {
  X: string;
  O: string;
}

/**
 * Complete game state at any point in time.
 *
 * Invariants:
 * - board always has exactly 9 elements
 * - If status !== 'playing', no more moves are accepted
 * - Number of X marks >= number of O marks (X always goes first)
 * - isComputerThinking can be true when gameMode === 'computer' or 'demo'
 * - remoteSession !== null only when gameMode === 'remote'
 */
export interface GameState {
  /** 9-element array representing the 3x3 board (indices 0-8) */
  board: CellValue[];
  /** Which player moves next */
  currentPlayer: Player;
  /** Current game status */
  status: GameStatus;
  /** Custom configurations (name and symbol) for both players */
  playerConfigs: PlayerConfigs;
  /** Current game mode (human vs computer vs demo vs remote) */
  gameMode: GameMode;
  /** True while computer is "thinking" (during delay before move) */
  isComputerThinking: boolean;
  /** Remote session state (null unless in remote mode) */
  remoteSession: RemoteSession | null;
}

/**
 * Tuple of 3 indices representing a winning line.
 * Used to check rows, columns, and diagonals.
 */
export type WinningLine = [number, number, number];

// ============================================
// Message Types for Remote Multiplayer
// ============================================

/**
 * Initial handshake to exchange player info.
 */
export interface HandshakeMessage {
  type: 'handshake';
  playerName: string;
  protocolVersion: number;
}

/**
 * Player move notification.
 */
export interface MoveMessage {
  type: 'move';
  cellIndex: number;
  player: Player;
  moveNumber: number;
}

/**
 * Request to play again.
 */
export interface RematchRequestMessage {
  type: 'rematch-request';
}

/**
 * Response to rematch request.
 */
export interface RematchResponseMessage {
  type: 'rematch-response';
  accepted: boolean;
}

/**
 * Graceful disconnect notification.
 */
export interface DisconnectMessage {
  type: 'disconnect';
  reason: 'left' | 'error';
}

/**
 * Game reset notification (New Game clicked).
 */
export interface GameResetMessage {
  type: 'game-reset';
}

/**
 * Player info update notification (name/symbol changed).
 */
export interface PlayerUpdateMessage {
  type: 'player-update';
  name: string;
  symbol: string;
}

/**
 * Union type for all messages exchanged over DataChannel.
 */
export type GameMessage =
  | HandshakeMessage
  | MoveMessage
  | RematchRequestMessage
  | RematchResponseMessage
  | DisconnectMessage
  | GameResetMessage
  | PlayerUpdateMessage;
