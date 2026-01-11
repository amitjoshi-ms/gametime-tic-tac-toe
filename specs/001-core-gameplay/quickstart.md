# Quickstart: Core Tic-Tac-Toe Gameplay

**Feature**: 001-core-gameplay  
**Date**: 2026-01-10

## Prerequisites

- Node.js 20.x or later
- npm 10.x or later
- Modern browser (Chrome, Firefox, Safari, or Edge)

## Setup

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd gametime-tic-tac-toe

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port).

## Project Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run unit tests with Vitest |
| `npm run test:e2e` | Run E2E tests with Playwright |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Run TypeScript type checking |

## Development Workflow

1. **Make changes** in `src/`
2. **View live** at `http://localhost:5173` (auto-reloads)
3. **Run tests** with `npm run test`
4. **Build** with `npm run build`

## Project Structure

```
src/
├── main.ts           # App entry point
├── game/
│   ├── types.ts      # TypeScript types
│   ├── state.ts      # Game state management
│   └── logic.ts      # Win/draw detection
├── ui/
│   ├── board.ts      # Board rendering
│   ├── status.ts     # Turn/result display
│   └── controls.ts   # New Game button
└── styles/
    └── main.css      # All styles
```

## Key Files to Understand

1. **[game/types.ts](../../src/game/types.ts)** - Start here to understand data structures
2. **[game/logic.ts](../../src/game/logic.ts)** - Pure functions for game rules
3. **[game/state.ts](../../src/game/state.ts)** - State management
4. **[main.ts](../../src/main.ts)** - Application orchestration

## Testing

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run E2E tests (requires build first)
npm run build
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e -- --ui
```

## Building for Production

```bash
# Create optimized build
npm run build

# Preview the build locally
npm run preview

# Deploy contents of dist/ to any static hosting
```

The `dist/` folder contains:
- `index.html` - Entry point
- `assets/` - Hashed JS and CSS bundles
- `manifest.json` - PWA manifest
- `sw.js` - Service worker for offline support

## Offline Support

The app works fully offline after first visit:
1. Service Worker caches all static assets
2. No network requests needed for gameplay
3. Works as installable PWA on supported devices

## Deployment

The build output is pure static files compatible with any hosting:
- **CDN**: Upload `dist/` contents to any CDN
- **GitHub Pages**: Push `dist/` to `gh-pages` branch
- **Netlify/Vercel**: Connect repo, build command: `npm run build`, publish: `dist`
- **S3 + CloudFront**: Upload to S3, configure CloudFront distribution

## Troubleshooting

### Port already in use
```bash
npm run dev -- --port 3000  # Use different port
```

### TypeScript errors
```bash
npm run typecheck  # See all type errors
```

### Tests failing
```bash
npm run test -- --reporter=verbose  # Detailed output
```

### Service Worker not updating
Clear browser cache or use incognito mode during development.
