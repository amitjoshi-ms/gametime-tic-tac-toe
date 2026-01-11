# gametime-tic-tac-toe Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-10

## Active Technologies

- TypeScript 5.x (strict mode), targeting ES2022 output + None at runtime; Vite (dev/build only) (001-core-gameplay)

## Project Structure

```text
src/
public/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript 5.x (strict mode), targeting ES2022 output: Follow standard conventions

## Branch Strategy & Deployment

This project uses **Cloudflare Pages** with Git integration for automatic deployments.

| Branch | Purpose | URL Pattern |
|--------|---------|-------------|
| `release` | Production | `gametime-tic-tac-toe.pages.dev` |
| `main` | Preview/Beta | `main.gametime-tic-tac-toe.pages.dev` |
| `feature-*` | Development | `<branch>.gametime-tic-tac-toe.pages.dev` |

**Workflow**: `feature branch` → `main` (beta testing) → `release` (production)

### Starting New Work (REQUIRED)

**Before starting any new feature or task, ALWAYS:**

1. **Sync main to latest remote state**:
   ```bash
   git checkout main
   git fetch origin
   git pull origin main
   ```

2. **Create a feature branch from updated main**:
   ```bash
   git checkout -b feature-<name>
   ```
   - Use descriptive branch names: `feature-add-score-tracking`, `fix-win-detection`, `docs-api-reference`

3. **Verify you're on the feature branch** before making changes:
   ```bash
   git branch --show-current
   ```

### Branch Rules

- Always create feature branches from `main`
- Never commit directly to `main` or `release`
- Merge to `main` for beta user testing
- Only merge `main` to `release` for production releases
- Feature branches are **automatically deleted** after squash merge via GitHub

### Git Hooks (Local Enforcement)

This repo uses a pre-commit hook to prevent direct commits to `main` and `release`.

**Setup (required after cloning):**
```bash
git config core.hooksPath .githooks
```

The hook will block commits with a helpful error message if you accidentally try to commit on a protected branch.

## Recent Changes

- 001-core-gameplay: Added TypeScript 5.x (strict mode), targeting ES2022 output + None at runtime; Vite (dev/build only)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
