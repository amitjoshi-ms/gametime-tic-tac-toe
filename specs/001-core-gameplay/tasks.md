# Tasks: Core Tic-Tac-Toe Gameplay

**Input**: Design documents from `/specs/001-core-gameplay/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not explicitly requested in spec. Unit tests included for game logic (critical path). E2E tests reserved for Polish phase.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root (per plan.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and Vite configuration

- [x] T001 Initialize npm project with package.json in repository root
- [x] T002 Install dev dependencies: typescript, vite, vitest, @playwright/test, vite-plugin-pwa, eslint, prettier
- [x] T003 [P] Create TypeScript configuration in tsconfig.json with strict mode
- [x] T004 [P] Create Vite configuration in vite.config.ts with PWA plugin
- [x] T005 [P] Configure ESLint in eslint.config.js for TypeScript
- [x] T006 [P] Configure Prettier in .prettierrc
- [x] T007 Create project directory structure per plan.md (src/game/, src/ui/, src/styles/, public/, tests/)
- [x] T008 Create HTML entry point in public/index.html with app container
- [x] T009 [P] Create PWA manifest in public/manifest.json
- [x] T010 [P] Add placeholder app icons in public/icons/ (192x192, 512x512)

**Checkpoint**: Project builds with `npm run dev` and shows empty page ✅

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types and base CSS that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T011 Create type definitions in src/game/types.ts (CellValue, Player, GameStatus, GameState, WinningLine)
- [x] T012 Create CSS custom properties and base styles in src/styles/main.css (colors, responsive grid, typography)
- [x] T013 Create application entry point scaffold in src/main.ts (imports, DOM ready handler)

**Checkpoint**: Foundation ready - `npm run dev` shows styled empty container ✅

---

## Phase 3: User Story 1 - Play a Complete Game (Priority: P1) 🎯 MVP

**Goal**: Two players can take turns placing X and O marks on a 3x3 board

**Independent Test**: Open app, click cells, verify marks appear in alternating X/O pattern

### Implementation for User Story 1

- [x] T014 [P] [US1] Implement createInitialState() in src/game/state.ts
- [x] T015 [P] [US1] Implement WINNING_LINES constant in src/game/logic.ts
- [x] T016 [P] [US1] Implement isValidMove() in src/game/logic.ts
- [x] T017 [US1] Implement makeMove() in src/game/state.ts (depends on T014, T016)
- [x] T018 [P] [US1] Create board grid CSS in src/styles/main.css (3x3 grid, cell styling, X/O marks)
- [x] T019 [US1] Implement renderBoard() in src/ui/board.ts with cell click handlers
- [x] T020 [US1] Implement updateBoard() in src/ui/board.ts for efficient re-renders
- [x] T021 [US1] Wire up game state and board rendering in src/main.ts

**Checkpoint**: Can play X/O alternating turns, clicking occupied cells does nothing ✅

---

## Phase 4: User Story 2 - See Current Turn Indicator (Priority: P1)

**Goal**: Players clearly see whose turn it is at all times

**Independent Test**: Turn indicator shows "Player X's Turn" initially, updates after each move

### Implementation for User Story 2

- [x] T022 [P] [US2] Add status display CSS in src/styles/main.css (turn indicator styling)
- [x] T023 [US2] Implement getStatusMessage() in src/ui/status.ts for turn display
- [x] T024 [US2] Implement renderStatus() in src/ui/status.ts
- [x] T025 [US2] Integrate status rendering into src/main.ts game loop

**Checkpoint**: Turn indicator shows and updates correctly with each move ✅

---

## Phase 5: User Story 3 - Win Detection and Congratulations (Priority: P1)

**Goal**: Game detects 3-in-a-row and displays winner congratulations

**Independent Test**: Complete a winning line, see "🎉 Player X Wins!" message, game stops accepting moves

### Implementation for User Story 3

- [x] T026 [P] [US3] Implement checkWin() in src/game/logic.ts
- [x] T027 [US3] Implement determineStatus() in src/game/logic.ts (depends on T026)
- [x] T028 [US3] Update makeMove() in src/game/state.ts to call determineStatus after each move
- [x] T029 [P] [US3] Add win/result styling in src/styles/main.css (congratulations message, game-over state)
- [x] T030 [US3] Update getStatusMessage() in src/ui/status.ts for win messages
- [x] T031 [US3] Update renderBoard() in src/ui/board.ts to disable clicks when game over

**Checkpoint**: All 8 winning combinations detected, congratulations shown, no more moves accepted ✅

---

## Phase 6: User Story 4 - Draw Detection (Priority: P2)

**Goal**: Game recognizes when all cells filled with no winner

**Independent Test**: Fill all 9 cells without winning line, see "It's a Draw!" message

### Implementation for User Story 4

- [x] T032 [US4] Implement isBoardFull() in src/game/logic.ts
- [x] T033 [US4] Update determineStatus() in src/game/logic.ts to check draw after no win
- [x] T034 [US4] Update getStatusMessage() in src/ui/status.ts for draw message

**Checkpoint**: Draw condition detected and displayed correctly ✅

---

## Phase 7: User Story 5 - Start New Game (Priority: P2)

**Goal**: Players can reset the game at any time

**Independent Test**: Click "New Game" button, board clears, turn resets to X

### Implementation for User Story 5

- [x] T035 [P] [US5] Add New Game button CSS in src/styles/main.css
- [x] T036 [US5] Implement renderControls() in src/ui/controls.ts with New Game button
- [x] T037 [US5] Implement resetGame() in src/game/state.ts
- [x] T038 [US5] Wire up New Game button to reset handler in src/main.ts

**Checkpoint**: New Game button visible, clicking it resets entire game state ✅

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: PWA, offline support, documentation, final testing

- [X] T039 Create Service Worker in src/sw.ts for offline caching
- [X] T040 Register Service Worker in src/main.ts
- [X] T041 [P] Create README.md with project overview, setup, and usage
- [X] T042 [P] Add responsive breakpoints to src/styles/main.css for mobile/tablet/desktop
- [X] T043 [P] Add touch feedback styles in src/styles/main.css (active states, tap highlights)
- [X] T044 Add accessibility attributes (ARIA labels, focus states) in src/ui/board.ts
- [X] T045 [P] Create unit tests for game logic in tests/unit/logic.test.ts
- [X] T046 [P] Create unit tests for game state in tests/unit/state.test.ts
- [X] T047 Create E2E test for full gameplay flow in tests/e2e/gameplay.spec.ts
- [X] T048 Run quickstart.md validation (npm run dev, npm run build, npm run test)
- [X] T049 Verify bundle size < 100KB gzipped

**Checkpoint**: App works offline, tests pass, documentation complete ✅

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on T001, T002 - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion
- **User Story 2 (Phase 4)**: Depends on Phase 2 completion (can parallel with US1)
- **User Story 3 (Phase 5)**: Depends on US1 (needs makeMove, board rendering)
- **User Story 4 (Phase 6)**: Depends on US3 (extends determineStatus)
- **User Story 5 (Phase 7)**: Depends on Phase 2 only (independent reset)
- **Polish (Phase 8)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (Play Game)**: Foundation only - Core MVP
- **US2 (Turn Indicator)**: Foundation only - Can parallel with US1
- **US3 (Win Detection)**: Depends on US1 (needs game state flow)
- **US4 (Draw Detection)**: Depends on US3 (extends status logic)
- **US5 (New Game)**: Foundation only - Independent, can start after Phase 2

### Parallel Opportunities

**Phase 1 parallel group**:
- T003, T004, T005, T006 (all config files)
- T009, T010 (PWA assets)

**Phase 3 parallel group (US1)**:
- T014, T015, T016 (independent logic functions)
- T018 (CSS - no code dependencies)

**Phase 4 parallel group (US2)**:
- T022 (CSS - no code dependencies)

**Phase 5 parallel group (US3)**:
- T026 (checkWin independent)
- T029 (CSS - no code dependencies)

**Phase 8 parallel group (Polish)**:
- T041, T042, T043 (docs and CSS)
- T045, T046 (unit test files)

---

## Parallel Example: Phase 3 (User Story 1)

```bash
# Launch independent game logic tasks together:
T014: "Implement createInitialState() in src/game/state.ts"
T015: "Implement WINNING_LINES constant in src/game/logic.ts"
T016: "Implement isValidMove() in src/game/logic.ts"
T018: "Create board grid CSS in src/styles/main.css"

# Then sequential tasks that depend on above:
T017: "Implement makeMove() in src/game/state.ts" (needs T014, T016)
T019: "Implement renderBoard() in src/ui/board.ts" (needs T018)
T020: "Implement updateBoard() in src/ui/board.ts" (needs T019)
T021: "Wire up game state and board rendering in src/main.ts" (needs all above)
```

---

## Implementation Strategy

### MVP First (User Stories 1-3)

1. Complete Phase 1: Setup ✓
2. Complete Phase 2: Foundational ✓
3. Complete Phase 3: US1 - Play a Complete Game ✓
4. Complete Phase 4: US2 - Turn Indicator ✓
5. Complete Phase 5: US3 - Win Detection ✓
6. **STOP and VALIDATE**: Full playable game with win detection
7. Deploy MVP!

### Full Feature Set

8. Complete Phase 6: US4 - Draw Detection
9. Complete Phase 7: US5 - New Game
10. Complete Phase 8: Polish (PWA, tests, docs)
11. Final deployment

### Suggested Commit Points

- After T010: "chore: project setup and configuration"
- After T013: "feat: foundational types and styles"
- After T021: "feat(US1): basic gameplay with X/O turns"
- After T025: "feat(US2): turn indicator display"
- After T031: "feat(US3): win detection and congratulations"
- After T034: "feat(US4): draw detection"
- After T038: "feat(US5): new game reset"
- After T049: "chore: PWA, tests, and documentation"

---

## Notes

- All tasks include exact file paths per contracts/modules.md
- [P] tasks can run in parallel (different files, no dependencies)
- [Story] labels (US1-US5) map to spec.md user stories
- No test tasks in story phases (not explicitly requested in spec)
- Unit/E2E tests consolidated in Polish phase
- Total: 49 tasks (10 setup, 3 foundational, 25 story implementation, 11 polish)
