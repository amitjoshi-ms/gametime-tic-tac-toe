# Development Guide

Everything you need to know for local development, testing, and code quality.

## Development Server

### Starting the Server

```bash
npm run dev
```

This starts Vite's development server with:
- **Hot Module Replacement (HMR)**: Changes appear instantly without refresh
- **Source Maps**: Full debugging support in browser DevTools
- **Port**: `5173` (configurable via `--port`)
- **Auto-open**: Browser opens automatically

### Development URLs

| URL | Description |
|-----|-------------|
| `http://localhost:5173` | Main application |
| `http://localhost:5173/__inspect/` | Vite inspector (debug builds) |

### Changing the Port

```bash
npm run dev -- --port 3000
```

## Available Scripts

| Command | Description | When to Use |
|---------|-------------|-------------|
| `npm run dev` | Start dev server | During development |
| `npm run build` | Production build | Before deployment |
| `npm run preview` | Preview production build | Test production locally |
| `npm test` | Run unit tests once | CI/CD, pre-commit |
| `npm run test:watch` | Run tests in watch mode | During development |
| `npm run test:e2e` | Run E2E tests | Before merge |
| `npm run lint` | Check code style | CI/CD, pre-commit |
| `npm run format` | Format code with Prettier | After writing code |
| `npm run typecheck` | Type-check without emit | CI/CD, pre-commit |

## Testing

### Unit Tests (Vitest)

Unit tests focus on pure game logic functions.

**Run all unit tests:**
```bash
npm test
```

**Watch mode (re-runs on file changes):**
```bash
npm run test:watch
```

**Run specific test file:**
```bash
npm test -- tests/unit/logic.test.ts
```

**Run tests matching a pattern:**
```bash
npm test -- -t "checkWin"
```

**With coverage report:**
```bash
npm test -- --coverage
```

#### Test File Structure

```
tests/unit/
├── logic.test.ts       # Win detection, draw detection, validation
├── state.test.ts       # State management, move execution
├── status.test.ts      # Status message generation
└── playerNames.test.ts # Name loading/saving
```

#### Writing Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { checkWin } from '../../src/game/logic';

describe('checkWin', () => {
  it('detects horizontal win', () => {
    const board = ['X', 'X', 'X', null, null, null, null, null, null];
    expect(checkWin(board, 'X')).toBe(true);
  });

  it('returns false when no win', () => {
    const board = ['X', 'O', 'X', null, null, null, null, null, null];
    expect(checkWin(board, 'X')).toBe(false);
  });
});
```

### End-to-End Tests (Playwright)

E2E tests verify complete user flows in real browsers.

**Run all E2E tests:**
```bash
npm run test:e2e
```

**Run with UI mode (interactive):**
```bash
npx playwright test --ui
```

**Run specific test file:**
```bash
npx playwright test tests/e2e/gameplay.spec.ts
```

**Debug mode (step through):**
```bash
npx playwright test --debug
```

**View test report:**
```bash
npx playwright show-report
```

#### E2E Test Structure

```
tests/e2e/
└── gameplay.spec.ts    # Complete game flows
```

#### Writing E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test('can play a complete game', async ({ page }) => {
  await page.goto('/');
  
  // Verify initial state
  await expect(page.locator('.status')).toContainText("Player X's Turn");
  
  // Play moves
  await page.click('[data-index="0"]');
  await expect(page.locator('[data-index="0"]')).toHaveText('X');
  
  // Continue game...
});
```

### Test Configuration

**Vitest** (`vitest.config.ts`):
- Environment: `node`
- Coverage: V8 provider
- Includes: `tests/unit/**/*.test.ts`

**Playwright** (`playwright.config.ts`):
- Browsers: Chromium
- Base URL: `http://localhost:5173`
- Retries: 2 on CI
- Screenshots: On failure only

## Code Quality

### Linting (ESLint)

Enforces code style and catches common errors.

**Check for issues:**
```bash
npm run lint
```

**Auto-fix issues:**
```bash
npm run lint -- --fix
```

#### ESLint Configuration

The project uses ESLint 9 with flat config (`eslint.config.js`):

- **Base**: `@eslint/js` recommended rules
- **TypeScript**: `typescript-eslint` recommended rules
- **Environment**: Browser globals

### Formatting (Prettier)

Consistent code formatting.

**Format all files:**
```bash
npm run format
```

**Check formatting (no changes):**
```bash
npx prettier --check .
```

#### Prettier Configuration

Default Prettier settings with these project overrides (in `package.json` or `.prettierrc`):

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

### Type Checking

Validates TypeScript types without emitting files.

```bash
npm run typecheck
```

This runs `tsc --noEmit` to check types across the entire codebase.

## Build Process

### Production Build

```bash
npm run build
```

**Output**: `dist/` directory containing:
- `index.html` - Entry HTML
- `assets/` - Hashed JS/CSS bundles
- `manifest.json` - PWA manifest
- `sw.js` - Service worker

### Build Optimizations

Vite automatically:
- **Tree-shakes** unused code
- **Minifies** JavaScript and CSS
- **Hashes** filenames for cache busting
- **Generates** source maps (`.map` files)
- **Inlines** small assets as base64

### Preview Production Build

```bash
npm run preview
```

Serves the `dist/` folder at `http://localhost:4173` for testing before deployment.

## IDE Setup

### VS Code Extensions

Recommended extensions for the best experience:

| Extension | Purpose |
|-----------|---------|
| ESLint | Inline linting |
| Prettier | Code formatting |
| TypeScript and JavaScript Language Features (built-in) | TypeScript/JavaScript language support |
| Vitest | Test runner integration |
| Playwright Test | E2E test integration |

### Settings

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Debugging

### Browser DevTools

1. Open DevTools (F12)
2. Go to **Sources** tab
3. Find files under `src/` (source maps enabled)
4. Set breakpoints directly in TypeScript

### VS Code Debugging

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug in Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run", "--reporter=verbose"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Console Logging

For quick debugging:

```typescript
console.log('Current state:', gameState);
console.table(gameState.board); // Nice array formatting
```

## Common Development Tasks

### Adding a New Feature

1. **Create a feature branch**:
   ```bash
   git checkout main && git pull
   git checkout -b feature-my-feature
   ```

2. **Write tests first** (TDD):
   ```bash
   npm run test:watch
   ```

3. **Implement the feature**

4. **Verify all tests pass**:
   ```bash
   npm test && npm run test:e2e
   ```

5. **Check code quality**:
   ```bash
   npm run lint && npm run typecheck
   ```

6. **Commit and push**

### Modifying Game Logic

1. Update types in `src/game/types.ts` (if needed)
2. Update logic in `src/game/logic.ts`
3. Update state management in `src/game/state.ts`
4. Add/update tests in `tests/unit/`
5. Update UI components if needed

### Updating Styles

1. Edit `src/styles/main.css`
2. Use CSS custom properties for theming
3. Test on mobile, tablet, and desktop viewports
4. Verify accessibility (contrast, focus states)

### Adding a New UI Component

1. Create new file in `src/ui/`
2. Export render function following existing patterns
3. Wire up in `src/main.ts`
4. Add E2E test coverage

## Troubleshooting

### Tests Failing Unexpectedly

```bash
# Clear Vitest cache
rm -rf node_modules/.vitest

# Reinstall dependencies
rm -rf node_modules && npm install
```

### TypeScript Errors After Dependency Update

```bash
# Clear TypeScript cache
rm -rf node_modules/.cache

# Restart TS server in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

### Vite Dev Server Issues

```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Kill orphan processes
npx kill-port 5173
```

### Playwright Browser Issues

```bash
# Reinstall browsers
npx playwright install

# Install system dependencies (Linux)
npx playwright install-deps
```

---

**Next**: [Deployment Guide](deployment.md) →
