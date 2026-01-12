# gametime-tic-tac-toe Development Guidelines

> Guidelines for GitHub Copilot and AI assistants working on this codebase.  
> Maintained by spec-kit tool and manual updates. Last updated: January 2026.

## Project Overview

A browser-based Tic-Tac-Toe game built as a static Single Page Application (SPA) with PWA capabilities. Features human vs human and human vs computer game modes. Zero runtime dependencies—pure TypeScript compiled to ES2022 modules.

## Tech Stack

| Technology | Version | Purpose                        |
| ---------- | ------- | ------------------------------ |
| TypeScript | 5.x     | Language (strict mode enabled) |
| Vite       | 7.x     | Build tooling & dev server     |
| Vitest     | 4.x     | Unit testing                   |
| Playwright | 1.57+   | E2E testing                    |
| ESLint     | 9.x     | Linting                        |
| Prettier   | 3.x     | Formatting                     |

**Target:** ES2022 output, pure ES modules, no CommonJS

## Project Structure

```text
src/                    # Application source code
├── main.ts             # Entry point, app initialization
├── game/               # Game logic (pure functions, state management)
│   ├── logic.ts        # Win detection, move validation
│   ├── state.ts        # State transitions
│   ├── types.ts        # Type definitions (domain model)
│   ├── computer.ts     # Computer opponent logic
│   └── playerNames.ts  # Player name persistence
├── ui/                 # UI rendering (DOM manipulation)
│   ├── board.ts        # Board rendering
│   ├── status.ts       # Game status display
│   ├── controls.ts     # Buttons and controls
│   ├── modeSelector.ts # Game mode toggle (human vs computer)
│   └── playerNames.ts  # Player name inputs
├── styles/             # CSS styles
└── utils/              # Shared utilities
    └── storage.ts      # localStorage helpers

tests/                  # Test suites
├── unit/               # Vitest unit tests
└── e2e/                # Playwright E2E tests

public/                 # Static assets (icons, manifest)
specs/                  # Feature specifications (spec-kit)
```

## Core Intent

- **Respect the existing architecture** and patterns in this codebase
- **Prefer readable, explicit solutions** over clever shortcuts
- **Extend current abstractions** before inventing new ones
- **Prioritize maintainability**—short methods, clean code, clear intent

## Code Style & Conventions

### TypeScript Guidelines

- **Strict mode is enabled**—never use `any` (use `unknown` + narrowing)
- Use pure ES modules; never emit `require`, `module.exports`, or CommonJS
- Define clear interfaces in `src/game/types.ts` for domain concepts
- Use discriminated unions for state machines and game status
- Express intent with utility types (`Readonly`, `Partial`, `Record`)

### Naming Conventions

- **Files:** camelCase (`playerNames.ts`, `board.ts`)
- **Types/Interfaces:** PascalCase (`GameState`, `PlayerNames`)
- **Functions/Variables:** camelCase (`handleCellClick`, `gameState`)
- **Constants:** UPPER_SNAKE_CASE (`WINNING_LINES`)
- Avoid Hungarian notation prefixes like `I` for interfaces (e.g., use `GameState` instead of `IGameState`)

### Code Organization

- **Pure functions** in `src/game/` for testability (no DOM, no side effects)
- **UI functions** in `src/ui/` handle DOM manipulation
- Keep functions focused and short; extract helpers when logic grows
- Favor immutability—create new state objects instead of mutating

### Documentation Style

- Add JSDoc comments to exported functions with `@param` and `@returns`
- Include `@module` tags at file headers
- Write comments that capture **intent**, not obvious mechanics
- Keep inline comments minimal—code should be self-explanatory

## Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # TypeScript compile + Vite build
npm run preview    # Preview production build
npm test           # Run Vitest unit tests
npm run test:watch # Run Vitest in watch mode
npm run test:e2e   # Run Playwright E2E tests (interactive mode)
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
npm run typecheck  # TypeScript type checking
```

### Running E2E Tests in CI Mode

When running E2E tests from scripts or automated contexts, use CI mode to prevent Playwright from waiting for user input on failures:

```powershell
# PowerShell
$env:CI='true'; npx playwright test
```

```bash
# Bash/Linux/macOS
CI=true npx playwright test
```

## Testing Standards

### Unit Tests (Vitest)

- Located in `tests/unit/*.test.ts`
- Test pure logic functions in isolation
- Use descriptive test names: `should detect X wins in top row`
- Group related tests with `describe()` blocks
- Cover edge cases and error conditions

```typescript
// ✅ Good test structure
describe('checkWin', () => {
  it('should return false for empty board', () => {
    const board: CellValue[] = Array(9).fill(null);
    expect(checkWin(board, 'X')).toBe(false);
  });
});
```

### E2E Tests (Playwright)

- Located in `tests/e2e/*.spec.ts`
- Test user journeys and interactions
- Use accessible locators (`getByRole`, `getByText`)
- Include `beforeEach` hooks for navigation setup

## Architecture Patterns

### State Management

The game uses **immutable state transitions**:

```typescript
// State is never mutated—new objects are returned
function makeMove(state: GameState, cellIndex: number): GameState {
  // Return new state object, don't modify existing
  return { ...state, board: newBoard, currentPlayer: nextPlayer };
}
```

### Separation of Concerns

| Layer              | Responsibility          | Side Effects            |
| ------------------ | ----------------------- | ----------------------- |
| `game/logic.ts`    | Pure game rules         | None                    |
| `game/computer.ts` | Computer opponent logic | None (uses Math.random) |
| `game/state.ts`    | State transitions       | None                    |
| `ui/*.ts`          | DOM rendering           | DOM writes              |
| `main.ts`          | App orchestration       | Events, DOM             |

## Branch Strategy & Deployment

This project uses **Cloudflare Pages** with Git integration for automatic deployments.

| Branch      | Purpose      | URL Pattern                               |
| ----------- | ------------ | ----------------------------------------- |
| `release`   | Production   | `gametime-tic-tac-toe.pages.dev`          |
| `main`      | Preview/Beta | `main.gametime-tic-tac-toe.pages.dev`     |
| `feature-*` | Development  | `<branch>.gametime-tic-tac-toe.pages.dev` |

**Workflow:** `feature branch` → `main` (beta testing) → `release` (production)

### Starting New Work (REQUIRED)

**Before ANY feature or task, ALWAYS:**

1. **Sync main to latest:**

   ```bash
   git checkout main && git fetch origin && git pull origin main
   ```

2. **Create feature branch:**

   ```bash
   git checkout -b feature-<descriptive-name>
   ```

3. **Verify branch before changes:**
   ```bash
   git branch --show-current
   ```

### Branch Naming

- `feature-` — New features (`feature-add-score-tracking`)
- `fix-` — Bug fixes (`fix-win-detection`)
- `docs-` — Documentation (`docs-api-reference`)
- `refactor-` — Code improvements (`refactor-state-module`)
- `chore-` — Maintenance (`chore-update-deps`)

### Branch Rules

- **Never commit directly to `main` or `release`**
- Pre-commit hooks enforce this locally
- Feature branches auto-delete after squash merge

### Git Hooks Setup

```bash
git config core.hooksPath .githooks
```

## Security Practices

- No hardcoded secrets or API keys
- Validate all user inputs before processing
- Use localStorage only for non-sensitive preferences (player names)
- Sanitize any data rendered to DOM to prevent XSS

## Performance Guidelines

- Minimize DOM manipulations—batch updates
- Lazy-load resources where beneficial
- Keep bundle size small (target < 50KB)
- Use Vite's tree-shaking capabilities

## What NOT to Do

- ❌ Add runtime dependencies without discussion
- ❌ Use `any` type—always use proper types or `unknown`
- ❌ Commit directly to `main` or `release`
- ❌ Leave `console.log` statements in production code
- ❌ Write tests that depend on implementation details
- ❌ Mutate state objects—always return new copies

## AI Configuration Files

This project uses structured AI configuration to provide consistent guidance.

### Instructions (`.github/instructions/`)

Focused rules auto-applied to specific file patterns via `applyTo`:

| File                          | Purpose                       | ApplyTo                                                         |
| ----------------------------- | ----------------------------- | --------------------------------------------------------------- |
| `typescript.instructions.md`  | Type system, naming, patterns | `**/*.ts`                                                       |
| `testing.instructions.md`     | Unit/E2E test structure       | `tests/**/*.ts, **/*.test.ts, **/*.spec.ts`                     |
| `game-logic.instructions.md`  | Pure functions, state         | `src/game/**/*.ts`                                              |
| `ui.instructions.md`          | DOM, accessibility, CSS       | `src/ui/**/*.ts, src/styles/**/*.css`                           |
| `security.instructions.md`    | XSS, validation, storage      | `**/*.ts, **/*.html`                                            |
| `performance.instructions.md` | Optimization patterns         | `**/*.ts, **/*.css, **/*.html`                                  |
| `tooling.instructions.md`     | Build tools, linters, configs | `*.json, *.config.ts, *.config.js, tsconfig.json, package.json` |
| `ai-config.instructions.md`   | Maintaining these files       | `.github/**/*.md, AGENTS.md`                                    |

### Prompts (`.github/prompts/`)

Reusable task templates invoked via Copilot Chat (`/` command):

| Prompt                     | Mode  | Use When                                                         |
| -------------------------- | ----- | ---------------------------------------------------------------- |
| `start.task.prompt.md`     | Agent | Starting new work (creates branch, understands task)             |
| `review.task.prompt.md`    | Agent | Pre-commit review (quality, security, tests)                     |
| `sync.repo.prompt.md`      | Agent | Syncing local work with `main`/remote and updating branches      |
| `submit.task.prompt.md`    | Agent | Preparing changes for PR/merge (summaries, checklists, metadata) |
| `release.latest.prompt.md` | Agent | Working on the latest release (notes, checks, deployment steps)  |

**Usage:** Common commands: `/start`, `/review`, `/sync`, `/submit`, `/release` in Copilot Chat, or reference via `@workspace /start` (and analogous names).

For additional workflow and spec-related prompts (including `speckit.*.prompt.md`), see the full set in `.github/prompts/`.

### AGENTS.md (repo root)

Quick reference for AI coding agents. Contains:

- Essential commands
- Architecture rules
- Common task workflows
- Explicit prohibitions

### When to Update

| Change                      | Update                    |
| --------------------------- | ------------------------- |
| New directory or npm script | This file + `AGENTS.md`   |
| New code pattern            | Relevant instruction file |
| New workflow                | Create/update prompt      |
| New AI role needed          | Create agent file         |

See `ai-config.instructions.md` for detailed standards on maintaining these files.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
