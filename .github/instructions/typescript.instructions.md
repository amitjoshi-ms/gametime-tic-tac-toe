---
description: 'TypeScript development standards for this project'
applyTo: '**/*.ts, **/*.tsx'
---

# TypeScript Development Standards

## Core Principles

- **Strict mode is enabled**—honor all strict checks
- Target ES2022 output with pure ES modules
- Never use CommonJS (`require`, `module.exports`)
- No runtime dependencies—keep bundle minimal

## Type System Rules

### Avoid `any`

```typescript
// ❌ Never do this
function process(data: any): any {
  return data.value;
}

// ✅ Use proper types or unknown + narrowing
function process(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return String((data as { value: unknown }).value);
  }
  throw new Error('Invalid data');
}
```

### Use Discriminated Unions for State

```typescript
// ✅ Good: Clear state discrimination
type GameStatus = 'playing' | 'x-wins' | 'o-wins' | 'draw';

interface GameState {
  status: GameStatus;
  board: CellValue[];
  currentPlayer: Player;
}
```

### Define Types in Dedicated Files

- Domain types belong in `src/game/types.ts`
- Export only what's needed by other modules
- Use JSDoc comments for complex types

## Naming Conventions

| Category | Convention | Example |
|----------|------------|---------|
| Types/Interfaces | PascalCase | `GameState`, `PlayerNames` |
| Functions | camelCase | `handleCellClick`, `makeMove` |
| Variables | camelCase | `gameState`, `currentPlayer` |
| Constants | UPPER_SNAKE_CASE | `WINNING_LINES` |
| Files | kebab-case | `game-logic.ts`, `player-names.ts` |

## Function Patterns

### Pure Functions for Logic

```typescript
// ✅ Pure function: no side effects, deterministic
export function checkWin(board: CellValue[], player: Player): boolean {
  return WINNING_LINES.some(([a, b, c]) =>
    board[a] === player && board[b] === player && board[c] === player
  );
}
```

### Immutable State Updates

```typescript
// ✅ Return new object, never mutate
function makeMove(state: GameState, cellIndex: number): GameState {
  const newBoard = [...state.board];
  newBoard[cellIndex] = state.currentPlayer;
  
  return {
    ...state,
    board: newBoard,
    currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
  };
}
```

## Documentation

```typescript
/**
 * Checks if the given player has won.
 *
 * @param board - Current board state (9 elements)
 * @param player - Player to check ('X' or 'O')
 * @returns true if player has 3 in a row
 */
export function checkWin(board: CellValue[], player: Player): boolean {
  // Implementation
}
```

## Imports

- Use relative imports for local modules
- Group imports: external → internal → types
- Prefer named exports over default exports

```typescript
// ✅ Good import structure
import { describe, it, expect } from 'vitest';

import { checkWin, isBoardFull } from '../../src/game/logic';
import type { CellValue, GameState } from '../../src/game/types';
```

## Error Handling

- Use explicit error types when possible
- Prefer early returns for validation
- Don't catch errors just to rethrow them

```typescript
// ✅ Early return pattern
function makeMove(state: GameState, cellIndex: number): GameState {
  if (state.status !== 'playing') {
    return state; // Game already over
  }
  if (state.board[cellIndex] !== null) {
    return state; // Cell already occupied
  }
  // Process valid move...
}
```
