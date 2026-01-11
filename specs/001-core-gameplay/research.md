# Research: Core Tic-Tac-Toe Gameplay

**Feature**: 001-core-gameplay  
**Date**: 2026-01-10  
**Purpose**: Resolve technical decisions and document rationale

## Research Tasks Completed

### 1. Framework vs Vanilla TypeScript

**Decision**: Vanilla TypeScript (no framework)

**Rationale**:
- Constitution Principle II mandates minimal dependencies
- User explicitly requested minimum dependencies
- Tic-Tac-Toe UI is simple enough that framework overhead is unjustified
- Vanilla TS compiles to smaller bundles (<10KB vs 30KB+ with React/Vue)
- No component lifecycle complexity needed for this static UI

**Alternatives Considered**:
- React: Rejected—adds ~40KB gzipped, overkill for 9-cell grid
- Vue: Rejected—similar size concern, unnecessary reactivity system
- Preact: Considered—smaller but still adds dependency for no clear benefit
- Lit: Considered—web components are nice but add complexity

### 2. Build Tooling

**Decision**: Vite 6.x

**Rationale**:
- Fastest development server with HMR
- Optimal production builds with tree-shaking
- Native TypeScript support without configuration
- Generates static assets perfect for CDN deployment
- Constitution already specifies Vite in Technology Standards

**Alternatives Considered**:
- esbuild direct: Rejected—lacks HTML handling and dev server conveniences
- Rollup: Rejected—Vite uses Rollup internally with better DX
- Webpack: Rejected—slower, more configuration required

### 3. Offline Support Strategy

**Decision**: Service Worker with Cache-First strategy

**Rationale**:
- User explicitly requested fully offline-capable app
- Service Worker API is well-supported in all target browsers
- Cache-First ensures instant load after first visit
- Vite plugin `vite-plugin-pwa` simplifies SW generation
- Static assets are perfect for aggressive caching

**Implementation Notes**:
- Pre-cache all static assets on install
- Network-first for development, cache-first for production
- No dynamic data to sync—game state is ephemeral

### 4. State Management

**Decision**: Plain TypeScript module with exported functions

**Rationale**:
- Game state is simple: 9-cell array + current player + game status
- No need for Redux, MobX, or other state libraries
- Single module (`game/state.ts`) with pure functions
- Easy to test without mocking frameworks

**State Shape**:
```typescript
type CellValue = 'X' | 'O' | null;
type GameStatus = 'playing' | 'x-wins' | 'o-wins' | 'draw';
interface GameState {
  board: CellValue[]; // 9 elements, index 0-8
  currentPlayer: 'X' | 'O';
  status: GameStatus;
}
```

### 5. CSS Strategy

**Decision**: Plain CSS with Custom Properties (CSS Variables)

**Rationale**:
- Constitution Principle II: no CSS frameworks
- CSS Custom Properties provide theming capability for future customization
- Modern CSS (Grid, Flexbox) handles responsive layout natively
- ~2KB of CSS expected—no need for optimization tooling

**Key Custom Properties**:
- `--color-x`: Player X mark color
- `--color-o`: Player O mark color
- `--color-bg`: Background color
- `--color-line`: Grid line color
- `--cell-size`: Responsive cell sizing

### 6. Testing Strategy

**Decision**: Vitest (unit) + Playwright (E2E)

**Rationale**:
- Constitution specifies these tools in Technology Standards
- Vitest shares Vite config for seamless integration
- Playwright tests real browser behavior for accessibility/responsiveness
- Both support TypeScript natively

**Test Coverage Plan**:
- Unit tests: Game logic (win detection, turn alternation, draw detection)
- E2E tests: Full gameplay flow, turn indicator updates, congratulations display

### 7. localStorage Usage

**Decision**: Reserved for future customization, not required for MVP

**Rationale**:
- User mentioned localStorage for "any customization"
- Core gameplay (spec) does not require persistence
- Will add localStorage hook points for future features (themes, sound preferences)
- No game state persistence in MVP (spec assumption: "game state may be lost")

**Future API Shape** (not implemented in MVP):
```typescript
interface UserPreferences {
  theme?: 'light' | 'dark';
  soundEnabled?: boolean;
}
```

## Resolved Clarifications

| Item | Resolution |
|------|------------|
| Runtime dependencies | Zero—vanilla TypeScript only |
| Build dependencies | Vite + TypeScript + Vitest + Playwright (dev only) |
| Offline support | Service Worker with pre-cached static assets |
| CDN compatibility | Yes—output is pure static files (HTML, JS, CSS, icons) |
| localStorage scope | Reserved for preferences; game state is ephemeral |

## Dependencies Summary

### Runtime (Production Bundle)
- **None** ✅

### Development Only
| Package | Purpose | Justification |
|---------|---------|---------------|
| vite | Build tool | Fast builds, optimal output |
| typescript | Type checking | Constitution requirement |
| vitest | Unit testing | Constitution requirement |
| @playwright/test | E2E testing | Constitution requirement |
| vite-plugin-pwa | Service Worker | Simplifies offline support |
| eslint | Linting | Constitution requirement |
| prettier | Formatting | Constitution requirement |
