---
description: Start new work with proper branch setup and task understanding
mode: agent
instructions:
  - typescript.instructions.md
  - game-logic.instructions.md
  - testing.instructions.md
  - ui.instructions.md
---

# Start New Work

Set up a feature branch and understand the task before making changes.

## Step 1: Branch Setup

### Verify Git Hooks
```bash
git config core.hooksPath
```
- Should return `.githooks`
- If not: `git config core.hooksPath .githooks`

### Sync and Create Branch
```bash
git stash                              # If uncommitted changes
git checkout main
git fetch origin && git pull origin main
git checkout -b <prefix>-<name>        # e.g., feature-add-score
git stash pop                          # If stashed
```

### Branch Prefixes

| Prefix | Purpose |
|--------|---------|
| `feature-` | New features |
| `fix-` | Bug fixes |
| `refactor-` | Code restructuring |
| `docs-` | Documentation |
| `chore-` | Maintenance |

## Step 2: Understand the Task

### For Features
1. What types need defining? → `src/game/types.ts`
2. What logic is needed? → `src/game/logic.ts` (pure functions)
3. What state changes? → `src/game/state.ts` (immutable)
4. What UI changes? → `src/ui/*.ts` (callback-based)
5. What tests are needed? → `tests/unit/` and `tests/e2e/`

### For Bug Fixes
| Symptom | Check Location |
|---------|----------------|
| Wrong win/draw | `src/game/logic.ts` |
| State issues | `src/game/state.ts` |
| UI not updating | `src/ui/*.ts` |
| Click not working | `src/main.ts` |

### For Refactoring
- Verify tests exist before changing code
- Make small incremental changes
- Run `npm test` after each change

## Step 3: Verify Setup

```bash
git branch --show-current   # Confirm on feature branch
npm run typecheck           # Types OK
npm run lint               # Linting OK
npm test                   # Tests pass
```

## Architecture Quick Reference

```
src/game/     → Pure functions (no DOM, no side effects)
src/ui/       → DOM manipulation (uses callbacks)
src/main.ts   → Orchestration (wires everything together)
tests/unit/   → Vitest unit tests
tests/e2e/    → Playwright E2E tests
```

## User Request

{{input}}
