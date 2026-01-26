# Tasks: 3D Visual Board Design

**Input**: Design documents from `/specs/005-3d-board/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: E2E tests included for visual and interaction verification.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Add CSS custom properties infrastructure for 3D effects

- [x] T001 Add 3D effect CSS custom properties to `:root` in src/styles/main.css
- [x] T002 Add 3D shadow CSS custom properties to `:root` in src/styles/main.css

---

## Phase 2: Foundational

**Purpose**: Core 3D transform structure that enables all user stories

**⚠️ CRITICAL**: All user stories depend on this foundation

- [x] T003 Add 3D perspective and transform-style to `.board` class in src/styles/main.css
- [x] T004 Add base 3D translateZ and box-shadow to `.cell` class in src/styles/main.css
- [x] T005 Add will-change optimization to `.cell` for GPU acceleration in src/styles/main.css
- [x] T006 Add `@supports` graceful degradation fallback for browsers without 3D support in src/styles/main.css
- [x] T007 [P] Verify 3D transforms work via manual browser check (Chrome DevTools)
- [x] T008 [P] Run existing E2E tests to confirm no regressions in tests/e2e/ (168 tests passed)

**Checkpoint**: Foundation ready - board displays with static 3D appearance

**PR 1 Complete**: Foundation with regression check ✅

---

## Phase 3: User Story 1 - View 3D Board with Depth (Priority: P1) 🎯 MVP

**Goal**: Board displays with 3D perspective, cells have raised appearance with shadows, symbols render correctly

**Independent Test**: Load game and visually confirm board has perspective, depth, and shadows

### E2E Tests for User Story 1

- [ ] T009 [P] [US1] Create E2E test file tests/e2e/board3d.spec.ts with test structure
- [ ] T010 [P] [US1] Add test: board displays with 3D perspective in tests/e2e/board3d.spec.ts
- [ ] T011 [P] [US1] Add test: cells have shadow styling in tests/e2e/board3d.spec.ts
- [ ] T012 [P] [US1] Add test: all 9 cells remain clickable with 3D transforms in tests/e2e/board3d.spec.ts
- [ ] T013 [P] [US1] Add test: symbols (X, O) render correctly on 3D surface in tests/e2e/board3d.spec.ts

### Implementation for User Story 1

- [ ] T014 [US1] Verify board perspective transform displays correctly in src/styles/main.css
- [ ] T015 [US1] Verify cell elevation and shadow styling in src/styles/main.css
- [ ] T016 [US1] Verify symbols remain visible and properly styled on 3D cells in src/styles/main.css
- [ ] T017 [US1] Implement `.cell--winner` class for winning cells 3D styling in src/styles/main.css and update src/ui/board.ts to apply when win detected

**Checkpoint**: User Story 1 complete - board displays with 3D depth and is fully playable

**PR 2 Complete**: US1 MVP with E2E tests ✅

---

## Phase 4: User Story 2 - Interactive 3D Feedback (Priority: P2)

**Goal**: Cells provide visual feedback on hover/focus with 3D lift animation

**Independent Test**: Hover over empty cells and observe lift animation; use keyboard to focus

### E2E Tests for User Story 2

- [ ] T018 [P] [US2] Add test: cell hover triggers visual lift effect in tests/e2e/board3d.spec.ts
- [ ] T019 [P] [US2] Add test: cell focus shows visible focus state in tests/e2e/board3d.spec.ts
- [ ] T020 [P] [US2] Add test: occupied cells do not show hover lift in tests/e2e/board3d.spec.ts

### Implementation for User Story 2

- [ ] T021 [US2] Add hover transform with increased translateZ to `.cell:hover` in src/styles/main.css
- [ ] T022 [US2] Add enhanced box-shadow on hover in src/styles/main.css
- [ ] T023 [US2] Add 3D-enhanced focus-visible state for keyboard navigation in src/styles/main.css
- [ ] T024 [US2] Ensure `.cell--occupied` and `.cell--disabled` exclude hover effects in src/styles/main.css

**Checkpoint**: User Story 2 complete - interactive 3D feedback works

**PR 3 Complete**: US2 hover/focus with E2E tests ✅

---

## Phase 5: User Story 3 - Theme Compatibility (Priority: P3)

**Goal**: 3D effects adapt to light and dark themes

**Independent Test**: Switch themes and confirm shadows/highlights adapt appropriately

### E2E Tests for User Story 3

- [ ] T025 [P] [US3] Add test: 3D shadows visible in dark theme in tests/e2e/board3d.spec.ts
- [ ] T026 [P] [US3] Add test: 3D shadows adapt for light theme when `prefers-color-scheme: light` applied in tests/e2e/board3d.spec.ts

### Implementation for User Story 3

- [ ] T027 [US3] Verify dark theme shadow colors work with current variables in src/styles/main.css
- [ ] T028 [US3] Add `@media (prefers-color-scheme: light)` overrides to introduce light theme support for 3D shadows in src/styles/main.css

**Checkpoint**: User Story 3 complete - 3D effects work in dark theme (existing) and light theme (newly added)

---

## Phase 6: User Story 4 - Responsive 3D Layout (Priority: P3)

**Goal**: 3D perspective scales appropriately across viewport sizes

**Independent Test**: View in portrait and landscape modes at various viewport widths

### E2E Tests for User Story 4

- [ ] T029 [P] [US4] Add test: 3D perspective works at desktop width (1024px) in tests/e2e/board3d.spec.ts
- [ ] T030 [P] [US4] Add test: 3D perspective adapts at mobile width (375px) in tests/e2e/board3d.spec.ts
- [ ] T031 [P] [US4] Add test: 3D perspective adapts at small mobile width (320px) in tests/e2e/board3d.spec.ts

### Implementation for User Story 4

- [ ] T032 [US4] Add responsive media query `@media (max-width: 480px)` for mobile perspective in src/styles/main.css
- [ ] T033 [US4] Add responsive media query `@media (max-width: 320px)` for small mobile in src/styles/main.css

**Checkpoint**: User Story 4 complete - responsive 3D layout works across devices

**PR 4 Complete**: US3 + US4 with E2E tests ✅

---

## Phase 7: Accessibility - Reduced Motion (Cross-Cutting)

**Purpose**: Respect user preference for reduced motion

- [ ] T034 Add `@media (prefers-reduced-motion: reduce)` to disable 3D animations in src/styles/main.css
- [ ] T035 Verify static 3D appearance is preserved when motion is reduced in src/styles/main.css
- [ ] T036 [P] Add test: reduced motion users see no hover animations in tests/e2e/board3d.spec.ts

---

## Phase 8: Polish & Validation

**Purpose**: Final verification and documentation

- [ ] T037 [P] Run all E2E tests and verify passing in tests/e2e/board3d.spec.ts
- [ ] T038 [P] Run existing E2E tests to verify no regressions in tests/e2e/
- [ ] T039 [P] Cross-browser testing: Chrome, Firefox, Safari, Edge
- [ ] T040 [P] Performance validation: verify 60fps animations using DevTools
- [ ] T041 Run quickstart.md validation checklist in specs/005-3d-board/quickstart.md
- [ ] T042 Update feature spec status to "Complete" in specs/005-3d-board/spec.md

**PR 5 Complete**: Accessibility + polish + docs ✅

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 1 (Setup) ─────────────────────────────────────────────────────────────┐
                                                                              │
Phase 2 (Foundational) ──────────────────────────────────────────────────────┤
                                                                              │
     ┌────────────────┬────────────────┬────────────────┬──────────────────┐  │
     │                │                │                │                  │  │
     ▼                ▼                ▼                ▼                  ▼  │
Phase 3 (US1)    Phase 4 (US2)   Phase 5 (US3)   Phase 6 (US4)   Phase 7     │
  P1 MVP                                              (Parallel)  (Accessibility)
     │                │                │                │                  │
     └────────────────┴────────────────┴────────────────┴──────────────────┘
                                       │
                                       ▼
                               Phase 8 (Polish)
```

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 2 - Can start after foundation complete
- **User Story 2 (P2)**: Depends on Phase 2 - Can run parallel with US1
- **User Story 3 (P3)**: Depends on Phase 2 - Can run parallel with US1/US2
- **User Story 4 (P3)**: Depends on Phase 2 - Can run parallel with US1/US2/US3

### Within Each User Story

1. Create E2E tests first (tests should initially fail)
2. Implement CSS changes
3. Verify tests pass
4. Move to next story

### Parallel Opportunities per Phase

| Phase | Parallel Tasks |
|-------|----------------|
| Phase 1 | T001, T002 |
| Phase 2 | T003-T004 parallel (different selectors), T005-T006 sequential after |
| Phase 3 | T009-T013 (all tests), T014-T017 after tests |
| Phase 4 | T018-T020 (all tests), T021-T024 after tests |
| Phase 5 | T025-T026 (tests), T027-T028 after |
| Phase 6 | T029-T031 (tests), T032-T033 after |
| Phase 7 | T034-T035 sequential, T036 parallel |
| Phase 8 | T037-T042 all parallel |

---

## Parallel Example: User Story 1

```bash
# Thread 1: Create test file and test infrastructure
T009 → T010 → T011 → T012 → T013

# Thread 2: After tests written, implement CSS (single file, sequential)
T014 → T015 → T016 → T017
```

---

## Implementation Strategy

### Small PR Strategy (Recommended)

Each PR should be independently mergeable and deliver incremental value:

| PR # | Phases | Tasks | Tests | Docs | Issue Link |
|------|--------|-------|-------|------|------------|
| **PR 1** | 1-2 | T001-T008 | ✅ Regression (T008) | - | `Part of #144` |
| **PR 2** | 3 | T009-T017 | ✅ 5 E2E (T009-T013) | - | `Part of #144` |
| **PR 3** | 4 | T018-T024 | ✅ 3 E2E (T018-T020) | - | `Part of #144` |
| **PR 4** | 5-6 | T025-T033 | ✅ 5 E2E (T025-T031) | - | `Part of #144` |
| **PR 5** | 7-8 | T034-T042 | ✅ 1 E2E + validation | ✅ T041-T042 | `Closes #144` |

**Each PR includes:**
- ✅ Tests (E2E or regression check)
- ✅ Self-contained (no broken states)
- ✅ < 10 tasks per PR
- ✅ Docs in final PR (spec status update)
- ✅ Issue link (`Part of #144` keeps issue open, `Closes #144` on final PR)

### MVP Scope (Single PR Alternative)

**If you prefer one larger PR, complete:**
- Phase 1: Setup (T001-T002)
- Phase 2: Foundational (T003-T006)
- Phase 3: User Story 1 (T009-T017)

This delivers a fully functional 3D board with ~17 tasks.

### Full Implementation

Complete all phases for:
- Interactive hover/focus feedback (US2)
- Theme compatibility (US3)
- Responsive design (US4)
- Full accessibility compliance

Total: 42 tasks

---

## Summary

| Metric | Count |
|--------|-------|
| Total Tasks | 42 |
| Recommended PRs | 5 |
| E2E Tests Added | 14 |
| MVP Task Count | 17 (PRs 1-2) |

### PR Breakdown

| PR | Tasks | Tests | Docs | Focus |
|----|-------|-------|------|-------|
| PR 1 | 8 | ✅ Regression | - | Foundation (CSS vars + 3D transforms) |
| PR 2 | 9 | ✅ 5 E2E | - | US1 - 3D Board MVP |
| PR 3 | 7 | ✅ 3 E2E | - | US2 - Hover/focus effects |
| PR 4 | 9 | ✅ 5 E2E | - | US3+US4 - Theme + responsive |
| PR 5 | 9 | ✅ 1 E2E | ✅ Spec update | Accessibility + polish |
