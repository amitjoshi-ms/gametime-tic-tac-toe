# Implementation Plan: Core Tic-Tac-Toe Gameplay

**Branch**: `001-core-gameplay` | **Date**: 2026-01-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-core-gameplay/spec.md`

## Summary

Build a browser-based Tic-Tac-Toe game as a static SPA with zero runtime dependencies. The game features a 3x3 board, turn indicator, win/draw detection with congratulations messages, and new game functionality. Uses vanilla TypeScript compiled to ES modules, CSS custom properties for styling, and localStorage for optional customization persistence. Designed for CDN hosting with full offline capability via Service Worker.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), targeting ES2022 output  
**Primary Dependencies**: None at runtime; Vite (dev/build only)  
**Storage**: Browser localStorage (for future customization only; not required for core gameplay)  
**Testing**: Vitest for unit tests, Playwright for E2E tests  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions), all form factors  
**Project Type**: Single static web application (SPA)  
**Performance Goals**: FCP < 1.5s, TTI < 2s, interaction response < 100ms  
**Constraints**: Bundle < 100KB gzipped, zero runtime dependencies, fully offline-capable, CDN-hostable static assets only  
**Scale/Scope**: Single-page app, ~5 components, ~500 LOC estimated

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Browser-Native SPA | ✅ PASS | All logic runs client-side, no backend required, responsive design specified |
| II. Minimal Dependencies | ✅ PASS | Zero runtime dependencies; only Vite for build tooling |
| III. Clean & Simple UX | ✅ PASS | Intuitive 3x3 grid, clear turn indicator, immediate feedback, touch+mouse support |
| IV. Documentation-First | ✅ PASS | Spec created before implementation, README and inline docs planned |
| V. Modern Standards | ✅ PASS | TypeScript 5.x, ES2022+, Vite, Vitest, ESLint, Prettier |

**Gate Result**: ✅ ALL PASS - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/001-core-gameplay/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (internal module contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── main.ts              # Application entry point
├── game/
│   ├── state.ts         # Game state management (board, turn, outcome)
│   ├── logic.ts         # Win/draw detection algorithms
│   └── types.ts         # TypeScript types and enums
├── ui/
│   ├── board.ts         # Board rendering and cell click handlers
│   ├── status.ts        # Turn indicator and result messages
│   └── controls.ts      # New game button
├── styles/
│   └── main.css         # All styles with CSS custom properties
└── sw.ts                # Service Worker for offline support

public/
├── index.html           # Single HTML entry point
├── manifest.json        # PWA manifest for installability
└── icons/               # App icons for PWA

tests/
├── unit/
│   ├── state.test.ts    # Game state tests
│   └── logic.test.ts    # Win/draw detection tests
└── e2e/
    └── gameplay.spec.ts # Full game flow E2E tests
```

**Structure Decision**: Single project structure selected. This is a client-only SPA with no backend. All source code lives in `src/` with logical separation between game logic (`game/`) and UI rendering (`ui/`). Static assets in `public/` are copied directly to build output. Service Worker enables offline functionality.

## Constitution Re-Check (Post-Design)

*GATE: Verify design artifacts still comply with Constitution.*

| Principle | Status | Post-Design Evidence |
|-----------|--------|---------------------|
| I. Browser-Native SPA | ✅ PASS | No server-side code in contracts; Service Worker for offline; responsive CSS planned |
| II. Minimal Dependencies | ✅ PASS | research.md confirms zero runtime deps; `vite-plugin-pwa` is dev-only |
| III. Clean & Simple UX | ✅ PASS | data-model.md shows simple state; contracts show clear status messages |
| IV. Documentation-First | ✅ PASS | All Phase 0/1 artifacts complete: research.md, data-model.md, contracts/, quickstart.md |
| V. Modern Standards | ✅ PASS | TypeScript strict mode, ES2022 target, Vitest + Playwright in quickstart |

**Post-Design Gate Result**: ✅ ALL PASS - Ready for `/speckit.tasks`

## Complexity Tracking

> No violations - Constitution fully satisfied with minimal implementation.
