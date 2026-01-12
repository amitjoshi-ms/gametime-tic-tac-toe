# AGENTS.md

Guidelines for AI coding agents working with this Tic-Tac-Toe codebase.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Type check
npm run typecheck

# Lint
npm run lint
```

## Repository Structure

```
src/                    # Application source code
├── main.ts             # Entry point (orchestration, event handling)
├── game/               # Pure game logic (NO side effects)
│   ├── types.ts        # Domain types (GameState, CellValue, etc.)
│   ├── logic.ts        # Game rules (checkWin, isValidMove)
│   ├── state.ts        # State transitions (makeMove, resetGame)
│   └── playerNames.ts  # Player name persistence
├── ui/                 # DOM manipulation (rendering only)
│   ├── board.ts        # Board rendering
│   ├── status.ts       # Status display
│   ├── controls.ts     # Buttons
│   └── playerNames.ts  # Name input fields
└── styles/             # CSS

tests/
├── unit/               # Vitest unit tests
└── e2e/                # Playwright E2E tests

.github/
├── copilot-instructions.md   # Main development guidelines
├── instructions/             # Topic-specific instructions
├── prompts/                  # Reusable prompts
└── agents/                   # Agent definitions
```

## Architecture Rules

### Separation of Concerns

| Layer | Responsibility | Side Effects |
|-------|----------------|--------------|
| `src/game/logic.ts` | Game rules | NONE - pure functions |
| `src/game/state.ts` | State transitions | NONE - returns new objects |
| `src/ui/*.ts` | DOM rendering | DOM writes only |
| `src/main.ts` | Orchestration | Events, DOM, storage |

### State Management

- State is **immutable** - always return new objects
- Single source of truth in `main.ts`
- UI receives state via parameters, not imports

### Type Safety

- **No `any`** - use `unknown` + type narrowing
- Core game types defined in `src/game/types.ts`
- Strict mode enabled in TypeScript

## Branch Workflow

**Always create feature branches:**

```bash
# Start new work
git checkout main
git pull origin main
git checkout -b feature-<name>

# Never commit directly to main or release
```

## Testing Requirements

### Before Committing

```bash
npm run typecheck  # Must pass
npm run lint       # Must pass
npm test           # All tests must pass
npm run test:e2e   # All tests must pass (if UI changed)
npm run build      # Must succeed
```

### Test Coverage

- New logic functions need unit tests
- New UI features need E2E tests
- Bug fixes need regression tests

## Code Style

- **Files:** camelCase (`playerNames.ts`)
- **Types:** PascalCase (`GameState`)
- **Functions:** camelCase (`handleCellClick`)
- **Constants:** UPPER_SNAKE_CASE (`WINNING_LINES`)

## Common Tasks

### Adding a Feature

1. Define types in `src/game/types.ts`
2. Add pure logic in `src/game/logic.ts`
3. Add state transitions in `src/game/state.ts`
4. Add UI rendering in `src/ui/`
5. Wire up in `src/main.ts`
6. Add unit tests
7. Add E2E tests

### Fixing a Bug

1. Write failing test first
2. Fix the bug
3. Verify test passes
4. Verify no regressions

### Running Specific Tests

```bash
# Unit tests for logic
npm test -- logic.test.ts

# E2E tests for gameplay
npx playwright test gameplay.spec.ts

# Debug E2E
npx playwright test --debug
```

## Deployment

- **main** branch → Preview: `main.gametime-tic-tac-toe.pages.dev`
- **release** branch → Production: `gametime-tic-tac-toe.pages.dev`

Cloudflare Pages auto-deploys on push.

## What to Avoid

- ❌ Adding runtime dependencies
- ❌ Using `any` type
- ❌ Mutating state objects
- ❌ DOM manipulation in `src/game/`
- ❌ Importing state directly in UI modules
- ❌ `console.log` in production code
- ❌ Committing directly to `main` or `release`
