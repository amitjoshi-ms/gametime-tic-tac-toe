# Data Model: Demo Mode

**Feature**: 003-demo-mode
**Date**: January 11, 2026
**Status**: Complete

## Entity Changes

### Modified: GameMode (src/game/types.ts)

**Current Definition**:
```typescript
export type GameMode = 'human' | 'computer';
```

**New Definition**:
```typescript
export type GameMode = 'human' | 'computer' | 'demo';
```

**Rationale**: Demo mode is a distinct game mode where both players are computers. Extending the union type integrates naturally with existing mode-based logic.

---

### Modified: GameState (src/game/types.ts)

**Current Definition**: No changes to structure needed.

**Behavior Change**: When `gameMode === 'demo'`:
- Both players (X and O) are computer-controlled
- `isComputerThinking` applies to whichever computer's turn it is
- Cell clicks are ignored
- Auto-restart timer runs after game completion

---

### New: Demo Timer Constants (src/game/computer.ts)

| Constant | Value | Description |
|----------|-------|-------------|
| `DEMO_MOVE_DELAY` | 2000ms | Delay before each computer move in demo mode |
| `DEMO_RESTART_DELAY` | 15000ms | Delay after game ends before auto-restart |

**Note**: `DEMO_MOVE_DELAY` can reuse existing `COMPUTER_THINKING_DELAY` (already 2000ms).

---

### New: Default Demo Names (src/game/playerNames.ts)

| Constant | Value | Description |
|----------|-------|-------------|
| `DEFAULT_DEMO_X_NAME` | "Computer X" | Default name for X in demo mode |
| `DEFAULT_DEMO_O_NAME` | "Computer O" | Default name for O in demo mode |

---

## Module-Level State (src/main.ts)

### New Variables

| Variable | Type | Description |
|----------|------|-------------|
| `cancelRestartTimer` | `(() => void) \| null` | Cancels the 15-second auto-restart timer |
| `demoModeActive` | `boolean` | Redundant with `gameMode === 'demo'`, but useful for quick checks |

**Note**: Could track demo state entirely via `gameState.gameMode`, but explicit flag aids readability.

---

## State Transitions

### Demo Mode Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                      IDLE (gameMode !== 'demo')             │
│  - User can click cells (human/computer mode)               │
│  - User can edit player names                               │
│  - "Start Demo" button visible                              │
└────────────────────────┬────────────────────────────────────┘
                         │ User clicks "Start Demo"
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    DEMO ACTIVE (gameMode === 'demo')        │
│  - Game resets to empty board                               │
│  - Computer X scheduled to move (2s delay)                  │
│  - "Stop Demo" button visible                               │
│  - Cell clicks ignored                                      │
│  - Mode selector disabled                                   │
└────────────────────────┬────────────────────────────────────┘
                         │ Game completes (win/draw)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 DEMO RESULT DISPLAY                         │
│  - Final result shown in status                             │
│  - 15-second countdown starts                               │
│  - "Stop Demo" still visible                                │
└────────────────────────┬────────────────────────────────────┘
                         │ 15 seconds elapsed
                         ▼
                    (Loop back to DEMO ACTIVE - new game)

At any point in DEMO ACTIVE or DEMO RESULT DISPLAY:
  User clicks "Stop Demo" → Cancel timers → Return to IDLE
```

---

## Validation Rules

| Rule | Enforcement |
|------|-------------|
| Demo mode ignores cell clicks | Check in `handleCellClick` |
| Demo mode disables mode selector | UI renders disabled state |
| Timers cancelled on stop | `clearTimeout` called for all active timers |
| Names persist across demo cycles | Use existing `savePlayerNames` |

---

## Storage

No new storage keys. Demo mode uses existing:
- `game_mode`: Will store `'demo'` when active (or revert to previous on stop)
- `player_names`: Stores custom computer names

**Decision**: Do NOT persist demo mode. On page reload, return to previous mode (human/computer). Rationale: Demo is transient session state, not a preference.
