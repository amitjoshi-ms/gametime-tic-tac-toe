---
description: TypeScript coding standards and conventions
applyTo: '**/*.ts'
---

# TypeScript Development Standards

## Type System

### Strict Mode Rules

**Strict mode is enabled**—follow these rules without exception:

```typescript
// ❌ Never use `any`
function process(data: any) {
  return data.value;
}

// ✅ Use `unknown` with type narrowing
function process(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    const obj = data as { value: unknown };
    if (typeof obj.value === 'string') {
      return obj.value;
    }
  }
  throw new Error('Invalid data structure');
}
```

### Type Definitions

Define domain types in `src/game/types.ts`:

```typescript
// ✅ Discriminated unions for state
export type CellValue = 'X' | 'O' | null;
export type Player = 'X' | 'O';
export type GameStatus = 'playing' | 'x-wins' | 'o-wins' | 'draw';
export type GameMode = 'human' | 'computer';

// ✅ Interfaces for complex structures
export interface GameState {
  board: CellValue[];
  currentPlayer: Player;
  status: GameStatus;
  playerNames: PlayerNames;
  gameMode: GameMode;
  isComputerThinking: boolean;
}
```

### Utility Types

Use TypeScript utility types to express intent:

```typescript
// ✅ Readonly for immutable data
type ReadonlyGameState = Readonly<GameState>;

// ✅ Partial for optional updates
type GameStateUpdate = Partial<GameState>;

// ✅ Record for key-value maps
type PlayerScores = Record<Player, number>;

// ✅ Pick/Omit for derived types
type PlayerInfo = Pick<GameState, 'currentPlayer' | 'playerNames'>;
```

## Module System

### ES Modules Only

```typescript
// ✅ Use ES module syntax
import { GameState } from './types';
export function resetGame(): GameState { /* ... */ }

// ❌ Never use CommonJS
const { GameState } = require('./types');
module.exports = { resetGame };
```

### Import Organization

```typescript
// ✅ Group and order imports
// 1. Type-only imports
import type { GameState, Player } from './types';

// 2. Value imports from same module
import { resetGame, makeMove } from './state';

// 3. Side-effect imports (rare)
import './styles.css';
```

## Naming Conventions

### Files and Directories

```text
✅ camelCase for files
src/game/playerNames.ts
src/ui/modeSelector.ts

❌ Not PascalCase or kebab-case for TypeScript files
src/game/PlayerNames.ts
src/ui/mode-selector.ts
```

### Types and Interfaces

```typescript
// ✅ PascalCase, no prefixes
interface GameState { /* ... */ }
type CellValue = 'X' | 'O' | null;

// ❌ Don't use Hungarian notation
interface IGameState { /* ... */ }
type TCellValue = 'X' | 'O' | null;
```

### Variables and Functions

```typescript
// ✅ camelCase
const gameState = resetGame();
function handleCellClick(index: number): void { /* ... */ }

// ✅ UPPER_SNAKE_CASE for constants
const WINNING_LINES: number[][] = [[0, 1, 2], /* ... */];
```

## Function Patterns

### Pure Functions

```typescript
// ✅ Pure function - no side effects
export function checkWin(board: CellValue[], player: Player): boolean {
  return WINNING_LINES.some(line => 
    line.every(index => board[index] === player)
  );
}

// ❌ Impure - has side effects
let winCount = 0;
export function checkWin(board: CellValue[], player: Player): boolean {
  const won = WINNING_LINES.some(line => 
    line.every(index => board[index] === player)
  );
  if (won) winCount++; // Side effect!
  return won;
}
```

### Type Guards

```typescript
// ✅ Use type guards for narrowing
function isPlayer(value: unknown): value is Player {
  return value === 'X' || value === 'O';
}

function handleInput(input: unknown): void {
  if (isPlayer(input)) {
    // input is narrowed to Player type here
    console.log(`Current player: ${input}`);
  }
}
```

### Return Types

```typescript
// ✅ Explicit return types for exported functions
export function makeMove(state: GameState, index: number): GameState {
  // Implementation
}

// ⚠️ Can omit for simple, obvious returns
function add(a: number, b: number) {
  return a + b; // Obviously returns number
}
```

## Immutability

### Array Operations

```typescript
// ✅ Create new arrays
const newBoard = [...state.board];
newBoard[index] = player;

// ❌ Don't mutate
state.board[index] = player;
```

### Object Updates

```typescript
// ✅ Spread operator for shallow copies
const newState = { ...state, status: 'x-wins' };

// ✅ Nested updates
const newState = {
  ...state,
  playerNames: { ...state.playerNames, X: 'Alice' }
};

// ❌ Don't mutate
state.status = 'x-wins';
```

## Documentation

### JSDoc Comments

```typescript
/**
 * Checks if a player has won the game.
 * @param board - Current board state (9 cells)
 * @param player - Player to check ('X' or 'O')
 * @returns true if player has three in a row
 */
export function checkWin(board: CellValue[], player: Player): boolean {
  return WINNING_LINES.some(line => 
    line.every(index => board[index] === player)
  );
}
```

### Module Documentation

```typescript
/**
 * @module game/logic
 * Core game rules and validation logic.
 * All functions are pure with no side effects.
 */
```

## Error Handling

### Type-Safe Errors

```typescript
// ✅ Typed error handling
function parseMove(input: unknown): number {
  if (typeof input !== 'number') {
    throw new TypeError('Move must be a number');
  }
  if (input < 0 || input > 8) {
    throw new RangeError('Move must be between 0 and 8');
  }
  return input;
}

// ✅ Catch and narrow errors
try {
  const move = parseMove(input);
} catch (error) {
  if (error instanceof TypeError) {
    console.error('Type error:', error.message);
  } else if (error instanceof RangeError) {
    console.error('Range error:', error.message);
  } else {
    throw error; // Re-throw unknown errors
  }
}
```

## Anti-Patterns

### Avoid Type Assertions Without Validation

```typescript
// ❌ Unsafe type assertion
const data = JSON.parse(input) as GameState;

// ✅ Validate after parsing
function isValidGameState(obj: unknown): obj is GameState {
  // Validation logic
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'board' in obj &&
    'currentPlayer' in obj
    // ... more checks
  );
}

const parsed = JSON.parse(input);
if (isValidGameState(parsed)) {
  const state: GameState = parsed;
}
```

### Avoid Optional Chaining Overuse

```typescript
// ❌ Overusing optional chaining hides issues
const winner = game?.state?.status?.winner?.name;

// ✅ Explicit null checks show intent
if (game && game.state.status === 'x-wins') {
  const winner = game.state.playerNames.X;
}
```

### Avoid Unnecessary Type Complexity

```typescript
// ❌ Overly complex types
type Move<T extends Player, B extends CellValue[]> = 
  T extends 'X' ? B[number] extends 'X' ? never : number : number;

// ✅ Simple, clear types
type Move = number; // Cell index 0-8
```
