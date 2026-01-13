---
description: TypeScript type system and naming conventions
applyTo: '**/*.ts'
---

# TypeScript Type System

## Strict Mode Rules

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

## Type Definitions

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

## Utility Types

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

## Type Guards

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
