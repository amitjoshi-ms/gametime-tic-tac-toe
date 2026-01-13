# Module Contracts: Remote Multiplayer

**Feature**: 004-remote-multiplayer  
**Date**: January 12, 2026  
**Purpose**: Define module interfaces and function signatures

## New Modules

### src/network/protocol.ts

Message type definitions and serialization.

```typescript
/**
 * Protocol definitions for P2P game communication.
 * 
 * @module network/protocol
 */

/** Current protocol version - increment on breaking changes */
export const PROTOCOL_VERSION = 1;

/** Session ID character set (unambiguous alphanumeric) */
export const SESSION_ID_CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

/** Session ID length */
export const SESSION_ID_LENGTH = 6;

// Message type definitions (from data-model.md)
export type GameMessage = 
  | HandshakeMessage 
  | MoveMessage 
  | RematchRequestMessage 
  | RematchResponseMessage 
  | DisconnectMessage;

export interface HandshakeMessage {
  type: 'handshake';
  playerName: string;
  protocolVersion: number;
}

export interface MoveMessage {
  type: 'move';
  cellIndex: number;
  player: Player;
  moveNumber: number;
}

export interface RematchRequestMessage {
  type: 'rematch-request';
}

export interface RematchResponseMessage {
  type: 'rematch-response';
  accepted: boolean;
}

export interface DisconnectMessage {
  type: 'disconnect';
  reason: 'left' | 'error';
}

/**
 * Generates a random session ID.
 * Uses unambiguous characters (no 0/O, 1/I/L).
 * 
 * @returns 6-character session ID
 * 
 * @example
 * generateSessionId() // 'A3K9PW'
 */
export function generateSessionId(): string;

/**
 * Serializes a message for transmission.
 * 
 * @param message - Message to serialize
 * @returns JSON string
 */
export function serializeMessage(message: GameMessage): string;

/**
 * Deserializes a received message.
 * Validates structure and returns typed message.
 * 
 * @param data - Raw string from DataChannel
 * @returns Parsed message or null if invalid
 */
export function deserializeMessage(data: string): GameMessage | null;

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
): boolean;
```

### src/network/signaling.ts

WebRTC signaling via SDP encoding/decoding.

```typescript
/**
 * Signaling helpers for WebRTC connection establishment.
 * Uses manual SDP exchange (copy/paste) - no signaling server.
 * 
 * @module network/signaling
 */

/**
 * Encoded session offer/answer for sharing.
 */
export interface EncodedSession {
  /** Human-readable session ID */
  id: string;
  /** Base64-encoded SDP */
  sdp: string;
  /** Whether this is an offer or answer */
  type: 'offer' | 'answer';
}

/**
 * Encodes an SDP description for sharing.
 * Compresses and base64-encodes the SDP.
 * 
 * @param description - RTCSessionDescription to encode
 * @param sessionId - Human-readable session ID
 * @returns Encoded string for sharing
 * 
 * @example
 * const code = encodeSessionDescription(offer, 'A3K9PW');
 * // Returns: 'A3K9PW:eyJ0eXBlIjoib2ZmZXIi...'
 */
export function encodeSessionDescription(
  description: RTCSessionDescription,
  sessionId: string
): string;

/**
 * Decodes a shared session code.
 * 
 * @param code - Encoded session string
 * @returns Decoded session or null if invalid
 */
export function decodeSessionCode(code: string): EncodedSession | null;

/**
 * Extracts session ID from URL hash if present.
 * 
 * @returns Session code from URL or null
 * 
 * @example
 * // URL: https://game.example.com/#join=A3K9PW:eyJ...
 * getSessionFromURL() // Returns full session code
 */
export function getSessionFromURL(): string | null;

/**
 * Updates URL hash with session code.
 * 
 * @param code - Session code to put in URL
 */
export function setSessionInURL(code: string): void;

/**
 * Clears session code from URL hash.
 */
export function clearSessionFromURL(): void;

/**
 * Copies text to clipboard.
 * 
 * @param text - Text to copy
 * @returns Promise resolving when copied
 */
export function copyToClipboard(text: string): Promise<void>;
```

### src/network/peer.ts

WebRTC peer connection management.

```typescript
/**
 * WebRTC peer connection wrapper.
 * Manages RTCPeerConnection and DataChannel lifecycle.
 * 
 * @module network/peer
 */

import type { GameMessage } from './protocol';

/** Default ICE servers (public STUN) */
export const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

/** Connection timeout in milliseconds */
export const CONNECTION_TIMEOUT = 30000;

/**
 * Peer connection event handlers.
 */
export interface PeerConnectionHandlers {
  /** Called when DataChannel opens */
  onOpen: () => void;
  /** Called when message received */
  onMessage: (message: GameMessage) => void;
  /** Called when connection closes */
  onClose: () => void;
  /** Called on connection error */
  onError: (error: Error) => void;
  /** Called with ICE connection state changes */
  onStateChange: (state: RTCIceConnectionState) => void;
}

/**
 * Creates a new peer connection as the host (offer creator).
 * 
 * @param handlers - Event handlers
 * @returns Object with connection management functions
 * 
 * @example
 * const host = await createHostConnection({
 *   onOpen: () => console.log('Connected!'),
 *   onMessage: (msg) => handleMessage(msg),
 *   onClose: () => console.log('Disconnected'),
 *   onError: (err) => console.error(err),
 *   onStateChange: (state) => updateUI(state),
 * });
 * 
 * const offer = await host.createOffer();
 * // Share offer with peer...
 * await host.acceptAnswer(peerAnswer);
 */
export function createHostConnection(
  handlers: PeerConnectionHandlers
): Promise<HostConnection>;

export interface HostConnection {
  /** Generate SDP offer (includes ICE candidates) */
  createOffer(): Promise<RTCSessionDescription>;
  /** Process answer from joining peer */
  acceptAnswer(answer: RTCSessionDescription): Promise<void>;
  /** Send message to peer */
  send(message: GameMessage): void;
  /** Close connection and cleanup */
  close(): void;
}

/**
 * Creates a new peer connection as the guest (answer creator).
 * 
 * @param handlers - Event handlers
 * @returns Object with connection management functions
 * 
 * @example
 * const guest = await createGuestConnection({
 *   onOpen: () => console.log('Connected!'),
 *   onMessage: (msg) => handleMessage(msg),
 *   onClose: () => console.log('Disconnected'),
 *   onError: (err) => console.error(err),
 *   onStateChange: (state) => updateUI(state),
 * });
 * 
 * const answer = await guest.acceptOffer(hostOffer);
 * // Share answer with host...
 */
export function createGuestConnection(
  handlers: PeerConnectionHandlers
): Promise<GuestConnection>;

export interface GuestConnection {
  /** Process offer and generate answer */
  acceptOffer(offer: RTCSessionDescription): Promise<RTCSessionDescription>;
  /** Send message to peer */
  send(message: GameMessage): void;
  /** Close connection and cleanup */
  close(): void;
}

/**
 * Waits for ICE gathering to complete.
 * 
 * @param connection - RTCPeerConnection to wait on
 * @param timeout - Maximum wait time in ms
 * @returns Promise resolving when complete or timeout
 */
export function waitForIceGathering(
  connection: RTCPeerConnection,
  timeout?: number
): Promise<void>;
```

### src/game/remote.ts

Remote game session logic.

```typescript
/**
 * Remote multiplayer game session management.
 * Coordinates between peer connection and game state.
 * 
 * @module game/remote
 */

import type { GameState, Player, CellValue } from './types';
import type { GameMessage } from '../network/protocol';

/**
 * Remote session controller interface.
 * Returned by startRemoteSession functions.
 */
export interface RemoteSessionController {
  /** Send a move to remote peer */
  sendMove(cellIndex: number): void;
  /** Request a rematch */
  requestRematch(): void;
  /** Accept/decline rematch request */
  respondToRematch(accept: boolean): void;
  /** Leave the session */
  leave(): void;
  /** Get current move count for validation */
  getMoveCount(): number;
}

/**
 * Callbacks for remote session events.
 */
export interface RemoteSessionCallbacks {
  /** Remote player made a move */
  onRemoteMove: (cellIndex: number) => void;
  /** Rematch requested by remote */
  onRematchRequested: () => void;
  /** Rematch response received */
  onRematchResponse: (accepted: boolean) => void;
  /** Connection established */
  onConnected: (remoteName: string) => void;
  /** Connection lost */
  onDisconnected: (reason: string) => void;
  /** Connection error */
  onError: (message: string) => void;
}

/**
 * Creates a new remote game session as host.
 * 
 * @param localName - Local player's display name
 * @param callbacks - Event callbacks
 * @returns Session code to share and controller
 * 
 * @example
 * const { sessionCode, controller, cleanup } = await createRemoteSession(
 *   'Alice',
 *   {
 *     onRemoteMove: (idx) => applyMove(idx),
 *     onConnected: (name) => setOpponentName(name),
 *     // ...other callbacks
 *   }
 * );
 * 
 * // Share sessionCode with peer
 * // When done: cleanup()
 */
export function createRemoteSession(
  localName: string,
  callbacks: RemoteSessionCallbacks
): Promise<{
  sessionCode: string;
  sessionId: string;
  controller: RemoteSessionController;
  cleanup: () => void;
}>;

/**
 * Joins an existing remote game session.
 * 
 * @param sessionCode - Code from host
 * @param localName - Local player's display name
 * @param callbacks - Event callbacks
 * @returns Controller for the session
 * 
 * @example
 * const { answerCode, controller, cleanup } = await joinRemoteSession(
 *   'A3K9PW:eyJ...',
 *   'Bob',
 *   callbacks
 * );
 * 
 * // Share answerCode back to host
 */
export function joinRemoteSession(
  sessionCode: string,
  localName: string,
  callbacks: RemoteSessionCallbacks
): Promise<{
  answerCode: string;
  controller: RemoteSessionController;
  cleanup: () => void;
}>;

/**
 * Completes host connection after receiving answer.
 * 
 * @param answerCode - Answer from guest
 */
export function completeHostConnection(answerCode: string): Promise<void>;

/**
 * Determines if it's the local player's turn in remote mode.
 * 
 * @param gameState - Current game state
 * @returns true if local player should move
 */
export function isLocalPlayerTurn(gameState: GameState): boolean;

/**
 * Gets the local player's symbol in remote mode.
 * 
 * @param gameState - Current game state
 * @returns 'X' or 'O', or null if not in remote mode
 */
export function getLocalPlayerSymbol(gameState: GameState): Player | null;
```

### src/ui/remotePanel.ts

Remote session UI component.

```typescript
/**
 * Remote multiplayer session UI panel.
 * Handles create/join flow and connection status display.
 * 
 * @module ui/remotePanel
 */

/**
 * Callback signatures for panel actions.
 */
export interface RemotePanelHandlers {
  /** User clicked Create Game */
  onCreate: () => void;
  /** User submitted session code to join */
  onJoin: (code: string) => void;
  /** User clicked Copy Code */
  onCopyCode: () => void;
  /** User clicked Leave/Cancel */
  onLeave: () => void;
  /** User submitted answer code (host completing connection) */
  onAnswerSubmit: (code: string) => void;
}

/**
 * Remote panel display state.
 */
export interface RemotePanelState {
  /** Current connection phase */
  phase: 'select' | 'creating' | 'waiting' | 'joining' | 'answer-input' | 'connecting' | 'connected' | 'error';
  /** Session code to display (when waiting) */
  sessionCode?: string;
  /** Session ID (short form) */
  sessionId?: string;
  /** Remote player name (when connected) */
  remoteName?: string;
  /** Error message (when error) */
  error?: string;
  /** Whether code was copied */
  codeCopied?: boolean;
}

/**
 * Renders the remote session panel.
 * Shows different UI based on connection phase.
 * 
 * @param container - DOM element to render into
 * @param state - Current panel state
 * @param handlers - Action callbacks
 * 
 * @example
 * renderRemotePanel(container, { phase: 'select' }, handlers);
 * // Shows: [Create Game] [Join Game]
 * 
 * renderRemotePanel(container, { 
 *   phase: 'waiting', 
 *   sessionCode: 'A3K9PW:eyJ...',
 *   sessionId: 'A3K9PW' 
 * }, handlers);
 * // Shows: "Session: A3K9PW" [Copy Code] [Cancel]
 */
export function renderRemotePanel(
  container: HTMLElement,
  state: RemotePanelState,
  handlers: RemotePanelHandlers
): void;

/**
 * Updates the remote panel with new state.
 * Performs minimal DOM updates.
 * 
 * @param state - New state
 */
export function updateRemotePanel(state: RemotePanelState): void;
```

## Modified Modules

### src/game/types.ts (Extended)

```typescript
// Add to existing file

/** Extended GameMode with remote option */
export type GameMode = 'human' | 'computer' | 'demo' | 'remote';

/** Connection status for remote games */
export type ConnectionStatus =
  | 'idle'
  | 'creating'
  | 'waiting'
  | 'joining'
  | 'connecting'
  | 'connected'
  | 'disconnected';

/** Remote player info */
export interface RemotePlayer {
  name: string;
  symbol: Player;
  isLocal: boolean;
}

/** Remote session state */
export interface RemoteSession {
  sessionId: string;
  sessionCode: string | null;
  connectionStatus: ConnectionStatus;
  localPlayer: RemotePlayer;
  remotePlayer: RemotePlayer | null;
  error: string | null;
  isHost: boolean;
}

// Extend GameState interface
export interface GameState {
  // ... existing fields ...
  remoteSession: RemoteSession | null;
}
```

### src/game/state.ts (Extended)

```typescript
// Add new functions

/**
 * Creates initial state for remote mode.
 * 
 * @param isHost - Whether local player is creating the session
 * @param localName - Local player's display name
 * @returns New game state configured for remote play
 */
export function createRemoteGameState(
  isHost: boolean,
  localName: string
): GameState;

/**
 * Updates remote session in game state.
 * 
 * @param state - Current state
 * @param session - Updated session info
 * @returns New state with updated session
 */
export function updateRemoteSession(
  state: GameState,
  session: Partial<RemoteSession>
): GameState;

/**
 * Sets remote player info after handshake.
 * 
 * @param state - Current state
 * @param remoteName - Remote player's name
 * @returns New state with remote player configured
 */
export function setRemotePlayer(
  state: GameState,
  remoteName: string
): GameState;

/**
 * Clears remote session and returns to normal mode.
 * 
 * @param state - Current state
 * @returns New state without remote session
 */
export function clearRemoteSession(state: GameState): GameState;
```

### src/ui/modeSelector.ts (Extended)

```typescript
// Add 'remote' to mode options

/**
 * Mode options to display.
 * Now includes 'remote' for multiplayer.
 */
export const GAME_MODES: { value: GameMode; label: string }[] = [
  { value: 'human', label: 'Two Players' },
  { value: 'computer', label: 'vs Computer' },
  { value: 'demo', label: 'Demo' },
  { value: 'remote', label: 'Remote' },  // NEW
];
```

### src/ui/status.ts (Extended)

```typescript
// Add remote-specific status messages

/**
 * Gets status message for remote game.
 * 
 * @param state - Current game state
 * @returns Status message string
 */
export function getRemoteStatusMessage(state: GameState): string;

// Messages:
// - "Waiting for opponent..."
// - "Connected! {name} joined"
// - "Your turn"
// - "{name}'s turn"
// - "You win!"
// - "{name} wins!"
// - "It's a draw!"
// - "Opponent disconnected"
```

### src/ui/board.ts (Extended)

```typescript
// Add disabled state for remote games when not player's turn

/**
 * Determines if board should be interactive.
 * 
 * @param state - Current game state
 * @returns true if clicks should be processed
 */
export function isBoardInteractive(state: GameState): boolean;

// Returns false when:
// - gameMode === 'remote' && connectionStatus !== 'connected'
// - gameMode === 'remote' && !isLocalPlayerTurn(state)
// - status !== 'playing'
// - isComputerThinking === true
```

### src/main.ts (Extended)

```typescript
// Add remote mode orchestration

/**
 * Handles transition to remote mode.
 * Shows remote panel instead of starting game.
 */
function handleRemoteModeSelected(): void;

/**
 * Handles creating a new remote session.
 */
async function handleCreateSession(): Promise<void>;

/**
 * Handles joining an existing session.
 */
async function handleJoinSession(code: string): Promise<void>;

/**
 * Handles receiving a move from remote peer.
 */
function handleRemoteMove(cellIndex: number): void;

/**
 * Handles remote peer disconnection.
 */
function handleRemoteDisconnect(reason: string): void;
```

## CSS Additions (src/styles/main.css)

```css
/* Remote panel container */
.remote-panel { }

/* Session code display */
.session-code { }
.session-code__id { }
.session-code__copy-btn { }

/* Connection status indicator */
.connection-status { }
.connection-status--waiting { }
.connection-status--connected { }
.connection-status--error { }

/* Code input field */
.code-input { }
.code-input--error { }

/* Action buttons */
.remote-panel__btn { }
.remote-panel__btn--primary { }
.remote-panel__btn--secondary { }

/* Loading spinner */
.spinner { }

/* Disabled board overlay for remote mode */
.board--remote-waiting { }
```

## Test Files

### tests/unit/remote.test.ts

```typescript
describe('Remote Game Logic', () => {
  describe('createRemoteGameState', () => {
    it('should set localPlayer as X when isHost is true');
    it('should set localPlayer as O when isHost is false');
    it('should initialize with idle connection status');
  });

  describe('isLocalPlayerTurn', () => {
    it('should return true when currentPlayer matches localPlayer.symbol');
    it('should return false when not local turn');
    it('should return false when game is not playing');
  });
});
```

### tests/unit/protocol.test.ts

```typescript
describe('Protocol', () => {
  describe('generateSessionId', () => {
    it('should generate 6-character ID');
    it('should only use unambiguous characters');
    it('should generate unique IDs');
  });

  describe('serializeMessage/deserializeMessage', () => {
    it('should roundtrip handshake message');
    it('should roundtrip move message');
    it('should return null for invalid JSON');
    it('should return null for unknown message type');
  });

  describe('validateMoveMessage', () => {
    it('should accept valid move');
    it('should reject move for wrong player');
    it('should reject move to occupied cell');
    it('should reject move with wrong sequence number');
  });
});
```

### tests/unit/signaling.test.ts

```typescript
describe('Signaling', () => {
  describe('encodeSessionDescription', () => {
    it('should produce decodable string');
    it('should include session ID prefix');
  });

  describe('decodeSessionCode', () => {
    it('should decode valid code');
    it('should return null for invalid format');
    it('should return null for corrupted base64');
  });
});
```

### tests/e2e/remote.spec.ts

```typescript
describe('Remote Multiplayer', () => {
  it('should show remote panel when Remote mode selected');
  it('should generate session code on Create Game');
  it('should copy code to clipboard');
  it('should connect two players successfully');
  it('should sync moves between players');
  it('should show correct turn indicators');
  it('should detect win for both players');
  it('should handle rematch flow');
  it('should handle player disconnect');
});
```
