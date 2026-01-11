# API Reference

Complete API documentation for all modules in the Tic-Tac-Toe application.

## Table of Contents

- [Types (`game/types.ts`)](#types-gametypests)
- [Game Logic (`game/logic.ts`)](#game-logic-gamelogicts)
- [State Management (`game/state.ts`)](#state-management-gamestatets)
- [Player Names (`game/playerNames.ts`)](#player-names-gameplayernamests)
- [Board UI (`ui/board.ts`)](#board-ui-uiboardts)
- [Status UI (`ui/status.ts`)](#status-ui-uistatusts)
- [Controls UI (`ui/controls.ts`)](#controls-ui-uicontrolsts)
- [Player Names UI (`ui/playerNames.ts`)](#player-names-ui-uiplayernamests)
- [Storage Utilities (`utils/storage.ts`)](#storage-utilities-utilsstoragets)

---

## Types (`game/types.ts`)

Core type definitions for the game domain model.

### `CellValue`

```typescript
type CellValue = 'X' | 'O' | null;
```

Represents the possible values of a cell on the board.

| Value | Description |
|-------|-------------|
| `'X'` | Cell occupied by Player X |
| `'O'` | Cell occupied by Player O |
| `null` | Cell is empty |

---

### `Player`

```typescript
type Player = 'X' | 'O';
```

The two players in the game. X always starts the first game.

---

### `GameStatus`

```typescript
type GameStatus = 'playing' | 'x-wins' | 'o-wins' | 'draw';
```

Current game outcome.

| Value | Description |
|-------|-------------|
| `'playing'` | Game is in progress |
| `'x-wins'` | Player X has won |
| `'o-wins'` | Player O has won |
| `'draw'` | Game ended in a draw |

---

### `PlayerNames`

```typescript
interface PlayerNames {
  X: string;
  O: string;
}
```

Custom display names for both players.

| Property | Type | Description |
|----------|------|-------------|
| `X` | `string` | Display name for Player X |
| `O` | `string` | Display name for Player O |

---

### `GameState`

```typescript
interface GameState {
  board: CellValue[];
  currentPlayer: Player;
  status: GameStatus;
  playerNames: PlayerNames;
}
```

Complete game state at any point in time.

| Property | Type | Description |
|----------|------|-------------|
| `board` | `CellValue[]` | 9-element array representing the 3×3 board |
| `currentPlayer` | `Player` | Which player moves next |
| `status` | `GameStatus` | Current game outcome |
| `playerNames` | `PlayerNames` | Custom names for both players |

**Invariants**:
- `board` always has exactly 9 elements
- If `status !== 'playing'`, no more moves are accepted
- Number of X marks ≥ number of O marks (X always goes first)

---

### `WinningLine`

```typescript
type WinningLine = [number, number, number];
```

Tuple of 3 board indices representing a winning line.

---

## Game Logic (`game/logic.ts`)

Pure functions for game rules and win detection. These functions have no side effects.

### `WINNING_LINES`

```typescript
const WINNING_LINES: WinningLine[]
```

Array of all 8 possible winning combinations.

```typescript
[
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Diagonal ↘
  [2, 4, 6], // Diagonal ↙
]
```

---

### `checkWin()`

```typescript
function checkWin(board: CellValue[], player: 'X' | 'O'): boolean
```

Checks if the given player has won.

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `board` | `CellValue[]` | Current board state (9 elements) |
| `player` | `'X' \| 'O'` | Player to check |

**Returns**: `true` if the player has 3 marks in a row.

**Example**:
```typescript
const board = ['X', 'X', 'X', null, 'O', 'O', null, null, null];
checkWin(board, 'X'); // true (top row)
checkWin(board, 'O'); // false
```

---

### `isBoardFull()`

```typescript
function isBoardFull(board: CellValue[]): boolean
```

Checks if the board is completely filled.

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `board` | `CellValue[]` | Current board state |

**Returns**: `true` if all 9 cells are occupied.

---

### `isEarlyDraw()`

```typescript
function isEarlyDraw(board: CellValue[]): boolean
```

Checks if the game is an early draw (no winning moves possible). A winning line is "blocked" if it contains both X and O.

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `board` | `CellValue[]` | Current board state |

**Returns**: `true` if all 8 winning lines are blocked.

---

### `determineStatus()`

```typescript
function determineStatus(board: CellValue[], lastPlayer: 'X' | 'O'): GameStatus
```

Determines the game status after a move.

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `board` | `CellValue[]` | Current board state |
| `lastPlayer` | `'X' \| 'O'` | The player who just moved |

**Returns**: Updated `GameStatus`.

**Logic**:
1. If `lastPlayer` has won → return `'x-wins'` or `'o-wins'`
2. If early draw detected → return `'draw'`
3. If board is full → return `'draw'`
4. Otherwise → return `'playing'`

---

### `isValidMove()`

```typescript
function isValidMove(
  board: CellValue[],
  cellIndex: number,
  status: GameStatus
): boolean
```

Checks if a move is valid.

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `board` | `CellValue[]` | Current board state |
| `cellIndex` | `number` | Index to check (0-8) |
| `status` | `GameStatus` | Current game status |

**Returns**: `true` if the move is valid.

**Validation Rules**:
- Game must be in `'playing'` status
- Index must be 0-8
- Cell must be empty (`null`)

---

## State Management (`game/state.ts`)

Game state management with immutable updates.

### `createInitialState()`

```typescript
function createInitialState(playerNames?: PlayerNames): GameState
```

Creates a fresh game state with empty board, always with X to play.

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `playerNames` | `PlayerNames` (optional) | Custom player names (defaults to loaded names) |

**Returns**: Initial `GameState` with X as the starting player.

> **Note**: For alternating starting players, use `resetGame()` instead.

---

### `makeMove()`

```typescript
function makeMove(state: GameState, cellIndex: number): GameState
```

Attempts to place a mark at the given cell index.

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `state` | `GameState` | Current game state |
| `cellIndex` | `number` | Index 0-8 of the cell to mark |

**Returns**: New `GameState` (immutable update), or **same state reference** if move is invalid.

**Example**:
```typescript
let state = createInitialState();
state = makeMove(state, 4); // X marks center
state = makeMove(state, 0); // O marks top-left
state = makeMove(state, 4); // Returns same state (cell occupied)
```

---

### `resetGame()`

```typescript
function resetGame(): GameState
```

Resets the game with alternating starting player. Each new game starts with the opposite player from the previous game.

**Returns**: Fresh `GameState` with alternating starting player.

---

### `resetStartingPlayerState()`

```typescript
function resetStartingPlayerState(): void
```

Resets the alternating starting player state to its initial value (X). Primarily intended for test setups to ensure deterministic behavior.

---

## Player Names (`game/playerNames.ts`)

Player name management with localStorage persistence.

### Constants

```typescript
const DEFAULT_X_NAME = 'Player X';
const DEFAULT_O_NAME = 'Player O';
```

Default names used when no custom names are saved.

---

### `getDefaultPlayerNames()`

```typescript
function getDefaultPlayerNames(): PlayerNames
```

Gets the default player names.

**Returns**: `{ X: 'Player X', O: 'Player O' }`

---

### `loadPlayerNames()`

```typescript
function loadPlayerNames(): PlayerNames
```

Loads player names from localStorage or returns defaults if not found.

**Returns**: `PlayerNames` from storage or defaults.

---

### `savePlayerNames()`

```typescript
function savePlayerNames(names: PlayerNames): void
```

Saves player names to localStorage.

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `names` | `PlayerNames` | Player names to save |

---

### `resetPlayerNames()`

```typescript
function resetPlayerNames(): PlayerNames
```

Resets player names to defaults and saves to localStorage.

**Returns**: Default `PlayerNames`.

---

## Board UI (`ui/board.ts`)

Board rendering and interaction handling.

### Types

```typescript
type CellClickHandler = (cellIndex: number) => void;
```

Callback signature for cell click events.

---

### `renderBoard()`

```typescript
function renderBoard(
  container: HTMLElement,
  state: GameState,
  onCellClick: CellClickHandler
): void
```

Renders the game board to the DOM. Sets up event delegation for cell clicks.

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `container` | `HTMLElement` | DOM element to render into |
| `state` | `GameState` | Current game state |
| `onCellClick` | `CellClickHandler` | Handler for cell clicks |

---

### `updateBoard()`

```typescript
function updateBoard(container: HTMLElement, state: GameState): void
```

Updates the board display without re-rendering. More efficient than full re-render.

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `container` | `HTMLElement` | Board container element |
| `state` | `GameState` | Current game state |

---

## Status UI (`ui/status.ts`)

Turn indicator and result message display.

### `getStatusMessage()`

```typescript
function getStatusMessage(state: GameState): string
```

Gets the display message for current game state.

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `state` | `GameState` | Current game state |

**Returns**: Human-readable status message.

**Examples**:
| Status | Current Player | Output |
|--------|----------------|--------|
| `'playing'` | `'X'` | `"Player X's Turn"` |
| `'playing'` | `'O'` | `"Player O's Turn"` |
| `'x-wins'` | - | `"🎉 Player X Wins!"` |
| `'o-wins'` | - | `"🎉 Player O Wins!"` |
| `'draw'` | - | `"It's a Draw!"` |

---

### `renderStatus()`

```typescript
function renderStatus(container: HTMLElement, state: GameState): void
```

Renders the status display to the DOM.

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `container` | `HTMLElement` | DOM element to render into |
| `state` | `GameState` | Current game state |

---

## Controls UI (`ui/controls.ts`)

Game control buttons.

### Types

```typescript
type NewGameHandler = () => void;
```

Callback signature for new game button.

---

### `renderControls()`

```typescript
function renderControls(
  container: HTMLElement,
  onNewGame: NewGameHandler
): void
```

Renders the "New Game" button.

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `container` | `HTMLElement` | DOM element to render into |
| `onNewGame` | `NewGameHandler` | Handler for button click |

---

## Player Names UI (`ui/playerNames.ts`)

Player name editor component allowing custom display names.

### Types

```typescript
type PlayerNameChangeHandler = (names: PlayerNames) => void;
```

Callback signature for player name changes.

---

### `renderPlayerNames()`

```typescript
function renderPlayerNames(
  container: HTMLElement,
  playerNames: PlayerNames,
  onChange: PlayerNameChangeHandler
): void
```

Renders the player name editor UI with input fields for both players.

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `container` | `HTMLElement` | DOM element to render into |
| `playerNames` | `PlayerNames` | Current player names |
| `onChange` | `PlayerNameChangeHandler` | Handler for name changes |

**Behavior**:
- Names are saved on blur (not on every keystroke)
- Empty names fall back to defaults ("Player X", "Player O")
- Maximum length: 20 characters
- HTML is escaped to prevent XSS attacks

---

### `updatePlayerNames()`

```typescript
function updatePlayerNames(
  container: HTMLElement,
  playerNames: PlayerNames
): void
```

Updates the player name display without full re-render.

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `container` | `HTMLElement` | Container with player name inputs |
| `playerNames` | `PlayerNames` | Current player names |

---

## Storage Utilities (`utils/storage.ts`)

Safe localStorage access with JSON serialization.

### Constants

```typescript
const STORAGE_PREFIX = 'tictactoe_';
```

All keys are prefixed to avoid collisions with other apps.

---

### `getStorageItem()`

```typescript
function getStorageItem<T>(key: string, defaultValue: T): T
```

Gets a value from localStorage.

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `key` | `string` | Storage key (auto-prefixed) |
| `defaultValue` | `T` | Default if key doesn't exist |

**Returns**: Stored value or default.

**Example**:
```typescript
const names = getStorageItem<PlayerNames>('player_names', {
  X: 'Player X',
  O: 'Player O',
});
```

---

### `setStorageItem()`

```typescript
function setStorageItem(key: string, value: unknown): void
```

Sets a value in localStorage.

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `key` | `string` | Storage key (auto-prefixed) |
| `value` | `unknown` | Value to store (JSON stringified) |

---

### `removeStorageItem()`

```typescript
function removeStorageItem(key: string): void
```

Removes a value from localStorage.

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `key` | `string` | Storage key (auto-prefixed) |

---

**Next**: [Development Guide](development.md) →
