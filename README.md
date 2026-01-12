# Tic-Tac-Toe

A modern, offline-capable Tic-Tac-Toe game built as a Progressive Web App with **zero runtime dependencies**.

[![Play Now](https://img.shields.io/badge/Play%20Now-gametime--tic--tac--toe.pages.dev-blue)](https://gametime-tic-tac-toe.pages.dev)

## ✨ Features

- 🎮 Classic two-player gameplay with alternating starting player
- 🤖 **Computer opponent mode** with smart thinking delay
- 📱 Responsive design (mobile, tablet, desktop)
- ✨ Clear turn indicator and congratulations messages
- 🏁 Win & early draw detection
- 👤 Custom player names with localStorage persistence
- 📴 Works offline (PWA)
- ♿ Full keyboard & screen reader support
- ⚡ ~10KB total bundle size

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/amitjoshi-ms/gametime-tic-tac-toe.git
cd gametime-tic-tac-toe
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and start playing!

## 📖 Documentation

| Guide | Description |
|-------|-------------|
| [Getting Started](docs/getting-started.md) | Installation, prerequisites, setup |
| [Architecture](docs/architecture.md) | System design, modules, data flow |
| [API Reference](docs/api-reference.md) | Complete API for all modules |
| [Development](docs/development.md) | Testing, linting, debugging |
| [Deployment](docs/deployment.md) | Cloudflare Pages CI/CD |
| [Contributing](docs/contributing.md) | How to contribute |

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Language | TypeScript 5.x (strict mode) |
| Build | Vite |
| Testing | Vitest + Playwright |
| Hosting | Cloudflare Pages |
| Dependencies | **None** (zero runtime deps!) |

## 📋 Scripts

```bash
npm run dev        # Development server
npm run build      # Production build
npm test           # Unit tests
npm run test:e2e   # E2E tests
npm run lint       # Lint code
npm run typecheck  # Type checking
```

## 📁 Project Structure

```
src/
├── game/           # Core logic (pure functions)
│   ├── types.ts    # Type definitions
│   ├── logic.ts    # Win detection, validation
│   ├── state.ts    # State management
│   └── computer.ts # Computer opponent
├── ui/             # DOM rendering
│   ├── board.ts    # Game board
│   ├── status.ts   # Turn indicator
│   └── modeSelector.ts # Mode selection
└── main.ts         # Entry point
```

## 🎮 How to Play

1. **Choose your opponent**: Select "Human" for 2-player or "Computer" for single-player
2. **Player X** starts first
3. Click any empty cell to place your mark
4. Alternate turns until someone wins or it's a draw
5. Click **New Game** to play again

## 🌐 Deployment

Automatically deployed to Cloudflare Pages:

| Branch | Environment | URL |
|--------|-------------|-----|
| `release` | Production | [gametime-tic-tac-toe.pages.dev](https://gametime-tic-tac-toe.pages.dev) |
| `main` | Preview | [main.gametime-tic-tac-toe.pages.dev](https://main.gametime-tic-tac-toe.pages.dev) |

See [Deployment Guide](docs/deployment.md) for details.

## 🤝 Contributing

Contributions welcome! Please read our [Contributing Guide](docs/contributing.md) first.

```bash
# Create a feature branch
git checkout main && git pull
git checkout -b feature-my-feature

# Make changes, then submit a PR
```

## 📄 License

MIT
