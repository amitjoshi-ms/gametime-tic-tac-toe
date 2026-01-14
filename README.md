# Tic-Tac-Toe

A modern Tic-Tac-Toe game built as a static Single Page Application with **zero runtime dependencies**.

[![Play Now](https://img.shields.io/badge/Play%20Now-gametime--tic--tac--toe.pages.dev-blue)](https://gametime-tic-tac-toe.pages.dev)

## ✨ Features

- 🎮 Classic two-player gameplay with alternating starting player
- 🤖 Computer opponent with random move selection
- � **Remote multiplayer** - play with friends via peer-to-peer WebRTC
- 🎯 Toggle between human vs human, human vs computer, and remote modes
- 📱 Responsive design (mobile, tablet, desktop)
- ✨ Clear turn indicator and congratulations messages
- 🏁 Win & early draw detection
- 👤 Custom player names with localStorage persistence
- ♿ Full keyboard & screen reader support
- ⚡ ~33KB total bundle size (no runtime dependencies!)

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
npm run preview    # Preview production build
npm test           # Unit tests
npm run test:watch # Unit tests (watch mode)
npm run test:e2e   # E2E tests
npm run lint       # Lint code
npm run format     # Format code with Prettier
npm run typecheck  # Type checking
```

## 📁 Project Structure

```
src/
├── game/           # Core logic (pure functions)
│   ├── types.ts    # Type definitions
│   ├── logic.ts    # Win detection, validation
│   ├── state.ts    # State management
│   ├── computer.ts # Computer opponent
│   ├── remote.ts   # Remote multiplayer logic
│   └── playerNames.ts # Player name persistence
├── network/        # WebRTC & P2P networking
│   ├── peer.ts     # RTCPeerConnection wrapper
│   ├── protocol.ts # Message serialization
│   └── signaling.ts # SDP encoding/decoding
├── ui/             # DOM rendering
│   ├── board.ts    # Game board
│   ├── status.ts   # Turn indicator
│   ├── controls.ts # Game controls
│   ├── modeSelector.ts # Mode toggle
│   ├── remotePanel.ts  # Remote session UI
│   └── playerNames.ts # Name inputs
├── utils/          # Shared utilities
│   └── storage.ts  # localStorage helpers
└── main.ts         # Entry point
```

## 🎮 How to Play

### Local Modes

1. **Choose your mode**: Human vs Human or Human vs Computer
2. **Player X** starts first
3. Click any empty cell to place your mark
4. In computer mode, the computer (O) plays automatically after a brief delay
5. Alternate turns until someone wins or it's a draw
6. Click **New Game** to play again

### Remote Multiplayer

Play with a friend on different devices using peer-to-peer WebRTC:

1. **Host**: Select "Remote" mode and click "Create Game"
2. **Host**: Copy the session code and share with your friend
3. **Guest**: Select "Remote" mode, click "Join Game", paste the code
4. **Guest**: Copy the response code and share back with host
5. **Host**: Paste the response code to connect
6. **Play!** Host plays as X, Guest plays as O
7. After game ends, either player can request a rematch

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
