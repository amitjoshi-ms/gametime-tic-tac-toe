# Quickstart: Remote Multiplayer Feature

**Feature**: 004-remote-multiplayer  
**Date**: January 12, 2026  
**Purpose**: Get developers up to speed on implementing this feature

## Overview

This feature adds peer-to-peer multiplayer mode where two players on different devices can play Tic-Tac-Toe together. Uses WebRTC DataChannels for communication - no backend server required.

## Prerequisites

- Node.js 18+ installed
- Repository cloned and on `004-remote-multiplayer` branch
- Dependencies installed (`npm install`)
- Modern browser with WebRTC support (Chrome, Firefox, Safari, Edge)

## Quick Setup

```bash
# Verify you're on the right branch
git branch --show-current  # Should show: 004-remote-multiplayer

# Install dependencies (if not done)
npm install

# Start dev server
npm run dev
```

## Key Concepts

### P2P Architecture (No Server)

```
┌─────────────┐                    ┌─────────────┐
│   Player A  │◄── WebRTC P2P ───►│   Player B  │
│   (Host)    │    DataChannel     │   (Guest)   │
└─────────────┘                    └─────────────┘
       │                                  │
       │    1. Create offer               │
       │    2. Copy & share ─────────────►│
       │                           3. Paste offer
       │                           4. Create answer
       │◄───────────── Share answer ──────│
       │    5. Connect                    │
       └──────────── Connected! ──────────┘
```

### Connection Flow

1. **Host** clicks "Create Game" → generates WebRTC offer
2. **Host** copies session code (contains encoded SDP)
3. **Host** shares code via any messaging app
4. **Guest** pastes code and clicks "Join"
5. **Guest** generates answer code
6. **Guest** shares answer back to host
7. **Host** pastes answer → connection established

### Why This Approach?

- **Zero dependencies**: WebRTC is native browser API
- **No server costs**: P2P = direct browser-to-browser
- **Works everywhere**: STUN servers handle NAT traversal
- **Simple sharing**: Copy-paste works with any messaging platform

## Key Files to Modify/Create

| Priority | File | Changes |
|----------|------|---------|
| 1 | `src/game/types.ts` | Add 'remote' to GameMode, new types |
| 2 | `src/network/protocol.ts` | **NEW** - Message types & serialization |
| 3 | `src/network/signaling.ts` | **NEW** - SDP encoding/decoding |
| 4 | `src/network/peer.ts` | **NEW** - RTCPeerConnection wrapper |
| 5 | `src/game/remote.ts` | **NEW** - Remote session logic |
| 6 | `src/game/state.ts` | Add remote state functions |
| 7 | `src/ui/remotePanel.ts` | **NEW** - Create/Join UI |
| 8 | `src/ui/modeSelector.ts` | Add "Remote" option |
| 9 | `src/ui/status.ts` | Add remote status messages |
| 10 | `src/ui/board.ts` | Disable when not local turn |
| 11 | `src/main.ts` | Wire up remote mode orchestration |
| 12 | `src/styles/main.css` | Add remote panel styles |

## Implementation Order

### Phase 1: Types & Protocol (Foundation)

1. **Extend types** in `types.ts`:
   ```typescript
   export type GameMode = 'human' | 'computer' | 'demo' | 'remote';
   export type ConnectionStatus = 'idle' | 'creating' | 'waiting' | ...;
   export interface RemoteSession { ... }
   ```

2. **Create protocol.ts**:
   - Message type definitions
   - `generateSessionId()` - 6-char unambiguous ID
   - `serializeMessage()` / `deserializeMessage()`
   - `validateMoveMessage()`

### Phase 2: Network Layer (WebRTC)

3. **Create signaling.ts**:
   - `encodeSessionDescription()` - SDP to shareable string
   - `decodeSessionCode()` - string back to SDP
   - `copyToClipboard()` - async clipboard API

4. **Create peer.ts**:
   - `createHostConnection()` - RTCPeerConnection as offerer
   - `createGuestConnection()` - RTCPeerConnection as answerer
   - `waitForIceGathering()` - wait for candidates

### Phase 3: Game Logic Integration

5. **Create remote.ts**:
   - `createRemoteSession()` - host flow
   - `joinRemoteSession()` - guest flow
   - `isLocalPlayerTurn()` - turn detection

6. **Extend state.ts**:
   - `createRemoteGameState()`
   - `updateRemoteSession()`
   - `setRemotePlayer()`
   - `clearRemoteSession()`

### Phase 4: UI Components

7. **Create remotePanel.ts**:
   - Create/Join selection
   - Session code display with copy button
   - Code input for joining
   - Connection status indicators

8. **Update modeSelector.ts**:
   - Add "Remote" option to mode list

9. **Update status.ts** and **board.ts**:
   - Remote-specific messages
   - Disable board when not turn

### Phase 5: Integration

10. **Update main.ts**:
    - Handle remote mode selection
    - Orchestrate create/join flows
    - Process remote moves
    - Handle disconnection

11. **Add CSS** in `main.css`:
    - Remote panel layout
    - Session code styling
    - Connection indicators

## Testing Strategy

### Unit Tests First

```bash
npm test -- --watch tests/unit/protocol.test.ts
npm test -- --watch tests/unit/signaling.test.ts
npm test -- --watch tests/unit/remote.test.ts
```

Test these scenarios:
- Session ID generation (6 chars, unambiguous)
- Message serialization roundtrip
- Move validation
- SDP encoding/decoding

### E2E Tests (Two Browser Contexts)

```bash
npm run test:e2e -- remote.spec.ts
```

Playwright can create two browser contexts to simulate two players:

```typescript
test('two players can connect and play', async ({ browser }) => {
  const hostContext = await browser.newContext();
  const guestContext = await browser.newContext();
  
  const hostPage = await hostContext.newPage();
  const guestPage = await guestContext.newPage();
  
  // Host creates session
  await hostPage.goto('/');
  await hostPage.click('[data-mode="remote"]');
  await hostPage.click('button:has-text("Create Game")');
  
  // Copy session code
  const code = await hostPage.textContent('.session-code');
  
  // Guest joins
  await guestPage.goto('/');
  await guestPage.click('[data-mode="remote"]');
  await guestPage.fill('input[name="session-code"]', code);
  await guestPage.click('button:has-text("Join")');
  
  // ... continue test
});
```

## Common Patterns

### Creating WebRTC Connection (Host)

```typescript
const pc = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
});

const dc = pc.createDataChannel('game', { ordered: true });
dc.onopen = () => console.log('Connected!');
dc.onmessage = (e) => handleMessage(JSON.parse(e.data));

const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

// Wait for ICE gathering
await new Promise(resolve => {
  if (pc.iceGatheringState === 'complete') resolve();
  pc.onicegatheringstatechange = () => {
    if (pc.iceGatheringState === 'complete') resolve();
  };
});

const encoded = btoa(JSON.stringify(pc.localDescription));
// Share `encoded` with guest
```

### Joining Connection (Guest)

```typescript
const pc = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
});

pc.ondatachannel = (e) => {
  const dc = e.channel;
  dc.onopen = () => console.log('Connected!');
  dc.onmessage = (e) => handleMessage(JSON.parse(e.data));
};

const offer = JSON.parse(atob(encodedOffer));
await pc.setRemoteDescription(offer);

const answer = await pc.createAnswer();
await pc.setLocalDescription(answer);

// Wait for ICE gathering, encode answer, share back
```

### Turn Validation

```typescript
function isLocalPlayerTurn(state: GameState): boolean {
  if (!state.remoteSession || state.status !== 'playing') {
    return false;
  }
  return state.currentPlayer === state.remoteSession.localPlayer.symbol;
}
```

## Debugging Tips

1. **Chrome WebRTC Internals**: `chrome://webrtc-internals/` shows connection details
2. **ICE Gathering**: Watch for `iceGatheringState` changes
3. **DataChannel State**: Check `dc.readyState` ('connecting', 'open', 'closed')
4. **Console Logging**: Add detailed logs during development

## Key Constraints

- ✅ Zero new npm dependencies (WebRTC is native)
- ✅ Works offline once connected (P2P)
- ✅ Bundle size < 100KB
- ✅ Connection time < 5 seconds typical
- ✅ Move latency < 200ms

## Related Documentation

- [spec.md](spec.md) - Feature requirements
- [research.md](research.md) - Technical decisions
- [data-model.md](data-model.md) - Type definitions
- [contracts/modules.md](contracts/modules.md) - Module interfaces
