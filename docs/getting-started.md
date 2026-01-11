# Getting Started

This guide will help you get the Tic-Tac-Toe game running on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Minimum Version | Check Command |
|-------------|-----------------|---------------|
| Node.js | 20.x | `node --version` |
| npm | 10.x | `npm --version` |
| Git | 2.x | `git --version` |

> **Tip**: We recommend using [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager) to manage Node.js versions.

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd gametime-tic-tac-toe
```

### 2. Install Dependencies

```bash
npm install
```

This installs all development dependencies. There are **zero runtime dependencies**!

### 3. Configure Git Hooks

Set up the pre-commit hook to prevent accidental commits to protected branches:

```bash
git config core.hooksPath .githooks
```

## Quick Start

### Start Development Server

```bash
npm run dev
```

The app opens automatically at [http://localhost:5173](http://localhost:5173) with hot module replacement (HMR) enabled.

### Build for Production

```bash
npm run build
```

Output is generated in the `dist/` folder as static files ready for deployment.

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally at [http://localhost:4173](http://localhost:4173).

## Verifying Your Setup

Run the test suite to ensure everything is working:

```bash
# Run unit tests
npm test

# Run end-to-end tests
npm run test:e2e

# Check for linting errors
npm run lint

# Type-check the codebase
npm run typecheck
```

All tests should pass. If you encounter issues, see [Troubleshooting](#troubleshooting).

## Project Structure Overview

```
gametime-tic-tac-toe/
├── src/                    # Source code
│   ├── game/               # Game logic (pure functions)
│   │   ├── types.ts        # TypeScript type definitions
│   │   ├── logic.ts        # Win detection, move validation
│   │   ├── state.ts        # State management
│   │   └── playerNames.ts  # Player name persistence
│   ├── ui/                 # UI components
│   │   ├── board.ts        # Game board rendering
│   │   ├── status.ts       # Turn/result display
│   │   ├── controls.ts     # New Game button
│   │   └── playerNames.ts  # Name input fields
│   ├── utils/
│   │   └── storage.ts      # localStorage utilities
│   ├── styles/
│   │   └── main.css        # All styles
│   └── main.ts             # Entry point
├── public/                 # Static assets
│   ├── manifest.json       # PWA manifest
│   └── icons/              # App icons
├── tests/                  # Test files
│   ├── unit/               # Vitest unit tests
│   └── e2e/                # Playwright E2E tests
├── docs/                   # Documentation
├── specs/                  # Feature specifications
└── dist/                   # Build output (gitignored)
```

## Next Steps

- **Learn the architecture**: Read the [Architecture Guide](architecture.md)
- **Explore the API**: Check the [API Reference](api-reference.md)
- **Set up development**: See the [Development Guide](development.md)
- **Deploy your changes**: Follow the [Deployment Guide](deployment.md)

## Troubleshooting

### Common Issues

#### "Cannot find module" errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Port 5173 already in use

```bash
# Kill the process using the port
npx kill-port 5173

# Or specify a different port
npm run dev -- --port 3000
```

#### Playwright tests failing

```bash
# Install browser binaries
npx playwright install

# Or install system dependencies (Linux)
npx playwright install-deps
```

#### Git hook errors

If you see errors about git hooks:

```bash
# Ensure hooks are configured
git config core.hooksPath .githooks

# Make hooks executable (Unix/Mac)
chmod +x .githooks/*
```

### Getting Help

- Check the [GitHub Issues](https://github.com/amitjoshi-ms/gametime-tic-tac-toe/issues) for known problems
- Open a new issue with detailed reproduction steps
- Include your environment info: `node --version`, `npm --version`, OS

---

**Next**: [Architecture Guide](architecture.md) →
