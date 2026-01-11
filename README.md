# Tic-Tac-Toe

A simple, offline-capable Tic-Tac-Toe game built as a Progressive Web App (PWA).

## Features

- 🎮 Classic two-player Tic-Tac-Toe gameplay
- 📱 Responsive design for all devices (mobile, tablet, desktop)
- ✨ Clear turn indicator showing whose turn it is
- 🎉 Win detection with congratulations message
- 🤝 Draw detection when all cells are filled
- 🔄 New Game button to reset and play again
- 📴 Works offline after first visit (PWA)
- ♿ Accessible with keyboard navigation and screen reader support

## Tech Stack

- **Language**: TypeScript 5.x (strict mode)
- **Build Tool**: Vite
- **Testing**: Vitest (unit), Playwright (E2E)
- **Styling**: Pure CSS with custom properties
- **Runtime Dependencies**: None (zero dependencies!)

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm 10.x or later

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd gametime-tic-tac-toe

# Install dependencies
npm install
```

### Development

```bash
# Start development server (opens browser automatically)
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Run TypeScript type checking |

## Project Structure

```
├── src/
│   ├── game/
│   │   ├── types.ts      # TypeScript type definitions
│   │   ├── logic.ts      # Game rules and win detection
│   │   └── state.ts      # Game state management
│   ├── ui/
│   │   ├── board.ts      # Board rendering
│   │   ├── status.ts     # Turn/result display
│   │   └── controls.ts   # New Game button
│   ├── styles/
│   │   └── main.css      # All styles
│   └── main.ts           # Application entry point
├── public/
│   ├── manifest.json     # PWA manifest
│   └── icons/            # App icons
├── tests/
│   ├── unit/             # Unit tests
│   └── e2e/              # End-to-end tests
└── index.html            # HTML entry point
```

## How to Play

1. Player X always goes first
2. Click/tap an empty cell to place your mark
3. Players alternate turns (X → O → X → ...)
4. First player to get 3 in a row (horizontal, vertical, or diagonal) wins!
5. If all 9 cells are filled with no winner, it's a draw
6. Click "New Game" to play again

## Deployment

The build output (`dist/` folder) contains pure static files that can be deployed to any static hosting service:

- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any CDN

## License

MIT
