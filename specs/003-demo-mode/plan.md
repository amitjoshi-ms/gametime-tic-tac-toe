# Implementation Plan: Demo Mode

**Branch**: `003-demo-mode` | **Date**: January 11, 2026 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-demo-mode/spec.md`

## Summary

Add a demo mode where two computer players compete against each other with natural timing delays. Users can start/stop demo with a single button, customize computer player names via existing inputs, and watch games auto-restart after 15 seconds. Implementation reuses existing `selectComputerMove` logic and `setTimeout` for timing—no external dependencies.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled)
**Primary Dependencies**: None (uses native browser APIs only)
**Storage**: localStorage (existing `storage.ts` utilities for name persistence)
**Testing**: Vitest for unit tests, Playwright for E2E tests
**Target Platform**: Browser SPA (ES2022 modules)
**Project Type**: Single SPA
**Performance Goals**: < 100ms UI response, < 100KB gzipped bundle
**Constraints**: Zero runtime dependencies, bundle size constraint, must work offline
**Scale/Scope**: Single-player casual game, minimal state complexity

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Browser-Native SPA | ✅ PASS | Uses only native `setTimeout`/`clearTimeout` for timing |
| II. Minimal Dependencies | ✅ PASS | Zero new dependencies; reuses existing `computer.ts` logic |
| III. Clean & Simple UX | ✅ PASS | Single toggle button, existing name inputs, clear visual state |
| IV. Documentation-First | ✅ PASS | Spec complete, plan documents approach before code |
| V. Modern Standards | ✅ PASS | Pure TypeScript, immutable state transitions |

### Post-Design Check (Phase 1 Complete)

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Browser-Native SPA | ✅ PASS | Design uses only `setTimeout`/`clearTimeout`, no server deps |
| II. Minimal Dependencies | ✅ PASS | Zero new npm packages; estimated +1-2KB bundle impact |
| III. Clean & Simple UX | ✅ PASS | Single button toggle, names via existing UI, clear visual cues |
| IV. Documentation-First | ✅ PASS | research.md, data-model.md, contracts/modules.md complete |
| V. Modern Standards | ✅ PASS | Extends existing TypeScript types, immutable state pattern |

**Bundle Impact**: Estimated +1-2KB (new demo state logic + UI button)

## Project Structure

### Documentation (this feature)

```text
specs/003-demo-mode/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── modules.md       # Module interface contracts
└── tasks.md             # Phase 2 output (from /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── main.ts              # MODIFY: Add demo orchestration, wire demo button
├── game/
│   ├── types.ts         # MODIFY: Add DemoState type, extend GameState or GameMode
│   ├── state.ts         # MODIFY: Add demo state transitions if needed
│   ├── computer.ts      # REUSE: selectComputerMove (no changes needed)
│   ├── logic.ts         # REUSE: checkWin, isValidMove (no changes)
│   └── playerNames.ts   # REUSE: Name persistence (no changes)
├── ui/
│   ├── controls.ts      # MODIFY: Add demo toggle button
│   ├── board.ts         # MODIFY: Add visual indicator for demo mode
│   ├── status.ts        # MODIFY: Show demo-specific status messages
│   ├── modeSelector.ts  # MODIFY: Disable during demo mode
│   └── playerNames.ts   # MODIFY: Allow editing before demo, show during
└── styles/
    └── main.css         # MODIFY: Add demo mode visual styling

tests/
├── unit/
│   ├── demo.test.ts     # NEW: Demo state logic tests
│   └── state.test.ts    # MODIFY: Add demo-related state tests
└── e2e/
    └── demo.spec.ts     # NEW: Demo mode E2E tests
```

**Structure Decision**: Extends existing single-project structure. Demo logic integrated into existing modules to minimize complexity. No new directories needed.

## Complexity Tracking

No Constitution violations. Design follows existing patterns.
