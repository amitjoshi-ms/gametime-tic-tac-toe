# Implementation Plan: Remote Multiplayer

**Branch**: `004-remote-multiplayer` | **Date**: January 12, 2026 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-remote-multiplayer/spec.md`

## Summary

Add remote multiplayer mode enabling two players on different devices to play Tic-Tac-Toe together. Uses WebRTC DataChannels for peer-to-peer communication with a free public TURN/STUN server for NAT traversal. Session discovery via URL hash codes - no backend server required. Player authentication via simple display names exchanged during connection. Optimized for minimal bundle size using native WebRTC APIs only.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled)
**Primary Dependencies**: None new (WebRTC is native browser API)
**Storage**: localStorage (existing - for player names), URL hash (session codes)
**Testing**: Vitest (unit), Playwright (E2E with two browser contexts)
**Target Platform**: Browser SPA (Chrome, Firefox, Safari, Edge - last 2 versions)
**Project Type**: Single web application
**Performance Goals**: < 1s connection establishment, < 100ms move propagation, < 100KB bundle
**Constraints**: Zero runtime dependencies, peer-to-peer only (no server), responsive UX
**Scale/Scope**: 2 players per session, single active game per session

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Browser-Native SPA | ✅ PASS | WebRTC is native browser API; no server-side dependencies |
| II. Minimal Dependencies | ✅ PASS | Zero new npm dependencies; uses native WebRTC, RTCPeerConnection |
| III. Clean & Simple UX | ✅ PASS | Simple create/join flow; shareable URL; clear connection status |
| IV. Documentation-First | ✅ PASS | Full spec, plan, and contracts before implementation |
| V. Modern Standards | ✅ PASS | TypeScript strict mode; WebRTC is W3C standard; tested with Vitest/Playwright |
| Bundle < 100KB | ✅ PASS | Estimated ~400-600 lines addition; no external libraries |

**Pre-Phase 0 Gate**: ✅ PASS - No violations

**Post-Phase 1 Re-check**: ✅ PASS - Design artifacts confirm:
- No new npm dependencies introduced (WebRTC is native)
- All state management uses existing immutable patterns
- Manual signaling (copy/paste) avoids server dependency
- New `src/network/` directory keeps P2P code organized
- Message validation ensures game integrity
- UI follows existing component patterns

## Project Structure

### Documentation (this feature)

```text
specs/004-remote-multiplayer/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── modules.md       # Module interfaces
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── main.ts              # App entry - add remote mode handlers, connection orchestration
├── game/
│   ├── types.ts         # Extend GameMode with 'remote', add RemoteGameState
│   ├── state.ts         # Add remote state transitions
│   ├── logic.ts         # (unchanged - reuse existing win/draw detection)
│   ├── playerNames.ts   # (unchanged - reuse for local player name)
│   ├── computer.ts      # (unchanged)
│   └── remote.ts        # NEW: Remote game session logic (signaling, state sync)
├── ui/
│   ├── board.ts         # Disable when not my turn in remote mode
│   ├── status.ts        # Add connection status messages
│   ├── controls.ts      # Add "Leave Game" for remote sessions
│   ├── playerNames.ts   # (unchanged)
│   ├── modeSelector.ts  # Add "Remote" option
│   └── remotePanel.ts   # NEW: Create/Join session UI, session code display
├── network/             # NEW: Network layer (P2P communication)
│   ├── signaling.ts     # NEW: WebRTC signaling via URL hash + clipboard
│   ├── peer.ts          # NEW: RTCPeerConnection wrapper
│   └── protocol.ts      # NEW: Message types and serialization
└── styles/
    └── main.css         # Add remote panel styles, connection indicators

tests/
├── unit/
│   ├── remote.test.ts   # NEW: Remote game logic tests
│   ├── signaling.test.ts # NEW: Signaling protocol tests
│   └── protocol.test.ts # NEW: Message serialization tests
└── e2e/
    └── remote.spec.ts   # NEW: E2E tests for remote multiplayer
```

**Structure Decision**: Single project structure (existing). New directory `src/network/` for WebRTC-specific code, keeping it separate from game logic. New files: `remote.ts` (game layer), `remotePanel.ts` (UI), and `network/*.ts` (P2P infrastructure).

## Complexity Tracking

> No violations - table not needed.
