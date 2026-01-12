# Tasks: Computer Opponent

**Input**: Design documents from `/specs/002-computer-opponent/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Not explicitly requested - test tasks omitted per template guidelines.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Type Extensions)

**Purpose**: Extend existing types and state management to support game modes

- [x] T001 Add GameMode type and extend GameState interface in src/game/types.ts
- [x] T002 [P] Add DEFAULT_COMPUTER_NAME constant in src/game/playerNames.ts
- [x] T003 Add gameMode and isComputerThinking fields to createInitialState in src/game/state.ts
- [x] T004 Add game mode localStorage helpers (loadGameMode, saveGameMode) in src/utils/storage.ts

---

## Phase 2: Foundational (Core Computer Logic)

**Purpose**: Implement computer move selection - MUST be complete before UI work

**⚠️ CRITICAL**: User story UI work cannot begin until this phase is complete

- [x] T005 Create src/game/computer.ts with getAvailableCells function
- [x] T006 Add selectRandomCell function in src/game/computer.ts
- [x] T007 Add selectComputerMove function (combines getAvailableCells + selectRandomCell) in src/game/computer.ts
- [x] T008 Add scheduleComputerMove function with setTimeout and cleanup in src/game/computer.ts
- [x] T009 Add COMPUTER_THINKING_DELAY constant (2000ms) in src/game/computer.ts
- [x] T010 Add state helper functions (setComputerThinking, isComputerTurn) in src/game/state.ts

**Checkpoint**: Core computer logic ready - UI implementation can now begin

---

## Phase 3: User Story 1 - Select Game Mode (Priority: P1) 🎯 MVP

**Goal**: Players can choose between "vs Human" and "vs Computer" modes

**Independent Test**: Launch game, see mode selector, switch modes, verify game resets appropriately

### Implementation for User Story 1

- [x] T011 [P] [US1] Create src/ui/modeSelector.ts with renderModeSelector function
- [x] T012 [P] [US1] Add mode selector CSS styles (.mode-selector, .mode-selector__option) in src/styles/main.css
- [x] T013 [US1] Add updateModeSelector function for state updates in src/ui/modeSelector.ts
- [x] T014 [US1] Add mode selector container to DOM structure in src/main.ts initApp
- [x] T015 [US1] Add handleModeChange function in src/main.ts
- [x] T016 [US1] Wire mode selector to handleModeChange in src/main.ts
- [x] T017 [US1] Load saved game mode on app initialization in src/main.ts
- [x] T018 [US1] Update player O name to "Computer" when switching to computer mode in src/main.ts

**Checkpoint**: Can switch between modes; mode persists on reload; "vs Human" works as before

---

## Phase 4: User Story 2 - Computer Makes Random Move (Priority: P1)

**Goal**: Computer automatically selects a random available position on its turn

**Independent Test**: Select vs Computer mode, make a move as X, verify computer places O in a random empty cell

### Implementation for User Story 2

- [x] T019 [US2] Add triggerComputerTurn function skeleton in src/main.ts
- [x] T020 [US2] Add handleComputerMove callback function in src/main.ts
- [x] T021 [US2] Call triggerComputerTurn after human move when isComputerTurn returns true in handleCellClick
- [x] T022 [US2] Implement computer move execution in handleComputerMove (call makeMove, updateUI)
- [x] T023 [US2] Store cancel function reference for pending computer moves in src/main.ts

**Checkpoint**: Computer makes valid random moves after human moves; game flow works

---

## Phase 5: User Story 3 - Computer Thinking Delay (Priority: P2)

**Goal**: 2-second delay with visual "thinking" indicator before computer moves

**Independent Test**: Make a move, see "Computer is thinking..." for ~2 seconds, then computer moves

### Implementation for User Story 3

- [x] T024 [P] [US3] Add status--thinking CSS class with animated dots in src/styles/main.css
- [x] T025 [P] [US3] Add board--thinking CSS class (pointer-events: none, opacity) in src/styles/main.css
- [x] T026 [US3] Update getStatusMessage to return thinking message when isComputerThinking in src/ui/status.ts
- [x] T027 [US3] Update getStatusClass to return 'status--thinking' class in src/ui/status.ts
- [x] T028 [US3] Update renderBoard to add board--thinking class when state.isComputerThinking in src/ui/board.ts
- [x] T029 [US3] Update updateBoard to handle thinking state class toggling in src/ui/board.ts
- [x] T030 [US3] Set isComputerThinking=true before scheduling move in triggerComputerTurn
- [x] T031 [US3] Set isComputerThinking=false in handleComputerMove before making move

**Checkpoint**: Visual thinking indicator shows; board disabled during thinking; 2-second delay works

---

## Phase 6: User Story 4 - Game Completion with Computer (Priority: P2)

**Goal**: Win/loss/draw detection and "Play Again" work correctly in vs Computer mode

**Independent Test**: Play full games to win, lose, and draw; verify correct messages; Play Again maintains mode

### Implementation for User Story 4

- [x] T032 [US4] Verify win detection displays correct player name (human or computer) in src/ui/status.ts
- [x] T033 [US4] Cancel pending computer move on game reset in handleNewGame in src/main.ts
- [x] T034 [US4] Preserve gameMode when resetting game in resetGame function in src/game/state.ts
- [x] T035 [US4] Cancel pending computer move when mode changes in handleModeChange

**Checkpoint**: All game endings work correctly; Play Again stays in same mode; no orphaned timers

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and edge case handling

- [x] T036 [P] Add responsive styles for mode selector (touch-friendly 44px targets) in src/styles/main.css
- [x] T037 [P] Add aria-label and role attributes for mode selector accessibility in src/ui/modeSelector.ts
- [x] T038 Disable mode selector during active game (not on fresh board) in src/main.ts
- [x] T039 Verify computer name is editable via existing player name input
- [x] T040 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (types must exist)
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 but US2 depends on mode selection (US1)
  - US3 and US4 are P2, depend on US2 for basic computer turn flow
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 1 (Setup) ──► Phase 2 (Foundational) ──┬──► US1 (Mode Selection) ──► US2 (Random Move)
                                             │                                    │
                                             │                                    ▼
                                             │                              US3 (Thinking Delay)
                                             │                                    │
                                             │                                    ▼
                                             │                              US4 (Game Completion)
                                             │                                    │
                                             └────────────────────────────────────┴──► Phase 7 (Polish)
```

### Parallel Opportunities

**Within Phase 1:**
```
T001 (types.ts)  ──┐
T002 (playerNames.ts) [P] ──┼── Can run in parallel
```

**Within Phase 3 (US1):**
```
T011 (modeSelector.ts) [P] ──┬── Can run in parallel
T012 (main.css) [P] ─────────┘
```

**Within Phase 5 (US3):**
```
T024 (CSS thinking) [P] ──┬── Can run in parallel
T025 (CSS board) [P] ─────┘
```

**Within Phase 7:**
```
T036 (responsive CSS) [P] ──┬── Can run in parallel
T037 (accessibility) [P] ───┘
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T010)
3. Complete Phase 3: US1 - Mode Selection (T011-T018)
4. Complete Phase 4: US2 - Random Move (T019-T023)
5. **STOP and VALIDATE**: Can play against computer with instant moves
6. Deploy/demo basic computer opponent

### Full Feature

1. Continue with Phase 5: US3 - Thinking Delay (T024-T031)
2. Continue with Phase 6: US4 - Game Completion (T032-T035)
3. Complete Phase 7: Polish (T036-T040)
4. Full feature validation

---

## Notes

- Total tasks: 40
- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 6 tasks
- US1 (Mode Selection): 8 tasks
- US2 (Random Move): 5 tasks
- US3 (Thinking Delay): 8 tasks
- US4 (Game Completion): 4 tasks
- Polish: 5 tasks
- Parallel opportunities: 8 tasks marked [P]
- No test tasks included (not explicitly requested)
- Commit after each logical group of tasks
- Validate at each checkpoint before proceeding
