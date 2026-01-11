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

- Always create feature branches from `main`
- Merge to `main` for beta user testing
- Only merge `main` to `release` for production releases

## Recent Changes

- 001-core-gameplay: Added TypeScript 5.x (strict mode), targeting ES2022 output + None at runtime; Vite (dev/build only)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
