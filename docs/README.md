# Tic-Tac-Toe Documentation

Welcome to the documentation for Gametime Tic-Tac-Toe, a Progressive Web App built with TypeScript and zero runtime dependencies.

## 📖 Documentation Index

| Document | Description |
|----------|-------------|
| [Getting Started](getting-started.md) | Installation, prerequisites, and quick start |
| [Architecture](architecture.md) | System design, modules, and data flow |
| [API Reference](api-reference.md) | Complete API documentation for all modules |
| [Development Guide](development.md) | Local development, testing, and tooling |
| [Deployment](deployment.md) | Cloudflare Pages deployment and CI/CD |
| [Contributing](contributing.md) | How to contribute to this project |

## 🎮 Quick Links

- **Play Now**: [gametime-tic-tac-toe.pages.dev](https://gametime-tic-tac-toe.pages.dev)
- **Beta/Preview**: [main.gametime-tic-tac-toe.pages.dev](https://main.gametime-tic-tac-toe.pages.dev)
- **Source Code**: [GitHub Repository](https://github.com/amitjoshi-ms/gametime-tic-tac-toe)

## ✨ Key Features

### Gameplay
- Classic two-player Tic-Tac-Toe gameplay
- **Computer opponent mode** with random move selection
- **2-second thinking delay** for computer moves (natural feel)
- Clear turn indicator showing whose turn it is
- Win detection with congratulations message 🎉
- Early draw detection (detects draws before board is full)
- New Game button to reset and play again
- Alternating starting player for fairness

### User Experience
- Custom player names (saved to localStorage)
- Responsive design for all devices (mobile, tablet, desktop)
- Dark theme gaming aesthetic
- Smooth animations and transitions
- Touch-optimized interactions

### Progressive Web App (PWA)
- Works offline after first visit
- Installable on home screen
- Fast loading (~10KB total bundle)

### Accessibility
- Full keyboard navigation
- Screen reader support with ARIA labels
- Focus indicators for keyboard users
- Respects reduced motion preferences

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Language | TypeScript 5.x (strict mode) |
| Build Tool | Vite |
| Unit Testing | Vitest |
| E2E Testing | Playwright |
| Styling | Pure CSS with custom properties |
| Hosting | Cloudflare Pages |
| Runtime Dependencies | **None** (zero dependencies!) |

## 📁 Project Overview

```
gametime-tic-tac-toe/
├── src/                    # Application source code
│   ├── game/               # Core game logic (pure functions)
│   ├── ui/                 # DOM rendering and interactions
│   ├── utils/              # Shared utilities
│   └── main.ts             # Application entry point
├── public/                 # Static assets (icons, manifest)
├── tests/                  # Unit and E2E tests
├── docs/                   # 📍 You are here
└── specs/                  # Feature specifications
```

## 🎯 How to Play

1. **Choose your mode**: Select "Human" for 2-player or "Computer" to play against AI
2. Player X starts first (alternates each game for fairness)
3. Click/tap an empty cell to place your mark
4. Players alternate turns (X → O → X → ...)
   - In computer mode: Wait ~2 seconds while the computer "thinks"
5. First player to get 3 in a row wins!
6. If no winning moves remain, it's a draw
7. Click "New Game" to play again (keeps current mode)
8. Customize player names by clicking the name fields

---

**Need help?** Check the [Getting Started](getting-started.md) guide or open an issue on GitHub.
