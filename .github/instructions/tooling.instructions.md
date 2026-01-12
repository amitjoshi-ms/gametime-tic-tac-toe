---
description: 'Configuration file standards for JSON and JS/TS config files'
applyTo: '*.json, *.config.ts, *.config.js, tsconfig.json, package.json'
---

# Configuration Files Standards

## Overview

This project uses several configuration files for tooling. Changes to these files affect the entire project.

## File Categories

| File                   | Purpose               | Format     | Edit Frequency |
| ---------------------- | --------------------- | ---------- | -------------- |
| `package.json`         | Dependencies, scripts | JSON       | Moderate       |
| `tsconfig.json`        | TypeScript compiler   | JSONC      | Rare           |
| `vite.config.ts`       | Build tooling         | TypeScript | Rare           |
| `vitest.config.ts`     | Unit test runner      | TypeScript | Rare           |
| `playwright.config.ts` | E2E test runner       | TypeScript | Rare           |
| `eslint.config.js`     | Linting rules         | JavaScript | Rare           |
| `public/manifest.json` | Web app manifest      | JSON       | Rare           |
| `public/_headers`      | Cloudflare cache rules| Text       | Rare           |

## package.json

### Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint src tests",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit"
  }
}
```

**Rules:**

- Keep script names short and conventional
- `build` must run `tsc` before `vite build`
- Test commands should use `run` for CI (not watch mode)

### Dependencies

**Rules:**

- ❌ No runtime dependencies (zero-dependency project)
- ✅ All dependencies go in `devDependencies`
- Use exact versions or `^` for minor updates
- Run `npm audit` after adding dependencies

```jsonc
// ❌ Wrong - runtime dependency
{
  "dependencies": {
    "lodash": "^4.17.21"
  }
}

// ✅ Correct - dev dependency only
{
  "devDependencies": {
    "typescript": "^5.9.3"
  }
}
```

## tsconfig.json

### Critical Settings (Do Not Change)

```jsonc
{
  "compilerOptions": {
    "target": "ES2022", // Browser compatibility
    "module": "ESNext", // ES modules only
    "strict": true, // Required - no exceptions
    "noEmit": true, // Vite handles emit
    "noUncheckedIndexedAccess": true, // Array safety
  },
}
```

**Rules:**

- Never disable `strict` mode
- Keep `noUncheckedIndexedAccess: true` for array safety
- Don't add `"any"` escape hatches like `noImplicitAny: false`

### Path Aliases

```jsonc
{
  "paths": {
    "@/*": ["src/*"],
  },
}
```

Must match alias in `vite.config.ts` and `vitest.config.ts`.

## vite.config.ts

### Structure

```typescript
export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
});
```

**Rules:**

- Keep `sourcemap: true` for debugging
- Sync `alias` with tsconfig paths
- Don't add plugins that introduce runtime dependencies (maintain zero runtime dependencies)

## vitest.config.ts

### Structure

```typescript
export default defineConfig({
  test: {
    environment: 'node', // Pure logic doesn't need DOM
    include: ['tests/unit/**/*.test.ts'],
  },
});
```

**Rules:**

- Use `node` environment (game logic is pure)
- Keep path alias in sync with tsconfig

### Coverage Configuration

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/main.ts', 'src/**/*.d.ts'], // Exclude orchestration-only entrypoints
    },
  },
  resolve: {
    alias: { '@': resolve(__dirname, 'src') }, // Must match tsconfig.json
  },
});
```

**Rules:**

- You may exclude orchestration-only entrypoints (for example, `src/main.ts`)
- Do not exclude core game logic files (e.g., `src/game/**/*.ts`)
- Always exclude type definition files (`*.d.ts`) from coverage

## playwright.config.ts

### Structure

```typescript
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:5173',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
  },
});
```

**Rules:**

- Port 5173 is Vite default—keep consistent
- Use `webServer` to auto-start dev server
- Only test Chromium locally (add browsers in CI if needed)

## eslint.config.js

### Structure

```javascript
export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
  { ignores: ['dist/', 'node_modules/', '*.config.*'] }
);
```

**Rules:**

- Use `strictTypeChecked` preset (matches tsconfig strict)
- Allow `_` prefix for intentionally unused params
- Ignore config files to avoid circular issues

## manifest.json

### Required Fields

```jsonc
{
  "name": "Tic-Tac-Toe",
  "short_name": "TicTacToe",
  "start_url": "/",
  "display": "standalone",
  "icons": [
    /* SVG icons */
  ],
}
```

**Rules:**

- Keep `short_name` under 12 characters
- Use SVG icons (scalable, small file size)
- `display: standalone` for app-like experience

## _headers (Cloudflare Pages)

### Structure

```
# HTML - always revalidate (ensures fresh asset references)
/
  Cache-Control: no-cache, must-revalidate

/index.html
  Cache-Control: no-cache, must-revalidate

# Vite hashed assets - cache forever (hash changes on content change)
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# Static assets - cache with revalidation
/icons/*
  Cache-Control: public, max-age=86400

/manifest.json
  Cache-Control: public, max-age=3600
```

**Rules:**

- HTML files should use `no-cache, must-revalidate` for fresh asset references
- Hashed assets (in `/assets/*`) can use `immutable` with long max-age
- Static assets should have reasonable cache durations with revalidation
- File must be placed in `public/` directory to be deployed with site

## Common Mistakes

- Editing generated or vendor files instead of the primary config (e.g., changing `node_modules` contents instead of `package.json` or tool configs).
- Introducing invalid JSON syntax in `package.json` or `manifest.json` (trailing commas, comments, or single quotes). Remember: only JSONC examples in this doc support comments, not actual config files.
- Letting `tsconfig.json` and tooling configs (ESLint, Vite, Vitest, Playwright) drift out of sync—for example, adding a new `src/` subfolder in `tsconfig.json` but forgetting to update related tool config if it uses explicit paths.
- Renaming or removing npm scripts in `package.json` without updating CI, documentation, or local dev instructions that depend on those script names.
- Ignoring config-specific `ignores`/`include` patterns (e.g., failing to exclude `dist/` or `node_modules/`), which can slow down tooling or cause spurious lint/test results.
