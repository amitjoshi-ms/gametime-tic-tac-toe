# Research: Remote Multiplayer

**Feature**: 004-remote-multiplayer  
**Date**: January 12, 2026  
**Purpose**: Resolve technical decisions before implementation

## Research Areas

### 1. Peer-to-Peer Communication (WebRTC vs Alternatives)

**Decision**: Use WebRTC DataChannels with public STUN servers

**Rationale**:
- Native browser API - zero dependencies
- Provides reliable, ordered message delivery (SCTP protocol)
- Works across NATs with STUN/TURN traversal
- No backend server required for data exchange
- Supported in all modern browsers (Chrome, Firefox, Safari, Edge)

**Alternatives Considered**:
- WebSocket server: Rejected - requires backend infrastructure, violates "no server" constraint
- PeerJS library: Rejected - adds ~30KB dependency, violates minimal dependency principle
- Firebase Realtime Database: Rejected - external service dependency
- BroadcastChannel API: Rejected - same-origin only, can't work across devices

**Implementation Pattern**:
```typescript
// Use free public STUN servers for NAT traversal
const config: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const peerConnection = new RTCPeerConnection(config);
const dataChannel = peerConnection.createDataChannel('game', {
  ordered: true,  // Ensure move order
});
```

### 2. Signaling Without Server

**Decision**: Copy-paste signaling via SDP exchange in URL hash / clipboard

**Rationale**:
- Zero server infrastructure needed
- User copies offer (as encoded string) and shares via any messaging app
- Joining player pastes offer, generates answer
- Both players exchange connection info manually
- Works universally - no firewall/NAT issues for signaling phase

**Alternatives Considered**:
- Signaling server: Rejected - requires backend
- QR codes: Rejected - adds complexity, not all devices have cameras
- Email/SMS: Rejected - adds external dependencies
- Browser extensions for relay: Rejected - not universally available

**Implementation Pattern**:
```typescript
// Session creator generates offer and encodes it
async function createSession(): Promise<string> {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  // Wait for ICE gathering complete
  await waitForIceGathering(peerConnection);
  return encodeSession(peerConnection.localDescription);
}

// Joining player decodes offer and generates answer
async function joinSession(offerCode: string): Promise<string> {
  const offer = decodeSession(offerCode);
  await peerConnection.setRemoteDescription(offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  await waitForIceGathering(peerConnection);
  return encodeSession(peerConnection.localDescription);
}

// Encode SDP + ICE candidates to compact string
function encodeSession(sdp: RTCSessionDescription): string {
  // Base64 + compression for shorter code
  return btoa(JSON.stringify(sdp));
}
```

### 3. Session Code Format

**Decision**: Base64-encoded SDP with simple 6-character identifier prefix

**Rationale**:
- SDP contains all connection info (no server lookup needed)
- 6-char prefix identifies session for UI display
- Full encoded string (~2-4KB) copied to clipboard
- Can be shared via any messaging platform that supports long text

**Alternatives Considered**:
- Short UUID with server lookup: Rejected - requires server
- QR code only: Rejected - text sharing more universal
- Shortened URL service: Rejected - external dependency

**Implementation Pattern**:
```typescript
interface SessionCode {
  id: string;       // 6-char human-readable identifier
  payload: string;  // Full base64-encoded SDP
}

function generateSessionId(): string {
  // Use only unambiguous characters: 2-9, A-H, J-N, P-Z (no 0,O,1,I,L)
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  return Array.from({ length: 6 }, () => 
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}
```

### 4. Game State Synchronization

**Decision**: Event-based sync with authoritative turn validation

**Rationale**:
- Each player sends only their moves, not full state
- Receiving player validates move before applying (prevents cheating)
- Both players compute game status independently
- Deterministic: same moves = same final state

**Alternatives Considered**:
- Full state sync on every change: Rejected - unnecessary bandwidth
- Server authoritative state: Rejected - no server
- Optimistic updates without validation: Rejected - allows cheating

**Implementation Pattern**:
```typescript
interface GameMessage {
  type: 'move' | 'rematch-request' | 'rematch-accept' | 'rematch-decline';
  payload: MovePayload | null;
}

interface MovePayload {
  cellIndex: number;
  player: Player;
  moveNumber: number;  // For ordering validation
}

// Validate received move
function validateRemoteMove(
  board: CellValue[],
  move: MovePayload,
  expectedPlayer: Player
): boolean {
  return (
    move.player === expectedPlayer &&
    move.cellIndex >= 0 &&
    move.cellIndex <= 8 &&
    board[move.cellIndex] === null
  );
}
```

### 5. Player Identity (Simple Authentication)

**Decision**: Display names exchanged during connection handshake

**Rationale**:
- No account system needed - anonymous play
- Names displayed in UI for personalization
- Exchanged in initial connection message
- Stored in localStorage for persistence

**Alternatives Considered**:
- OAuth/SSO: Rejected - overkill for simple game, adds dependencies
- Server-issued tokens: Rejected - no server
- Browser fingerprinting: Rejected - privacy concerns, unreliable

**Implementation Pattern**:
```typescript
interface PlayerInfo {
  name: string;
  symbol: Player;  // Assigned during connection
}

interface HandshakeMessage {
  type: 'handshake';
  playerName: string;
  version: string;  // Protocol version for compatibility
}
```

### 6. Connection State Management

**Decision**: State machine with explicit transitions and UI feedback

**Rationale**:
- Clear states: idle → creating → waiting → connected → playing
- Each state has specific UI and allowed actions
- Handles disconnection gracefully
- Reconnection within session possible

**Alternatives Considered**:
- Boolean flags: Rejected - unclear state combinations
- Event emitter: Rejected - harder to reason about
- Redux-style store: Rejected - overkill, adds complexity

**Implementation Pattern**:
```typescript
type ConnectionState = 
  | { status: 'idle' }
  | { status: 'creating'; sessionId: string }
  | { status: 'waiting'; sessionCode: string }
  | { status: 'joining' }
  | { status: 'connected'; remoteName: string; mySymbol: Player }
  | { status: 'disconnected'; reason: string };
```

### 7. UI Responsiveness During Connection

**Decision**: Non-blocking async operations with loading indicators

**Rationale**:
- ICE gathering can take 1-5 seconds
- UI remains responsive during connection
- Clear progress indicators for each phase
- Cancel/abort supported at any point

**Alternatives Considered**:
- Blocking with spinner: Rejected - poor UX
- Web Workers: Rejected - overkill for simple async

**Implementation Pattern**:
```typescript
// Show connection progress
const CONNECTION_PHASES = [
  'Initializing...',
  'Gathering network info...',
  'Waiting for peer...',
  'Connecting...',
  'Connected!',
];
```

### 8. Error Handling and Recovery

**Decision**: Graceful degradation with clear user feedback

**Rationale**:
- WebRTC can fail for many reasons (NAT issues, browser restrictions)
- User should understand what went wrong
- Offer retry options where applicable
- Log errors for debugging (dev mode only)

**Error Categories**:
- **Connection failed**: STUN/TURN failure, firewall blocking
- **Peer disconnected**: Browser closed, network lost
- **Invalid session code**: Corrupted or expired
- **Protocol mismatch**: Version incompatibility

**Implementation Pattern**:
```typescript
type ConnectionError =
  | { type: 'network'; message: string }
  | { type: 'peer-disconnected'; wasInGame: boolean }
  | { type: 'invalid-code' }
  | { type: 'timeout' }
  | { type: 'ice-failed' };

function getErrorMessage(error: ConnectionError): string {
  switch (error.type) {
    case 'network':
      return 'Network error. Please check your connection.';
    case 'peer-disconnected':
      return error.wasInGame 
        ? 'Your opponent has disconnected.' 
        : 'Connection lost.';
    case 'invalid-code':
      return 'Invalid session code. Please check and try again.';
    case 'timeout':
      return 'Connection timed out. Please try again.';
    case 'ice-failed':
      return 'Could not establish connection. Try a different network.';
  }
}
```

## Browser Compatibility Notes

| Browser | WebRTC DataChannel | Notes |
|---------|-------------------|-------|
| Chrome 80+ | ✅ Full support | Primary development target |
| Firefox 78+ | ✅ Full support | Good compatibility |
| Safari 14.1+ | ✅ Full support | Requires user gesture for some APIs |
| Edge 80+ | ✅ Full support | Chromium-based |

## Performance Considerations

- **Bundle size impact**: ~400-600 lines of TypeScript, < 15KB minified
- **Connection time**: 1-5 seconds typical (ICE gathering)
- **Message latency**: < 50ms for local network, < 200ms typical internet
- **Memory**: Minimal - single RTCPeerConnection object

## Security Considerations

- **No server = No central attack surface**: P2P connections are direct
- **SDP exposure**: Contains IP addresses, but only shared intentionally
- **Message validation**: All received moves validated before applying
- **No authentication bypass**: Display names are cosmetic only
