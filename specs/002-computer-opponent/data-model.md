# Data Model: Computer Opponent

**Feature**: 002-computer-opponent  
**Date**: January 11, 2026  
**Purpose**: Define entities, types, and state structures

## Type Extensions

### GameMode (New)

Represents the current play configuration.

```typescript
/**
 * Game mode determines how the second player (O) behaves.
 * - 'human': Traditional two-player game
 * - 'computer': Single-player vs AI opponent
 */
type GameMode = 'human' | 'computer';
```

**Validation Rules**:
- Must be one of the two literal values
- Persisted to localStorage for session continuity
- Default: 'human' (backward compatible)

### GameState (Extended)

Extends existing GameState with mode and thinking state.

```typescript
interface GameState {
  // Existing fields (unchanged)
  board: CellValue[];           // 9-element array
  currentPlayer: Player;        // 'X' | 'O'
  status: GameStatus;           // 'playing' | 'x-wins' | 'o-wins' | 'draw'
  playerNames: PlayerNames;     // { X: string, O: string }
  
  // New fields for computer opponent
  gameMode: GameMode;           // 'human' | 'computer'
  isComputerThinking: boolean;  // true during 2-second delay
}
```

**State Transitions**:

```
┌─────────────────────────────────────────────────────────────┐
│                    GameState Transitions                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Mode Selection]                                           │
│       │                                                     │
│       ▼                                                     │
│  gameMode: 'human' ◄──────► gameMode: 'computer'           │
│       │                           │                         │
│       ▼                           ▼                         │
│  [Human X Turn]              [Human X Turn]                 │
│       │                           │                         │
│       ▼                           ▼                         │
│  [Human O Turn]              isComputerThinking: true       │
│       │                           │ (2 second delay)        │
│       │                           ▼                         │
│       │                      isComputerThinking: false      │
│       │                      [Computer O moves]             │
│       │                           │                         │
│       ▼                           ▼                         │
│  [Check Win/Draw] ◄───────── [Check Win/Draw]              │
│       │                           │                         │
│       ▼                           ▼                         │
│  status: 'playing' ───────► Continue game loop             │
│  status: 'x-wins'/'o-wins'/'draw' ──► Game Over            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Invariants**:
- `isComputerThinking` can only be `true` when:
  - `gameMode === 'computer'`
  - `currentPlayer === 'O'`
  - `status === 'playing'`
- When `isComputerThinking === true`, no moves can be accepted
- `gameMode` persists across game resets (Play Again maintains mode)

### ComputerMoveResult (New)

Result type for computer move selection.

```typescript
interface ComputerMoveResult {
  cellIndex: number;  // 0-8, the selected position
}
```

**Validation Rules**:
- `cellIndex` must be in range [0, 8]
- Selected cell must be empty (null) in current board

## Entity Relationships

```
┌─────────────────┐
│    GameMode     │
│  'human' |      │
│  'computer'     │
└────────┬────────┘
         │ determines behavior of
         ▼
┌─────────────────┐     contains      ┌─────────────────┐
│   GameState     │◄─────────────────►│   PlayerNames   │
│                 │                    │  X: string      │
│  board[]        │                    │  O: string      │
│  currentPlayer  │                    │  (editable)     │
│  status         │                    └─────────────────┘
│  gameMode       │
│  isThinking     │
└────────┬────────┘
         │ when computer mode
         ▼
┌─────────────────┐
│ ComputerPlayer  │
│  (logic only)   │
│                 │
│  selectMove()   │
│  with delay     │
└─────────────────┘
```

## Storage Schema

### localStorage Keys

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `player_names` | `PlayerNames` | `{X: "Player X", O: "Player O"}` | Existing - unchanged |
| `game_mode` | `GameMode` | `'human'` | NEW - persists selected mode |

**Migration**: No migration needed. New key added; existing data preserved.

### Default Values by Mode

| Mode | Player X Name | Player O Name |
|------|---------------|---------------|
| human | "Player X" (or saved) | "Player O" (or saved) |
| computer | Saved name | "Computer" (first time) or saved |

**Note**: When switching to computer mode for first time, O name defaults to "Computer" unless user has already customized it.

## Validation Rules Summary

| Field | Rule | Error Handling |
|-------|------|----------------|
| `gameMode` | Must be 'human' or 'computer' | Default to 'human' |
| `isComputerThinking` | Boolean only | Default to false |
| `cellIndex` (move) | 0-8, cell must be null | Reject move silently |
| `playerNames.O` | String, max 20 chars | Truncate if needed |

## State Examples

### Initial State (Computer Mode)

```typescript
{
  board: [null, null, null, null, null, null, null, null, null],
  currentPlayer: 'X',
  status: 'playing',
  playerNames: { X: 'Player X', O: 'Computer' },
  gameMode: 'computer',
  isComputerThinking: false
}
```

### During Computer Thinking

```typescript
{
  board: ['X', null, null, null, null, null, null, null, null],
  currentPlayer: 'O',
  status: 'playing',
  playerNames: { X: 'Player X', O: 'Computer' },
  gameMode: 'computer',
  isComputerThinking: true  // UI shows "thinking...", board disabled
}
```

### After Computer Move

```typescript
{
  board: ['X', null, null, null, 'O', null, null, null, null],
  currentPlayer: 'X',
  status: 'playing',
  playerNames: { X: 'Player X', O: 'Computer' },
  gameMode: 'computer',
  isComputerThinking: false  // Back to human's turn
}
```

### Computer Wins

```typescript
{
  board: ['X', 'X', null, 'O', 'O', 'O', 'X', null, null],
  currentPlayer: 'X',  // Would have been X's turn
  status: 'o-wins',
  playerNames: { X: 'Player X', O: 'Computer' },
  gameMode: 'computer',
  isComputerThinking: false
}
```
