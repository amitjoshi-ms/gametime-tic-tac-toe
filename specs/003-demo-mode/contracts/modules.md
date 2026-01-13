# Module Contracts: Demo Mode

**Feature**: 003-demo-mode
**Date**: January 11, 2026
**Status**: Complete

## Modified Modules

### src/game/types.ts

```typescript
/**
 * Game mode determines opponent behavior.
 * - 'human': Two human players take turns
 * - 'computer': Human (X) vs AI opponent (O)
 * - 'demo': AI vs AI (both players computer-controlled)
 */
export type GameMode = 'human' | 'computer' | 'demo';
```

---

### src/game/playerNames.ts

**New Exports**:

```typescript
/** Default name for Computer X in demo mode */
export const DEFAULT_DEMO_X_NAME = 'Computer X';

/** Default name for Computer O in demo mode */
export const DEFAULT_DEMO_O_NAME = 'Computer O';

/**
 * Gets default player names for demo mode.
 * @returns Player names with computer defaults
 */
export function getDemoPlayerNames(): PlayerNames;
```

---

### src/game/computer.ts

**New Exports**:

```typescript
/** Delay before auto-restart after game ends in demo mode (ms) */
export const DEMO_RESTART_DELAY = 15000;

/**
 * Schedules demo auto-restart after game completion.
 * @param onRestart - Callback invoked when restart timer fires
 * @returns Cleanup function to cancel pending restart
 */
export function scheduleDemoRestart(onRestart: () => void): () => void;
```

**Note**: Reuses existing `COMPUTER_THINKING_DELAY` (2000ms) for move delays.

---

### src/ui/controls.ts

**Modified Exports**:

```typescript
/**
 * Callback signature for demo toggle.
 */
export type DemoToggleHandler = () => void;

/**
 * Renders the control buttons.
 *
 * @param container - DOM element to render into
 * @param onNewGame - Handler for "New Game" button click
 * @param onDemoToggle - Handler for "Start/Stop Demo" button click
 * @param isDemoActive - Whether demo mode is currently active
 */
export function renderControls(
  container: HTMLElement,
  onNewGame: NewGameHandler,
  onDemoToggle: DemoToggleHandler,
  isDemoActive: boolean
): void;

/**
 * Updates control button states.
 *
 * @param container - DOM element containing controls
 * @param isDemoActive - Whether demo mode is currently active
 */
export function updateControls(
  container: HTMLElement,
  isDemoActive: boolean
): void;
```

---

### src/ui/modeSelector.ts

**Modified Exports**:

```typescript
/**
 * Renders the game mode selector.
 *
 * @param container - DOM element to render into
 * @param currentMode - Currently selected game mode
 * @param onChange - Handler for mode changes
 * @param disabled - Whether selector should be disabled (e.g., during demo)
 */
export function renderModeSelector(
  container: HTMLElement,
  currentMode: GameMode,
  onChange: ModeChangeHandler,
  disabled?: boolean
): void;

/**
 * Updates the mode selector display.
 *
 * @param container - DOM element containing selector
 * @param currentMode - Currently selected mode
 * @param disabled - Whether selector should be disabled
 */
export function updateModeSelector(
  container: HTMLElement,
  currentMode: GameMode,
  disabled?: boolean
): void;
```

---

### src/ui/status.ts

**Behavior Change**:

When `gameState.gameMode === 'demo'`:
- Prefix status messages with "(Demo)" or visual indicator
- Show countdown during result display phase (optional enhancement)

No API changes required—behavior determined by `GameState.gameMode`.

---

### src/ui/board.ts

**Behavior Change**:

When `gameState.gameMode === 'demo'`:
- Add CSS class `demo-mode` to board container for styling hooks
- Cells remain interactive (no `disabled` attribute) but clicks ignored at handler level

No API changes required.

---

### src/main.ts

**New Module-Level State**:

```typescript
/** Cancel function for pending demo restart timer */
let cancelRestartTimer: (() => void) | null = null;

/** Previous game mode before demo started (to restore on stop) */
let preDemoMode: GameMode | null = null;
```

**New Functions**:

```typescript
/**
 * Starts demo mode.
 * - Saves current mode for restoration
 * - Resets game with demo mode
 * - Sets demo player names
 * - Schedules first computer move
 */
function startDemo(): void;

/**
 * Stops demo mode.
 * - Cancels pending move and restart timers
 * - Restores previous game mode
 * - Preserves current board state
 */
function stopDemo(): void;

/**
 * Handles demo toggle button click.
 * Starts demo if not active, stops if active.
 */
function handleDemoToggle(): void;

/**
 * Triggers the next computer move in demo mode.
 * Called after each move completes or on demo start.
 */
function triggerDemoMove(): void;

/**
 * Handles demo game completion.
 * Displays result and schedules auto-restart.
 */
function handleDemoGameComplete(): void;
```

---

## Test Contracts

### tests/unit/demo.test.ts

```typescript
describe('Demo Mode State', () => {
  it('should recognize demo mode from GameMode type');
  it('should provide demo player name defaults');
});

describe('scheduleDemoRestart', () => {
  it('should call onRestart after DEMO_RESTART_DELAY');
  it('should be cancellable before firing');
});
```

### tests/e2e/demo.spec.ts

```typescript
describe('Demo Mode', () => {
  it('should start demo when clicking Start Demo button');
  it('should stop demo when clicking Stop Demo button');
  it('should ignore cell clicks during demo');
  it('should auto-restart after game completion');
  it('should use custom player names in demo');
  it('should disable mode selector during demo');
});
```

---

## Dependency Graph

```
types.ts (GameMode extended)
    ↑
    ├── state.ts (uses GameMode)
    ├── playerNames.ts (new demo defaults)
    └── computer.ts (new restart scheduler)
           ↑
           └── main.ts (orchestrates demo lifecycle)
                  ↑
                  ├── ui/controls.ts (demo button)
                  ├── ui/modeSelector.ts (disabled state)
                  ├── ui/status.ts (demo indicator)
                  └── ui/board.ts (demo styling class)
```

**Change Order** (suggested implementation sequence):
1. `types.ts` - Add `'demo'` to GameMode
2. `playerNames.ts` - Add demo name constants
3. `computer.ts` - Add restart scheduler
4. `ui/controls.ts` - Add demo toggle button
5. `ui/modeSelector.ts` - Add disabled state
6. `main.ts` - Wire demo lifecycle
7. `ui/board.ts` - Add demo CSS class
8. `ui/status.ts` - Add demo indicator
9. `main.css` - Demo styling
10. Tests
