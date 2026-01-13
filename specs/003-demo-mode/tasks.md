# Tasks: Demo Mode

**Input**: Design documents from `/specs/003-demo-mode/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/modules.md ✅

**Tests**: Tests included as the project has existing test infrastructure and patterns.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Type Foundation)

**Purpose**: Extend type system to support demo mode

- [x] T001 Extend GameMode union type to include 'demo' in src/game/types.ts
- [x] T002 [P] Add DEFAULT_DEMO_X_NAME and DEFAULT_DEMO_O_NAME constants in src/game/playerNames.ts
- [x] T003 [P] Add getDemoPlayerNames() function in src/game/playerNames.ts
- [x] T004 [P] Add DEMO_RESTART_DELAY constant (15000ms) in src/game/computer.ts
- [x] T005 Add scheduleDemoRestart() function in src/game/computer.ts

**Checkpoint**: Type foundation complete - demo mode type recognized throughout codebase

---

## Phase 2: User Story 1 & 2 - Start/Stop Demo (Priority: P1) 🎯 MVP

**Goal**: Users can start and stop demo mode via a single toggle button

**Independent Test**: Click "Start Demo" → computer moves begin automatically; Click "Stop Demo" → demo halts immediately

### Implementation for US1 & US2

- [x] T006 [US1] Add DemoToggleHandler type and update renderControls() signature in src/ui/controls.ts
- [x] T007 [US1] Implement demo toggle button rendering in src/ui/controls.ts
- [x] T008 [US1] Add updateControls() function for button label updates in src/ui/controls.ts
- [x] T009 [US1] Add demo button styling (.btn-demo class) in src/styles/main.css
- [x] T010 [US1] Add module-level demo state variables (cancelRestartTimer, preDemoMode) in src/main.ts
- [x] T011 [US1] Implement startDemo() function in src/main.ts
- [x] T012 [US1] Implement stopDemo() function in src/main.ts
- [x] T013 [US1] Implement handleDemoToggle() function in src/main.ts
- [x] T014 [US1] Wire demo toggle button to handleDemoToggle in initApp() in src/main.ts
- [x] T015 [US1] Add demo mode guard to handleCellClick() to ignore clicks in src/main.ts
- [x] T016 [US1] Update updateUI() to call updateControls() in src/main.ts

### Tests for US1 & US2

- [x] T017 [P] [US1] Add unit tests for getDemoPlayerNames() in tests/unit/playerNames.test.ts
- [x] T018 [P] [US1] Add unit tests for scheduleDemoRestart() in tests/unit/computer.test.ts
- [x] T019 [US1] Add E2E test: start demo via button click in tests/e2e/demo.spec.ts
- [x] T020 [US1] Add E2E test: stop demo via button click in tests/e2e/demo.spec.ts
- [x] T021 [US1] Add E2E test: cell clicks ignored during demo in tests/e2e/demo.spec.ts

**Checkpoint**: Users can start/stop demo mode - MVP functional

---

## Phase 3: User Story 3 - Auto-Restart (Priority: P2)

**Goal**: Completed demo games auto-restart after 15-second display

**Independent Test**: Let demo game complete → result displays → new game starts automatically after 15 seconds

### Implementation for US3

- [x] T022 [US3] Implement triggerDemoMove() function for chained computer moves in src/main.ts
- [x] T023 [US3] Implement handleDemoGameComplete() for result display and restart scheduling in src/main.ts
- [x] T024 [US3] Integrate game completion detection with demo restart logic in src/main.ts
- [x] T025 [US3] Ensure stopDemo() cancels restart timer in src/main.ts

### Tests for US3

- [x] T026 [US3] Add E2E test: demo auto-restarts after game completion in tests/e2e/demo.spec.ts
- [x] T027 [US3] Add E2E test: stop demo during result display cancels restart in tests/e2e/demo.spec.ts

**Checkpoint**: Demo runs continuously until stopped

---

## Phase 4: User Story 4 - Natural Move Timing (Priority: P2)

**Goal**: Computer moves have 2-second delays for natural viewing

**Independent Test**: Start demo → time between moves is approximately 2 seconds

### Implementation for US4

- [x] T028 [US4] Ensure triggerDemoMove() uses COMPUTER_THINKING_DELAY (2000ms) in src/main.ts
- [x] T029 [US4] Ensure first move after auto-restart also has delay in src/main.ts
- [x] T030 [US4] Ensure stopDemo() cancels pending move timer in src/main.ts

### Tests for US4

- [x] T031 [US4] Add E2E test: moves occur with 2-second delay in tests/e2e/demo.spec.ts
- [x] T032 [US4] Add E2E test: stop demo cancels pending move in tests/e2e/demo.spec.ts

**Checkpoint**: Demo timing feels natural and watchable

---

## Phase 5: User Story 5 - Custom Computer Names (Priority: P3)

**Goal**: Users can set custom names for both computer players

**Independent Test**: Edit player names → start demo → custom names appear in status

### Implementation for US5

- [x] T033 [US5] Ensure startDemo() uses current playerNames instead of overwriting in src/main.ts
- [x] T034 [US5] Add demo indicator prefix to status messages in src/ui/status.ts
- [x] T035 [P] [US5] Add demo-mode CSS class to board container in src/ui/board.ts
- [x] T036 [P] [US5] Add disabled parameter to renderModeSelector() in src/ui/modeSelector.ts
- [x] T037 [US5] Add disabled parameter to updateModeSelector() in src/ui/modeSelector.ts
- [x] T038 [US5] Update mode selector styling for disabled state in src/styles/main.css
- [x] T039 [US5] Update initApp() to pass disabled state to mode selector in src/main.ts

### Tests for US5

- [x] T040 [US5] Add E2E test: custom names display in demo status in tests/e2e/demo.spec.ts
- [x] T041 [US5] Add E2E test: mode selector disabled during demo in tests/e2e/demo.spec.ts

**Checkpoint**: Demo mode is fully personalized and visually distinct

---

## Phase 6: Polish & Validation

**Purpose**: Final cleanup, documentation, and validation

- [x] T042 [P] Run npm run typecheck - verify no TypeScript errors
- [x] T043 [P] Run npm run lint - verify no linting errors
- [x] T044 Run npm test - verify all unit tests pass
- [x] T045 Run npm run test:e2e - verify all E2E tests pass
- [x] T046 Run npm run build - verify production build succeeds
- [ ] T047 Manual validation against quickstart.md acceptance checklist
- [ ] T048 [P] Update JSDoc comments for all new/modified exports

**Checkpoint**: Feature complete and validated

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ─────────────────────────────────────────────┐
    │                                                        │
    ▼                                                        │
Phase 2 (US1 & US2: Start/Stop) 🎯 MVP ──────────────────────┤
    │                                                        │
    ├─────────────┬─────────────┐                            │
    ▼             ▼             ▼                            │
Phase 3       Phase 4       Phase 5                          │
(US3: Auto)   (US4: Timing) (US5: Names)                     │
    │             │             │                            │
    └─────────────┴─────────────┘                            │
                  │                                          │
                  ▼                                          │
            Phase 6 (Polish) ◄───────────────────────────────┘
```

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|------------|-------------------|
| US1 & US2 | Phase 1 only | - |
| US3 | US1 & US2 | US4, US5 |
| US4 | US1 & US2 | US3, US5 |
| US5 | US1 & US2 | US3, US4 |

### Parallel Opportunities Per Phase

**Phase 1**: T002, T003, T004 can run in parallel (different files)

**Phase 2**: T017, T018 can run in parallel (different test files)

**Phase 5**: T035, T036 can run in parallel (different UI files)

**Phase 6**: T042, T043, T048 can run in parallel

---

## Implementation Strategy

### MVP Scope (Minimum Viable Demo)

Complete Phase 1 + Phase 2 for a working demo with:
- ✅ Start/stop toggle button
- ✅ Computer vs computer gameplay
- ✅ Cell clicks blocked during demo

### Full Feature

Add Phase 3, 4, 5 for complete experience:
- ✅ Auto-restart after game completion
- ✅ Natural 2-second move delays
- ✅ Custom computer names
- ✅ Visual demo indicators

### Recommended Sequence

1. **T001-T005**: Type foundation (linear, 5 tasks)
2. **T006-T016**: Core demo logic (linear, 11 tasks)
3. **T017-T021**: MVP tests (can start T017-T018 in parallel)
4. **T022-T032**: Auto-restart + timing (can parallelize US3/US4)
5. **T033-T041**: Names + visuals (can parallelize some tasks)
6. **T042-T048**: Validation (mostly parallel)

---

## Summary

| Metric | Count |
|--------|-------|
| **Total Tasks** | 48 |
| **Phase 1 (Setup)** | 5 |
| **Phase 2 (US1 & US2 - MVP)** | 16 |
| **Phase 3 (US3 - Auto-Restart)** | 6 |
| **Phase 4 (US4 - Timing)** | 5 |
| **Phase 5 (US5 - Names)** | 9 |
| **Phase 6 (Polish)** | 7 |
| **Parallelizable Tasks** | 12 |

**Suggested MVP**: Complete through T021 (21 tasks) for functional demo start/stop
