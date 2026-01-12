---
description: 'Game logic development standards for pure functions'
applyTo: 'src/game/**/*.ts'
---

# Game Logic Development Standards

## Architecture Principles

The `src/game/` directory contains **pure functions** with no side effects:

| File | Responsibility | Side Effects |
|------|----------------|--------------|
| `types.ts` | Domain type definitions | None |
| `logic.ts` | Game rules (win detection, validation) | None |
| `state.ts` | State transitions | None |
| `computer.ts` | Computer opponent move selection | None (uses Math.random) |
| `playerNames.ts` | Name persistence helpers | localStorage only |

## Pure Function Requirements

### No DOM Access

```typescript
// ❌ Never in game logic
document.getElementById('status');
window.localStorage.getItem('key');

// ✅ Pass data in, return data out
export function checkWin(board: CellValue[], player: Player): boolean {
  return WINNING_LINES.some(/* ... */);
}
```

### No External State Mutation

```typescript
// ❌ Don't mutate input
function makeMove(state: GameState, index: number): GameState {
  state.board[index] = state.currentPlayer; // Mutates input!
  return state;
}

// ✅ Return new objects
function makeMove(state: GameState, index: number): GameState {
  const newBoard = [...state.board];
  newBoard[index] = state.currentPlayer;
  return { ...state, board: newBoard };
}
```

### Deterministic Output

Same inputs must always produce same outputs:

```typescript
// ✅ Deterministic
export function determineStatus(board: CellValue[], lastPlayer: Player): GameStatus {
  if (checkWin(board, lastPlayer)) {
    return lastPlayer === 'X' ? 'x-wins' : 'o-wins';
  }
  if (isBoardFull(board)) {
    return 'draw';
  }
  return 'playing';
}
```

## Type Definitions (`types.ts`)

### Use Discriminated Unions

```typescript
export type CellValue = 'X' | 'O' | null;
export type Player = 'X' | 'O';
export type GameStatus = 'playing' | 'x-wins' | 'o-wins' | 'draw';
export type GameMode = 'human' | 'computer';
```

### Document Invariants

```typescript
/**
 * Complete game state at any point in time.
 *
 * Invariants:
 * - board always has exactly 9 elements
 * - If status !== 'playing', no more moves are accepted
 * - Number of X marks >= number of O marks (X always goes first)
 * - isComputerThinking can only be true when gameMode === 'computer' and currentPlayer === 'O'
 */
export interface GameState {
  board: CellValue[];
  currentPlayer: Player;
  status: GameStatus;
  playerNames: PlayerNames;
  gameMode: GameMode;
  isComputerThinking: boolean;
}
```

## Game Rules (`logic.ts`)

### Export Constants for Magic Numbers

```typescript
// Define the type for a winning line
type WinningLine = [number, number, number];

// ✅ Named constant with documentation
/**
 * All 8 possible winning combinations.
 * Board index mapping:
 * ```
 * 0 | 1 | 2
 * ---------
 * 3 | 4 | 5
 * ---------
 * 6 | 7 | 8
 * ```
 */
export const WINNING_LINES: WinningLine[] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6],            // Diagonals
];
```

### Validation Functions

```typescript
/**
 * Checks if a move is valid.
 * @param state - Current game state
 * @param cellIndex - Target cell (0-8)
 * @returns true if move is allowed
 */
export function isValidMove(state: GameState, cellIndex: number): boolean {
  // Game must be in progress
  if (state.status !== 'playing') {
    return false;
  }
  // Cell must be empty
  if (state.board[cellIndex] !== null) {
    return false;
  }
  // Index must be valid
  if (cellIndex < 0 || cellIndex > 8) {
    return false;
  }
  return true;
}
```

## State Transitions (`state.ts`)

### Single Entry Point for State Changes

```typescript
/**
 * Processes a move and returns the new game state.
 * Returns the same state object if move is invalid.
 *
 * @param state - Current state
 * @param cellIndex - Target cell (0-8)
 * @returns New state (or same state if invalid move)
 */
export function makeMove(state: GameState, cellIndex: number): GameState {
  if (!isValidMove(state, cellIndex)) {
    return state; // Return unchanged for invalid moves
  }
  
  // Create new board with move
  const newBoard = [...state.board];
  newBoard[cellIndex] = state.currentPlayer;
  
  // Determine new status
  const newStatus = determineStatus(newBoard, state.currentPlayer);
  
  return {
    ...state,
    board: newBoard,
    currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
    status: newStatus,
  };
}
```

### Factory Functions for Initial State

```typescript
/**
 * Creates a fresh game state.
 * Loads player names from localStorage if available.
 */
export function resetGame(): GameState {
  return {
    board: Array.from({ length: 9 }, () => null),
    currentPlayer: 'X',
    status: 'playing',
    playerNames: loadPlayerNames(),
  };
}
```

## Testing Game Logic

All game logic should have comprehensive unit tests:

```typescript
describe('makeMove', () => {
  it('should place mark and switch player', () => {
    const initial = resetGame();
    const afterMove = makeMove(initial, 0);
    
    expect(afterMove.board[0]).toBe('X');
    expect(afterMove.currentPlayer).toBe('O');
    expect(afterMove).not.toBe(initial); // New object
    expect(initial.board[0]).toBe(null); // Original not mutated
  });

  it('should detect win after winning move', () => {
    const almostWon: GameState = {
      board: ['X', 'X', null, 'O', 'O', null, null, null, null],
      currentPlayer: 'X',
      status: 'playing',
      playerNames: { X: 'X', O: 'O' },
      gameMode: 'human',
      isComputerThinking: false,
    };
    
    const afterWin = makeMove(almostWon, 2);
    expect(afterWin.status).toBe('x-wins');
  });
});
```
