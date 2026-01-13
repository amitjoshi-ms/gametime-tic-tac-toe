# Data Model: Remote Multiplayer

**Feature**: 004-remote-multiplayer  
**Date**: January 12, 2026  
**Purpose**: Define entities, types, and state structures

## Type Extensions

### GameMode (Extended)

Add 'remote' to existing GameMode union.

```typescript
/**
 * Game mode determines opponent behavior.
 * - 'human': Two human players on same device
 * - 'computer': Human (X) vs AI opponent (O)
 * - 'demo': AI vs AI (both players computer-controlled)
 * - 'remote': Two human players on different devices via P2P
 */
export type GameMode = 'human' | 'computer' | 'demo' | 'remote';
```

**Validation Rules**:
- Must be one of the four literal values
- Persisted to localStorage for session continuity
- Default: 'human' (backward compatible)

### ConnectionStatus (New)

Represents WebRTC connection lifecycle.

```typescript
/**
 * Connection state for remote multiplayer.
 */
export type ConnectionStatus =
  | 'idle'           // Not in remote mode
  | 'creating'       // Generating session offer
  | 'waiting'        // Offer ready, waiting for peer
  | 'joining'        // Processing peer's offer
  | 'connecting'     // ICE negotiation in progress
  | 'connected'      // DataChannel open, ready to play
  | 'disconnected';  // Peer lost
```

### RemotePlayer (New)

Represents a player in a remote session.

```typescript
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
```

### RemoteSession (New)

Represents an active remote game session.

```typescript
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
}
```

**Invariants**:
- `sessionId` is always 6 uppercase alphanumeric characters
- `isHost === true` implies `localPlayer.symbol === 'X'`
- `remotePlayer !== null` when `connectionStatus === 'connected'`
- `error !== null` implies `connectionStatus === 'disconnected'`

### GameState (Extended)

Extend existing GameState with optional remote session.

```typescript
interface GameState {
  // Existing fields (unchanged)
  board: CellValue[];
  currentPlayer: Player;
  status: GameStatus;
  playerNames: PlayerNames;
  gameMode: GameMode;
  isComputerThinking: boolean;
  
  // New field for remote multiplayer
  remoteSession: RemoteSession | null;
}
```

**State Invariants**:
- `remoteSession !== null` only when `gameMode === 'remote'`
- When `gameMode === 'remote'` and `connectionStatus !== 'connected'`, no moves are allowed
- `isComputerThinking` is always `false` when `gameMode === 'remote'`

## Message Types

### GameMessage (New)

Messages exchanged over DataChannel.

```typescript
/**
 * Base message type for DataChannel communication.
 */
export type GameMessage =
  | HandshakeMessage
  | MoveMessage
  | RematchRequestMessage
  | RematchResponseMessage
  | DisconnectMessage;

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
```

**Protocol Version**: Start at `1`. Increment on breaking changes.

## State Transitions

### Remote Session Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Remote Session State Machine                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [Select Remote Mode]                                                   │
│         │                                                               │
│         ▼                                                               │
│    ┌─────────┐                                                          │
│    │  idle   │ ◄──────────────────────────────────────────────┐        │
│    └────┬────┘                                                 │        │
│         │                                                      │        │
│    ┌────┴────┬─────────────────┐                              │        │
│    ▼         ▼                 │                              │        │
│ [Create] [Join]                │                              │        │
│    │         │                 │                              │        │
│    ▼         ▼                 │                              │        │
│ creating  joining              │                              │        │
│    │         │                 │                              │        │
│    ▼         │                 │                              │        │
│ waiting      │                 │                              │        │
│    │         │                 │                              │        │
│    └────┬────┘                 │                              │        │
│         ▼                      │                              │        │
│    connecting                  │                              │        │
│         │                      │                              │        │
│    ┌────┴────┐                 │                              │        │
│    ▼         ▼                 │                              │        │
│ connected  disconnected ───────┘                              │        │
│    │         │                                                │        │
│    │         └── [Error/Timeout] ─────────────────────────────┘        │
│    │                                                                    │
│    ▼                                                                    │
│ [Handshake Complete]                                                   │
│    │                                                                    │
│    ▼                                                                    │
│ [Ready to Play]                                                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Game Flow in Remote Mode

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Remote Game Flow                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [Connection Established]                                               │
│         │                                                               │
│         ▼                                                               │
│  Handshake Exchange ────► playerNames updated                           │
│         │                                                               │
│         ▼                                                               │
│  ┌──────────────┐                                                       │
│  │ Game Playing │                                                       │
│  └──────┬───────┘                                                       │
│         │                                                               │
│    ┌────┴────────────────────────┐                                      │
│    │                             │                                      │
│    ▼                             ▼                                      │
│ [My Turn]                   [Their Turn]                                │
│    │                             │                                      │
│    ▼                             ▼                                      │
│ Board enabled              Board disabled                               │
│    │                             │                                      │
│    ▼                             ▼                                      │
│ Click cell                 Wait for message                             │
│    │                             │                                      │
│    ▼                             ▼                                      │
│ Send MoveMessage           Receive MoveMessage                          │
│    │                             │                                      │
│    ▼                             ▼                                      │
│ Apply locally              Validate & apply                             │
│    │                             │                                      │
│    └─────────┬───────────────────┘                                      │
│              ▼                                                          │
│       Check win/draw                                                    │
│              │                                                          │
│    ┌─────────┴─────────┐                                                │
│    ▼                   ▼                                                │
│ Continue            Game Over                                           │
│    │                   │                                                │
│    ▼                   ▼                                                │
│ Switch turn        Show result                                          │
│    │                   │                                                │
│    └───► Loop          │                                                │
│                        ▼                                                │
│                   [Rematch?]                                            │
│                        │                                                │
│              ┌─────────┴─────────┐                                      │
│              ▼                   ▼                                      │
│         [Yes: New Game]    [No: Leave]                                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Entity Relationships

```
┌──────────────┐          ┌───────────────┐
│  GameState   │ ──────── │ RemoteSession │
└──────────────┘    1:0-1 └───────────────┘
       │                         │
       │                    ┌────┴────┐
       │                    │         │
       ▼                    ▼         ▼
┌──────────────┐    ┌─────────────┐ ┌─────────────┐
│ PlayerNames  │    │ localPlayer │ │remotePlayer │
└──────────────┘    │(RemotePlayer│ │(RemotePlayer│
                    └─────────────┘ └─────────────┘
```

## Storage Schema

### localStorage Keys (Extended)

```typescript
// Existing
'ttt-player-names'   // { X: string, O: string }
'ttt-game-mode'      // GameMode

// No new keys needed - remote sessions are ephemeral
```

### URL Hash Schema (New)

```typescript
// Session code in URL for easy sharing
// Format: #join=<base64-encoded-sdp>
// Example: #join=eyJ0eXBlIjoib2ZmZXIi...

interface URLSessionParams {
  join?: string;  // Encoded offer from host
}
```

## Default Values

```typescript
const DEFAULT_REMOTE_SESSION: RemoteSession = {
  sessionId: '',
  sessionCode: null,
  connectionStatus: 'idle',
  localPlayer: { name: 'Player', symbol: 'X', isLocal: true },
  remotePlayer: null,
  error: null,
  isHost: false,
};
```

## Validation Rules Summary

| Field | Constraint |
|-------|------------|
| `sessionId` | 6 chars, `[2-9A-HJ-NP-Z]` only |
| `cellIndex` (in MoveMessage) | 0-8, must be empty cell |
| `moveNumber` | Sequential, starts at 1 |
| `protocolVersion` | Must match current version |
| `playerName` | 1-20 chars, trimmed, non-empty |
