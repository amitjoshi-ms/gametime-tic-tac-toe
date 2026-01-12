# Module Contracts: Computer Opponent

**Feature**: 002-computer-opponent  
**Date**: January 11, 2026  
**Purpose**: Define module interfaces and function signatures

## New Modules

### src/game/computer.ts

Computer opponent move selection and timing logic.

```typescript
/**
 * Computer opponent logic module.
 * Handles random move selection and thinking delay.
 * 
 * @module game/computer
 */

import type { CellValue } from './types';

/** Thinking delay in milliseconds */
export const COMPUTER_THINKING_DELAY = 2000;

/**
 * Gets indices of all empty cells on the board.
 * 
 * @param board - Current board state (9 elements)
 * @returns Array of indices (0-8) where cell is null
 * 
 * @example
 * getAvailableCells(['X', null, 'O', null, ...]) // [1, 3, ...]
 */
export function getAvailableCells(board: CellValue[]): number[];

/**
 * Selects a random cell from available positions.
 * Uses uniform distribution - all positions equally likely.
 * 
 * @param available - Array of available cell indices
 * @returns Selected cell index
 * @throws Error if available array is empty
 * 
 * @example
 * selectRandomCell([1, 3, 5, 7]) // Returns one of: 1, 3, 5, or 7
 */
export function selectRandomCell(available: number[]): number;

/**
 * Schedules a computer move after the thinking delay.
 * Returns a cleanup function to cancel the pending move.
 * 
 * @param board - Current board state
 * @param onMove - Callback invoked with selected cell index
 * @returns Cleanup function to cancel pending move
 * 
 * @example
 * const cancel = scheduleComputerMove(board, (cellIndex) => {
 *   makeMove(state, cellIndex);
 * });
 * // Later, if game reset:
 * cancel();
 */
export function scheduleComputerMove(
  board: CellValue[],
  onMove: (cellIndex: number) => void
): () => void;

/**
 * Immediately selects a computer move without delay.
 * Useful for testing or instant-play mode.
 * 
 * @param board - Current board state
 * @returns Selected cell index, or -1 if no moves available
 */
export function selectComputerMove(board: CellValue[]): number;
```

### src/ui/modeSelector.ts

Game mode selection UI component.

```typescript
/**
 * Game mode selector UI component.
 * Renders toggle between human and computer opponent modes.
 * 
 * @module ui/modeSelector
 */

import type { GameMode } from '../game/types';

/**
 * Callback signature for mode changes.
 */
export type ModeChangeHandler = (mode: GameMode) => void;

/**
 * Renders the game mode selector.
 * Creates radio button group styled as toggle buttons.
 * 
 * @param container - DOM element to render into
 * @param currentMode - Currently selected mode
 * @param onChange - Handler for mode changes
 * @param disabled - Whether selector should be disabled (during game)
 * 
 * @example
 * renderModeSelector(container, 'human', (mode) => {
 *   gameState = setGameMode(gameState, mode);
 * });
 */
export function renderModeSelector(
  container: HTMLElement,
  currentMode: GameMode,
  onChange: ModeChangeHandler,
  disabled?: boolean
): void;

/**
 * Updates mode selector state without full re-render.
 * 
 * @param container - DOM element containing the mode selector
 * @param currentMode - Currently selected mode
 * @param disabled - Whether selector should be disabled
 */
export function updateModeSelector(
  container: HTMLElement,
  currentMode: GameMode,
  disabled?: boolean
): void;
```

## Extended Modules

### src/game/types.ts (Extensions)

```typescript
// NEW TYPES

/**
 * Game mode determines opponent behavior.
 * - 'human': Two human players take turns
 * - 'computer': Human vs AI opponent
 */
export type GameMode = 'human' | 'computer';

// EXTENDED INTERFACES

/**
 * Complete game state at any point in time.
 * Extended with game mode and computer thinking state.
 */
export interface GameState {
  // Existing (unchanged)
  board: CellValue[];
  currentPlayer: Player;
  status: GameStatus;
  playerNames: PlayerNames;
  
  // New fields
  /** Current game mode */
  gameMode: GameMode;
  /** True while computer is "thinking" (during delay) */
  isComputerThinking: boolean;
}
```

### src/game/state.ts (Extensions)

```typescript
// NEW EXPORTS

/**
 * Creates initial state with specified game mode.
 * 
 * @param mode - Game mode to start with
 * @param playerNames - Optional custom player names
 * @returns Initial game state with mode set
 */
export function createInitialStateWithMode(
  mode: GameMode,
  playerNames?: PlayerNames
): GameState;

/**
 * Sets the game mode, optionally resetting the game.
 * 
 * @param state - Current game state
 * @param mode - New game mode
 * @param resetGame - Whether to reset board (default: true if game in progress)
 * @returns New game state with mode updated
 */
export function setGameMode(
  state: GameState,
  mode: GameMode,
  resetGame?: boolean
): GameState;

/**
 * Sets the computer thinking state.
 * 
 * @param state - Current game state
 * @param isThinking - Whether computer is thinking
 * @returns New game state with thinking state updated
 */
export function setComputerThinking(
  state: GameState,
  isThinking: boolean
): GameState;

/**
 * Checks if it's currently the computer's turn.
 * 
 * @param state - Current game state
 * @returns True if computer should move
 */
export function isComputerTurn(state: GameState): boolean;
```

### src/game/playerNames.ts (Extensions)

```typescript
// NEW EXPORTS

/** Default name for computer opponent */
export const DEFAULT_COMPUTER_NAME = 'Computer';

/**
 * Gets default player names for specified mode.
 * 
 * @param mode - Game mode
 * @returns Default names appropriate for mode
 */
export function getDefaultNamesForMode(mode: GameMode): PlayerNames;

/**
 * Loads player names, applying mode-specific defaults.
 * 
 * @param mode - Current game mode
 * @returns Player names from storage or mode-appropriate defaults
 */
export function loadPlayerNamesForMode(mode: GameMode): PlayerNames;
```

### src/ui/status.ts (Extensions)

```typescript
// MODIFIED FUNCTION

/**
 * Gets the display message for current game state.
 * Extended to handle computer thinking state.
 * 
 * @param state - Current game state
 * @returns Human-readable status message
 * 
 * New behavior:
 * - When isComputerThinking: returns "{computerName} is thinking..."
 */
export function getStatusMessage(state: GameState): string;

// Note: getStatusClass may need 'status--thinking' variant
```

### src/ui/board.ts (Extensions)

```typescript
// MODIFIED BEHAVIOR

/**
 * Renders the game board to the DOM.
 * Extended to handle computer thinking state.
 * 
 * New behavior:
 * - When state.isComputerThinking: adds 'board--thinking' class
 * - Disables all cells during thinking state
 */
export function renderBoard(
  container: HTMLElement,
  state: GameState,
  onCellClick: CellClickHandler
): void;

/**
 * Updates the board display without full re-render.
 * Extended to handle thinking state.
 */
export function updateBoard(
  container: HTMLElement,
  state: GameState
): void;
```

### src/main.ts (Extensions)

```typescript
// NEW HANDLERS

/**
 * Handles game mode changes.
 * Resets game when mode changes.
 */
function handleModeChange(mode: GameMode): void;

/**
 * Triggers computer move when it's computer's turn.
 * Called after human move in computer mode.
 */
function triggerComputerTurn(): void;

/**
 * Handles computer move completion.
 * Called after thinking delay.
 */
function handleComputerMove(cellIndex: number): void;

// MODIFIED INITIALIZATION

/**
 * Initializes the application.
 * Extended to:
 * - Render mode selector
 * - Load saved game mode
 * - Set up computer turn orchestration
 */
function initApp(): void;
```

## CSS Contracts

### src/styles/main.css (Additions)

```css
/* Mode Selector */
.mode-selector { }
.mode-selector__option { }
.mode-selector__option--selected { }
.mode-selector__option:disabled { }

/* Board Thinking State */
.board--thinking { }
.board--thinking .cell { }

/* Status Thinking State */
.status--thinking { }
.status--thinking::after { }  /* Animated dots */
```

## Event Flow Contract

```
User clicks "vs Computer"
    │
    ▼
handleModeChange('computer')
    │
    ├─► setGameMode(state, 'computer')
    ├─► saveGameMode('computer')
    └─► updateUI()

Human makes move (X)
    │
    ▼
handleCellClick(index)
    │
    ├─► makeMove(state, index)
    ├─► updateUI()
    │
    └─► isComputerTurn(state)?
            │
            Yes ──► triggerComputerTurn()
                        │
                        ├─► setComputerThinking(state, true)
                        ├─► updateUI() // Shows "thinking..."
                        │
                        └─► scheduleComputerMove(board, callback)
                                │
                                │ (2 seconds later)
                                ▼
                            handleComputerMove(cellIndex)
                                │
                                ├─► setComputerThinking(state, false)
                                ├─► makeMove(state, cellIndex)
                                └─► updateUI()

User clicks "New Game" (during thinking)
    │
    ▼
handleNewGame()
    │
    ├─► cancelPendingComputerMove() // Clear timeout
    ├─► resetGame()
    └─► updateUI()
```

## Test Contracts

### Unit Tests (tests/unit/computer.test.ts)

```typescript
describe('getAvailableCells', () => {
  it('returns all indices for empty board');
  it('returns empty array for full board');
  it('returns only null cell indices');
});

describe('selectRandomCell', () => {
  it('returns value from available array');
  it('throws on empty array');
  it('has uniform distribution over many calls');
});

describe('scheduleComputerMove', () => {
  it('calls onMove after delay');
  it('cleanup function cancels pending move');
  it('selects valid cell');
});
```

### E2E Tests (tests/e2e/computer.spec.ts)

```typescript
describe('Computer Opponent Mode', () => {
  it('can select vs Computer mode');
  it('computer moves automatically after human');
  it('shows thinking indicator during delay');
  it('blocks board interaction during thinking');
  it('detects computer win');
  it('detects human win');
  it('handles draw');
  it('persists mode across page reload');
  it('allows editing computer name');
});
```
