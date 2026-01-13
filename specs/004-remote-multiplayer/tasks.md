# Tasks: Remote Multiplayer

**Input**: Design documents from `/specs/004-remote-multiplayer/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/modules.md ✓

**Tests**: Unit tests and E2E tests included as this is a complex feature requiring validation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type extensions and new directory structure

- [x] T001 [P] Create src/network/ directory structure
- [x] T002 [P] Add 'remote' to GameMode type and add ConnectionStatus, RemotePlayer, RemoteSession types in src/game/types.ts
- [x] T003 [P] Add GameMessage types (HandshakeMessage, MoveMessage, RematchRequestMessage, RematchResponseMessage, DisconnectMessage) in src/game/types.ts
- [x] T004 [P] Extend GameState interface with remoteSession field in src/game/types.ts

---

## Phase 2: Foundational (Network Layer)

**Purpose**: WebRTC infrastructure that MUST be complete before user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 [P] Implement protocol constants and generateSessionId() in src/network/protocol.ts
- [x] T006 [P] Implement serializeMessage() and deserializeMessage() in src/network/protocol.ts
- [x] T007 [P] Implement validateMoveMessage() in src/network/protocol.ts
- [x] T008 [P] Implement encodeSessionDescription() and decodeSessionCode() in src/network/signaling.ts
- [x] T009 [P] Implement clipboard helpers (copyToClipboard) in src/network/signaling.ts
- [x] T010 [P] Implement URL hash helpers (getSessionFromURL, setSessionInURL, clearSessionFromURL) in src/network/signaling.ts
- [x] T011 Implement createHostConnection() with RTCPeerConnection and DataChannel in src/network/peer.ts
- [x] T012 Implement createGuestConnection() with RTCPeerConnection in src/network/peer.ts
- [x] T013 Implement waitForIceGathering() helper in src/network/peer.ts
- [x] T014 [P] Add unit tests for protocol functions in tests/unit/protocol.test.ts
- [x] T015 [P] Add unit tests for signaling functions in tests/unit/signaling.test.ts

**Checkpoint**: Network layer ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Create and Share Game Session (Priority: P1) 🎯 MVP

**Goal**: Player can select "Remote" mode, create a session, and receive a shareable code

**Independent Test**: Click Remote → Create Game → verify session ID displayed and code copyable

### Implementation for User Story 1

- [x] T016 [P] [US1] Add "Remote" option to GAME_MODES array in src/ui/modeSelector.ts
- [x] T017 [P] [US1] Create renderRemotePanel() with create/join selection UI in src/ui/remotePanel.ts
- [x] T018 [P] [US1] Add remote panel container styles in src/styles/main.css
- [x] T019 [US1] Implement createRemoteGameState() in src/game/state.ts
- [x] T020 [US1] Implement updateRemoteSession() in src/game/state.ts
- [x] T021 [US1] Implement createRemoteSession() (host flow) in src/game/remote.ts
- [x] T022 [US1] Add "waiting" phase UI with session ID display and copy button in src/ui/remotePanel.ts
- [x] T023 [US1] Wire up remote mode selection in handleModeChange() in src/main.ts
- [x] T024 [US1] Wire up handleCreateSession() in src/main.ts
- [x] T025 [US1] Add connection status styles (waiting spinner, session code display) in src/styles/main.css

**Checkpoint**: User Story 1 complete - can create session and copy code

---

## Phase 4: User Story 2 - Join Existing Game Session (Priority: P1)

**Goal**: Player can paste a session code and join an existing game

**Independent Test**: Paste valid code → Join → verify connection status shows "connecting"

### Implementation for User Story 2

- [x] T026 [P] [US2] Add "join" phase UI with code input field in src/ui/remotePanel.ts
- [x] T027 [P] [US2] Add code input styles and validation feedback in src/styles/main.css
- [x] T028 [US2] Implement joinRemoteSession() (guest flow) in src/game/remote.ts
- [x] T029 [US2] Add "answer-input" phase UI for host to receive answer in src/ui/remotePanel.ts
- [x] T030 [US2] Implement completeHostConnection() in src/game/remote.ts
- [x] T031 [US2] Wire up handleJoinSession() in src/main.ts
- [x] T032 [US2] Wire up handleAnswerSubmit() for host in src/main.ts
- [x] T033 [US2] Add error handling UI for invalid/expired codes in src/ui/remotePanel.ts
- [x] T034 [US2] Add validation error styles in src/styles/main.css

**Checkpoint**: User Story 2 complete - two players can connect via code exchange

---

## Phase 5: User Story 3 - Play Game with Remote Opponent (Priority: P1)

**Goal**: Connected players can play a complete game with real-time move sync

**Independent Test**: Two browser contexts connected → make moves → verify both see updates

### Implementation for User Story 3

- [x] T035 [P] [US3] Implement setRemotePlayer() in src/game/state.ts
- [x] T036 [P] [US3] Implement isLocalPlayerTurn() in src/game/remote.ts
- [x] T037 [P] [US3] Implement getLocalPlayerSymbol() in src/game/remote.ts
- [x] T038 [US3] Add handshake exchange on connection (send/receive playerName) in src/game/remote.ts
- [x] T039 [US3] Implement sendMove() in RemoteSessionController in src/game/remote.ts
- [x] T040 [US3] Add move validation for received messages in src/game/remote.ts
- [x] T041 [US3] Update isBoardInteractive() to check isLocalPlayerTurn for remote mode in src/ui/board.ts
- [x] T042 [US3] Add remote-specific status messages (Your turn, Opponent's turn) in src/ui/status.ts
- [x] T043 [US3] Wire up handleRemoteMove() callback in src/main.ts
- [x] T044 [US3] Wire up handleCellClick to send moves via controller in src/main.ts
- [x] T045 [US3] Add "connected" phase UI with opponent name display in src/ui/remotePanel.ts
- [x] T046 [US3] Add connected status styles and turn indicators in src/styles/main.css
- [x] T047 [US3] Add unit tests for remote game logic in tests/unit/remote.test.ts
- [x] T048 [US3] Add E2E test for two-player connection and gameplay in tests/e2e/remote.spec.ts

**Checkpoint**: User Story 3 complete - full remote gameplay working

---

## Phase 6: User Story 4 - Rematch in Remote Game (Priority: P2)

**Goal**: After game ends, players can request/accept rematch without reconnecting

**Independent Test**: Complete game → click Rematch → verify both reset with swapped symbols

### Implementation for User Story 4

- [x] T049 [P] [US4] Add rematch button to game-over UI for remote mode in src/ui/controls.ts
- [x] T050 [P] [US4] Add rematch request/response UI overlay in src/ui/remotePanel.ts
- [x] T051 [US4] Implement requestRematch() in RemoteSessionController in src/game/remote.ts
- [x] T052 [US4] Implement respondToRematch() in RemoteSessionController in src/game/remote.ts
- [x] T053 [US4] Handle rematch-request and rematch-response messages in src/game/remote.ts
- [x] T054 [US4] Implement resetRemoteGame() to swap symbols in src/game/state.ts
- [x] T055 [US4] Wire up handleRematchRequested() callback in src/main.ts
- [x] T056 [US4] Wire up handleRematchResponse() callback in src/main.ts
- [x] T057 [US4] Add rematch UI styles in src/styles/main.css

**Checkpoint**: User Story 4 complete - rematch flow working

---

## Phase 7: User Story 5 - Handle Disconnection (Priority: P2)

**Goal**: Players are notified when opponent disconnects and can leave/wait

**Independent Test**: Close one browser → verify other shows "Opponent disconnected"

### Implementation for User Story 5

- [ ] T058 [P] [US5] Add disconnected status UI in src/ui/remotePanel.ts
- [ ] T059 [P] [US5] Add disconnection notification styles in src/styles/main.css
- [ ] T060 [US5] Handle DataChannel close event in src/network/peer.ts
- [ ] T061 [US5] Implement leave() in RemoteSessionController in src/game/remote.ts
- [ ] T062 [US5] Send disconnect message before closing in src/game/remote.ts
- [ ] T063 [US5] Wire up handleRemoteDisconnect() callback in src/main.ts
- [ ] T064 [US5] Implement clearRemoteSession() in src/game/state.ts
- [ ] T065 [US5] Add "Leave Game" button to remote panel in src/ui/remotePanel.ts
- [ ] T066 [US5] Wire up handleLeaveSession() in src/main.ts

**Checkpoint**: User Story 5 complete - graceful disconnect handling

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [ ] T067 [P] Add keyboard accessibility to remote panel buttons in src/ui/remotePanel.ts
- [ ] T068 [P] Add responsive styles for mobile devices in src/styles/main.css
- [ ] T069 [P] Add loading spinners during ICE gathering in src/ui/remotePanel.ts
- [ ] T070 Run full E2E test suite with CI=true
- [ ] T071 Run quickstart.md validation (manual test of documented flow)
- [ ] T072 Update README.md with remote multiplayer instructions

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational) ◄── BLOCKS ALL USER STORIES
    │
    ├───────────┬───────────┬───────────┬───────────┐
    ▼           ▼           ▼           ▼           ▼
Phase 3     Phase 4     Phase 5     Phase 6     Phase 7
(US1:P1)    (US2:P1)    (US3:P1)    (US4:P2)    (US5:P2)
    │           │           │           │           │
    └───────────┴───────────┴───────────┴───────────┘
                            │
                            ▼
                      Phase 8 (Polish)
```

### User Story Dependencies

- **US1 (Create Session)**: Depends on Phase 2 only - CAN start after Foundational
- **US2 (Join Session)**: Depends on Phase 2 only - CAN start after Foundational (parallel with US1)
- **US3 (Play Game)**: Depends on US1 AND US2 being complete (connection must work first)
- **US4 (Rematch)**: Depends on US3 (game must be playable first)
- **US5 (Disconnect)**: Depends on US3 (connected gameplay must work first)

### Critical Path (Minimum for MVP)

```
T001-T004 (Setup) → T005-T015 (Network) → T016-T025 (US1) → T026-T034 (US2) → T035-T048 (US3)
```

This path delivers working remote gameplay. US4 and US5 are enhancements.

### Parallel Opportunities

**Within Phase 2 (Foundational)**:
```
Parallel Group A: T005, T006, T007 (protocol.ts)
Parallel Group B: T008, T009, T010 (signaling.ts)
Sequential: T011 → T012 → T013 (peer.ts - shared patterns)
Parallel Tests: T014, T015 (test files)
```

**Within Phase 3 (US1)**:
```
Parallel: T016, T017, T018 (different files)
Sequential: T019 → T020 → T021 → T022 → T023 → T024 → T025
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T015)
3. Complete Phase 3: US1 - Create Session (T016-T025)
4. Complete Phase 4: US2 - Join Session (T026-T034)
5. Complete Phase 5: US3 - Play Game (T035-T048)
6. **STOP and VALIDATE**: Test full remote gameplay flow
7. Deploy/demo MVP

### Full Feature

8. Complete Phase 6: US4 - Rematch (T049-T057)
9. Complete Phase 7: US5 - Disconnection (T058-T066)
10. Complete Phase 8: Polish (T067-T072)

---

## Task Summary

| Phase | Tasks | Parallel | Description |
|-------|-------|----------|-------------|
| 1. Setup | T001-T004 | 4 | Type extensions, directory structure |
| 2. Foundational | T005-T015 | 8 | Network layer (WebRTC, protocol, signaling) |
| 3. US1 Create | T016-T025 | 3 | Create session, get shareable code |
| 4. US2 Join | T026-T034 | 2 | Join session, code exchange |
| 5. US3 Play | T035-T048 | 3 | Real-time gameplay, move sync |
| 6. US4 Rematch | T049-T057 | 2 | Request/accept rematch |
| 7. US5 Disconnect | T058-T066 | 2 | Handle disconnection gracefully |
| 8. Polish | T067-T072 | 4 | Accessibility, responsive, docs |

**Total**: 72 tasks  
**MVP (US1-US3)**: 48 tasks  
**Parallel opportunities**: 28 tasks can run in parallel  

---

## Notes

- All network code in `src/network/` keeps WebRTC separate from game logic
- Remote game state follows existing immutable patterns
- Unit tests for protocol/signaling are critical - complex encoding/decoding
- E2E tests use Playwright's two-context support for simulating two players
- Session codes are long (~2KB) - UI should truncate display but copy full code
- Run with `CI=true` for E2E tests to avoid interactive prompts on failure
