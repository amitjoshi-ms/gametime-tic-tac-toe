# Module Contracts: Core Tic-Tac-Toe Gameplay

**Feature**: 001-core-gameplay  
**Date**: 2026-01-10  
**Purpose**: Define interfaces between internal modules

## Overview

This is a frontend-only application with no external APIs. These contracts define the interfaces between internal TypeScript modules to ensure clear boundaries and testability.

---

## game/types.ts

Type definitions shared across all modules.

```typescript
/** Possible values for a cell on the board */
export type CellValue = 'X' | 'O' | null;

/** The two players */
export type Player = 'X' | 'O';

/** Possible game outcomes */
export type GameStatus = 'playing' | 'x-wins' | 'o-wins' | 'draw';

/** Complete game state */
export interface GameState {
  /** 9-element array representing the 3x3 board */
  board: CellValue[];
  /** Which player moves next */
  currentPlayer: Player;
  /** Current game status */
  status: GameStatus;
}

/** Indices for a winning line */
export type WinningLine = [number, number, number];
```

---

## game/state.ts

Game state management - the single source of truth.

```typescript
import { GameState, CellValue, Player } from './types';

/**
 * Creates a fresh game state with empty board, X to play.
 * @returns Initial game state
 */
export function createInitialState(): GameState;

/**
 * Attempts to place a mark at the given cell index.
 * Returns new state if valid, or same state if invalid move.
 * 
 * @param state - Current game state
 * @param cellIndex - Index 0-8 of the cell to mark
 * @returns New game state (immutable update)
 * 
 * @example
 * const newState = makeMove(state, 4); // Place mark in center
 */
export function makeMove(state: GameState, cellIndex: number): GameState;

/**
 * Resets the game to initial state.
 * @returns Fresh initial game state
 */
export function resetGame(): GameState;
```

---

## game/logic.ts

Pure functions for game rules and win detection.

```typescript
import { CellValue, GameStatus, WinningLine } from './types';

/** All 8 possible winning combinations */
export const WINNING_LINES: WinningLine[];

/**
 * Checks if the given player has won.
 * 
 * @param board - Current board state (9 elements)
 * @param player - Player to check ('X' or 'O')
 * @returns true if player has 3 in a row
 */
export function checkWin(board: CellValue[], player: 'X' | 'O'): boolean;

/**
 * Checks if the board is completely filled.
 * 
 * @param board - Current board state
 * @returns true if all 9 cells are occupied
 */
export function isBoardFull(board: CellValue[]): boolean;

/**
 * Determines the game status after a move.
 * 
 * @param board - Current board state
 * @param lastPlayer - The player who just moved
 * @returns Updated game status
 */
export function determineStatus(board: CellValue[], lastPlayer: 'X' | 'O'): GameStatus;

/**
 * Checks if a move is valid.
 * 
 * @param board - Current board state
 * @param cellIndex - Index to check
 * @param status - Current game status
 * @returns true if the cell is empty and game is in progress
 */
export function isValidMove(board: CellValue[], cellIndex: number, status: GameStatus): boolean;
```

---

## ui/board.ts

Board rendering and interaction handling.

```typescript
import { GameState } from '../game/types';

/**
 * Callback signature for cell click events.
 * @param cellIndex - Index 0-8 of the clicked cell
 */
export type CellClickHandler = (cellIndex: number) => void;

/**
 * Renders the game board to the DOM.
 * 
 * @param container - DOM element to render into
 * @param state - Current game state
 * @param onCellClick - Handler for cell clicks
 */
export function renderBoard(
  container: HTMLElement,
  state: GameState,
  onCellClick: CellClickHandler
): void;

/**
 * Updates the board display without full re-render.
 * 
 * @param state - Current game state
 */
export function updateBoard(state: GameState): void;
```

---

## ui/status.ts

Turn indicator and result message display.

```typescript
import { GameState } from '../game/types';

/**
 * Renders the status display (turn indicator or result).
 * 
 * @param container - DOM element to render into
 * @param state - Current game state
 */
export function renderStatus(container: HTMLElement, state: GameState): void;

/**
 * Gets the display message for current game state.
 * 
 * @param state - Current game state
 * @returns Human-readable status message
 * 
 * @example
 * getStatusMessage({ status: 'playing', currentPlayer: 'X', ... })
 * // Returns: "Player X's Turn"
 * 
 * getStatusMessage({ status: 'x-wins', ... })
 * // Returns: "🎉 Player X Wins!"
 */
export function getStatusMessage(state: GameState): string;
```

---

## ui/controls.ts

Game control buttons.

```typescript
/**
 * Callback signature for new game button.
 */
export type NewGameHandler = () => void;

/**
 * Renders the control buttons.
 * 
 * @param container - DOM element to render into
 * @param onNewGame - Handler for "New Game" button click
 */
export function renderControls(
  container: HTMLElement,
  onNewGame: NewGameHandler
): void;
```

---

## main.ts

Application entry point and orchestration.

```typescript
/**
 * Initializes the application.
 * - Sets up DOM structure
 * - Creates initial game state
 * - Wires up event handlers
 * - Registers service worker
 */
export function initApp(): void;
```

---

## Dependency Graph

```
main.ts
├── game/state.ts
│   ├── game/types.ts
│   └── game/logic.ts
│       └── game/types.ts
├── ui/board.ts
│   └── game/types.ts
├── ui/status.ts
│   └── game/types.ts
└── ui/controls.ts
```

**Rules**:
- `game/*` modules have no UI dependencies
- `ui/*` modules depend only on `game/types.ts` (not logic or state)
- Only `main.ts` orchestrates all modules together
