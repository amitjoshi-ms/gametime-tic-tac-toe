# Quickstart: Demo Mode

**Feature**: 003-demo-mode
**Date**: January 11, 2026

## Overview

Demo mode enables computer-vs-computer gameplay for demonstration purposes. Users watch two AI players compete with natural timing delays (2 seconds between moves). Games auto-restart after 15 seconds, creating continuous entertainment. Users can customize computer names and stop the demo at any time.

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Demo Mode** | A game mode where both X and O are computer-controlled |
| **Move Delay** | 2-second pause before each computer move for natural pacing |
| **Auto-Restart** | 15-second countdown after game ends, then new game begins |
| **Toggle Button** | Single button switches between "Start Demo" and "Stop Demo" |

## Quick Implementation Guide

### 1. Extend GameMode Type

```typescript
// src/game/types.ts
export type GameMode = 'human' | 'computer' | 'demo';
```

### 2. Add Demo Constants

```typescript
// src/game/playerNames.ts
export const DEFAULT_DEMO_X_NAME = 'Computer X';
export const DEFAULT_DEMO_O_NAME = 'Computer O';

// src/game/computer.ts
export const DEMO_RESTART_DELAY = 15000;
```

### 3. Add Demo Button

```typescript
// src/ui/controls.ts
// Add second button alongside "New Game"
const demoBtn = document.createElement('button');
demoBtn.className = 'btn btn-demo';
demoBtn.textContent = isDemoActive ? 'Stop Demo' : 'Start Demo';
```

### 4. Demo Lifecycle in main.ts

```typescript
function startDemo(): void {
  // 1. Save current mode
  preDemoMode = gameState.gameMode;
  
  // 2. Cancel any pending computer move from previous mode
  if (cancelPendingMove) {
    cancelPendingMove();
    cancelPendingMove = null;
  }
  
  // 3. Get the current player names from state (which reflects form inputs)
  const currentNames = gameState.playerNames;
  
  // 4. Reset game with demo mode
  gameState = resetGame('demo');
  
  // 5. Use the current player names (user-entered names) for the demo
  gameState = {
    ...gameState,
    playerNames: currentNames,
  };
  
  // 6. Update UI
  updateUI();
  
  // 7. Schedule first move
  triggerDemoMove();
}

function stopDemo(): void {
  // 1. Cancel all timers
  if (cancelPendingMove) cancelPendingMove();
  if (cancelRestartTimer) cancelRestartTimer();
  
  // 2. Restore previous mode (keep board state)
  gameState = { ...gameState, gameMode: preDemoMode ?? 'human' };
  
  // 3. Update UI
  updateUI();
}
```

### 5. Block Cell Clicks

```typescript
function handleCellClick(cellIndex: number): void {
  // Ignore clicks in demo mode
  if (gameState.gameMode === 'demo') return;
  
  // ... existing logic
}
```

## Testing Commands

```bash
# Run unit tests for demo logic
npm test -- demo.test.ts

# Run E2E tests for demo mode
npx playwright test demo.spec.ts

# Run all tests
npm test && npm run test:e2e
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/game/types.ts` | Add `'demo'` to `GameMode` union |
| `src/game/playerNames.ts` | Add demo name constants |
| `src/game/computer.ts` | Add `scheduleDemoRestart` function |
| `src/ui/controls.ts` | Add demo toggle button |
| `src/ui/modeSelector.ts` | Add disabled state support |
| `src/main.ts` | Add demo lifecycle functions |
| `src/styles/main.css` | Add demo mode styling |

## Files to Create

| File | Purpose |
|------|---------|
| `tests/unit/demo.test.ts` | Unit tests for demo state logic |
| `tests/e2e/demo.spec.ts` | E2E tests for demo user flows |

## Acceptance Checklist

- [ ] "Start Demo" button visible in controls
- [ ] Clicking "Start Demo" begins computer-vs-computer play
- [ ] Button changes to "Stop Demo" when active
- [ ] Moves occur with 2-second delay
- [ ] Cell clicks ignored during demo
- [ ] Mode selector disabled during demo
- [ ] Game auto-restarts 15 seconds after completion
- [ ] "Stop Demo" immediately halts demo at any point
- [ ] Custom player names work in demo mode
- [ ] Status shows demo indicator
