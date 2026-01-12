# Implementation Plan: Computer Opponent

**Branch**: `002-computer-opponent` | **Date**: January 11, 2026 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-computer-opponent/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add single-player mode where human plays against a computer opponent that selects random moves with a 2-second thinking delay. Extends existing game state with game mode (human vs computer), adds computer player logic with `setTimeout` for thinking simulation, and enhances UI with mode selector and "thinking" indicator. Zero new dependencies - uses native browser APIs only.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled)
**Primary Dependencies**: None (vanilla TypeScript, Vite build only)
**Storage**: localStorage (existing - for player names including computer name)
**Testing**: Vitest (unit), Playwright (E2E)
**Target Platform**: Browser SPA (Chrome, Firefox, Safari, Edge - last 2 versions)
**Project Type**: Single web application
**Performance Goals**: < 100ms UI response, 2s (±200ms) computer thinking delay
**Constraints**: < 100KB gzipped bundle, zero runtime dependencies, responsive (mobile/tablet/desktop)
**Scale/Scope**: Single-player addition to existing 2-player game

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Browser-Native SPA | ✅ PASS | All logic runs client-side; no server dependencies |
| II. Minimal Dependencies | ✅ PASS | Zero new dependencies; uses native `setTimeout`, `Math.random()` |
| III. Clean & Simple UX | ✅ PASS | Simple mode toggle; clear "thinking" indicator; responsive design |
| IV. Documentation-First | ✅ PASS | Full spec, plan, and contracts before implementation |
| V. Modern Standards | ✅ PASS | TypeScript strict mode; ES2022+ features; tested with Vitest/Playwright |
| Bundle < 100KB | ✅ PASS | Minimal code addition (~200-300 lines estimate) |

**Pre-Phase 0 Gate**: ✅ PASS - No violations

**Post-Phase 1 Re-check**: ✅ PASS - Design artifacts (data-model.md, contracts/) confirm:
- No new npm dependencies introduced
- All state management uses existing immutable patterns
- CSS-only animations (no JS animation libraries)
- Native browser APIs only (setTimeout, Math.random, localStorage)

## Project Structure

### Documentation (this feature)

```text
specs/002-computer-opponent/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── modules.md       # Module interfaces
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── main.ts              # App entry - add mode selection handler, computer turn orchestration
├── game/
│   ├── types.ts         # Add GameMode type, extend GameState
│   ├── state.ts         # Add mode to state, expose available cells helper
│   ├── logic.ts         # (unchanged - reuse existing win/draw detection)
│   ├── playerNames.ts   # Support default "Computer" name for O player
│   └── computer.ts      # NEW: Computer move selection (random + delay)
├── ui/
│   ├── board.ts         # Add disabled state during computer thinking
│   ├── status.ts        # Add "thinking" message variant
│   ├── controls.ts      # (unchanged or minor update for mode persistence)
│   ├── playerNames.ts   # Allow editing computer name
│   └── modeSelector.ts  # NEW: Game mode toggle UI component
└── styles/
    └── main.css         # Add mode selector styles, thinking animation

tests/
├── unit/
│   ├── computer.test.ts # NEW: Computer move logic tests
│   └── state.test.ts    # Add mode-related state tests
└── e2e/
    └── computer.spec.ts # NEW: E2E tests for vs Computer gameplay
```

**Structure Decision**: Single project structure (existing). New files limited to `computer.ts` (game logic) and `modeSelector.ts` (UI component). Existing files extended minimally.

## Complexity Tracking

> No violations - table not needed.
