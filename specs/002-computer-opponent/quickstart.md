# Quickstart: Computer Opponent Feature

**Feature**: 002-computer-opponent  
**Date**: January 11, 2026  
**Purpose**: Get developers up to speed on implementing this feature

## Overview

This feature adds single-player mode where the human plays against a computer opponent. The computer selects random moves with a 2-second thinking delay.

## Prerequisites

- Node.js 18+ installed
- Repository cloned and on `002-computer-opponent` branch
- Dependencies installed (`npm install`)

## Quick Setup

```bash
# Verify you're on the right branch
git branch --show-current  # Should show: 002-computer-opponent

# Install dependencies (if not done)
npm install

# Start dev server
npm run dev
```

## Key Files to Modify

| Priority | File | Changes |
|----------|------|---------|
| 1 | `src/game/types.ts` | Add `GameMode` type, extend `GameState` |
| 2 | `src/game/computer.ts` | **NEW** - Computer move logic |
| 3 | `src/game/state.ts` | Add mode/thinking state functions |
| 4 | `src/ui/modeSelector.ts` | **NEW** - Mode toggle component |
| 5 | `src/ui/status.ts` | Add "thinking" message |
| 6 | `src/ui/board.ts` | Disable during thinking |
| 7 | `src/main.ts` | Wire up mode selection + computer turns |
| 8 | `src/styles/main.css` | Add mode selector + thinking styles |

## Implementation Order

### Phase 1: Types & State (Foundation)

1. **Add types** in `types.ts`:
   ```typescript
   export type GameMode = 'human' | 'computer';
   // Extend GameState with gameMode, isComputerThinking
   ```

2. **Add state functions** in `state.ts`:
   - `createInitialStateWithMode()`
   - `setGameMode()`
   - `setComputerThinking()`
   - `isComputerTurn()`

### Phase 2: Computer Logic (Core)

3. **Create `computer.ts`**:
   - `getAvailableCells(board)` - finds empty cells
   - `selectRandomCell(available)` - random selection
   - `scheduleComputerMove(board, callback)` - timer with cleanup

### Phase 3: UI Components

4. **Create `modeSelector.ts`**:
   - Radio buttons styled as toggle
   - Calls `onChange(mode)` when switched

5. **Update `status.ts`**:
   - Check `isComputerThinking` → show "Computer is thinking..."

6. **Update `board.ts`**:
   - Add `board--thinking` class when thinking
   - Disable cells during thinking

### Phase 4: Integration

7. **Update `main.ts`**:
   - Render mode selector
   - Handle mode changes
   - Orchestrate computer turns after human moves
   - Cancel pending moves on reset

8. **Add CSS** in `main.css`:
   - Mode selector styles
   - Thinking animation

## Testing Strategy

### Unit Tests First
```bash
npm test -- --watch tests/unit/computer.test.ts
```

Test these scenarios:
- `getAvailableCells` returns correct indices
- `selectRandomCell` picks from array
- Timer cleanup works

### E2E Tests
```bash
npm run test:e2e -- computer.spec.ts
```

Test full flows:
- Mode selection works
- Computer moves after human
- Win/loss/draw detection
- Mode persists on reload

## Common Patterns

### Timer with Cleanup
```typescript
let timerId: number | null = null;

function startThinking(callback: () => void) {
  timerId = window.setTimeout(callback, 2000);
}

function cancelThinking() {
  if (timerId !== null) {
    clearTimeout(timerId);
    timerId = null;
  }
}
```

### State Update Flow
```typescript
// After human move
if (isComputerTurn(gameState)) {
  gameState = setComputerThinking(gameState, true);
  updateUI();
  
  cancelFn = scheduleComputerMove(gameState.board, (cellIndex) => {
    gameState = setComputerThinking(gameState, false);
    gameState = makeMove(gameState, cellIndex);
    updateUI();
  });
}
```

### CSS Thinking State
```css
.board--thinking {
  pointer-events: none;
  opacity: 0.8;
}

.status--thinking::after {
  content: '...';
  animation: pulse 1.5s infinite;
}
```

## Gotchas & Tips

1. **Timer Cleanup**: Always cancel pending computer move when:
   - User clicks "New Game"
   - User switches mode
   - Page unloads

2. **State Immutability**: All state updates return new objects:
   ```typescript
   // ✅ Correct
   return { ...state, isComputerThinking: true };
   
   // ❌ Wrong
   state.isComputerThinking = true;
   return state;
   ```

3. **Mode Persistence**: Save mode to localStorage so it survives page reload

4. **Player Names**: In computer mode, default O name to "Computer" but allow editing

5. **Responsive**: Mode selector needs touch-friendly sizing (44px min)

## Verification Checklist

Before marking complete:

- [ ] Can switch between Human and Computer modes
- [ ] Computer moves 2 seconds after human
- [ ] "Thinking..." message shows during delay
- [ ] Board is disabled during computer thinking
- [ ] Win/loss/draw works correctly
- [ ] "New Game" cancels pending computer move
- [ ] Mode persists after page reload
- [ ] Computer name is editable
- [ ] Works on mobile (responsive)
- [ ] All tests pass

## Related Documents

- [spec.md](spec.md) - Feature requirements
- [data-model.md](data-model.md) - Type definitions
- [contracts/modules.md](contracts/modules.md) - Function signatures
- [research.md](research.md) - Technical decisions
