---
description: TypeScript function patterns, immutability, and error handling
applyTo: '**/*.ts'
---

# TypeScript Patterns

## Function Patterns

### Pure Functions

Write functions without side effects:

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

Always create new arrays instead of mutating:

```typescript
// ✅ Create new arrays
const newBoard = [...state.board];
newBoard[index] = player;

// ❌ Don't mutate
state.board[index] = player;
```

### Object Updates

Use spread operator for immutable updates:

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

Document exported functions with JSDoc:

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

Handle errors with proper type checking:

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



## Best Practices

### Function Size

Keep functions small and focused:

```typescript
// ✅ Small, focused function
function isWinningMove(board: CellValue[], index: number, player: Player): boolean {
  const newBoard = [...board];
  newBoard[index] = player;
  return checkWin(newBoard, player);
}

// ❌ Large function doing too much
function processMove(state: GameState, index: number): GameState {
  // 50+ lines of logic
  // Validation, state updates, win checking, UI updates all mixed together
}
```

### Avoid Premature Abstraction

```typescript
// ✅ Simple, direct implementation
function resetBoard(): CellValue[] {
  return Array(9).fill(null);
}

// ❌ Over-engineered for simple case
function createGrid<T>(size: number, initialValue: T): T[] {
  return Array(size).fill(initialValue);
}
const board = createGrid<CellValue>(9, null);
```

### Composition Over Inheritance

Prefer composition for code reuse:

```typescript
// ✅ Composition with functions
function withLogging<T extends (...args: any[]) => any>(fn: T): T {
  return ((...args: any[]) => {
    console.log(`Calling ${fn.name}`, args);
    return fn(...args);
  }) as T;
}

// ❌ Inheritance for simple behavior extension
class LoggingGame extends Game {
  makeMove(index: number) {
    console.log('Making move', index);
    return super.makeMove(index);
  }
}
```
