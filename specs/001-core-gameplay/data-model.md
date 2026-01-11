# Data Model: Core Tic-Tac-Toe Gameplay

**Feature**: 001-core-gameplay  
**Date**: 2026-01-10  
**Source**: [spec.md](spec.md) Key Entities section

## Entities

### CellValue

Represents the possible states of a single cell on the game board.

| Value | Description |
|-------|-------------|
| `null` | Cell is empty, available for play |
| `'X'` | Cell is occupied by Player X |
| `'O'` | Cell is occupied by Player O |

**Validation Rules**:
- Once set to 'X' or 'O', cannot be changed back to null (except on game reset)
- Cannot change from 'X' to 'O' or vice versa

---

### Player

Identifies which player is active.

| Value | Description |
|-------|-------------|
| `'X'` | Player X (always goes first) |
| `'O'` | Player O (always goes second) |

**State Transitions**:
```
Game Start → 'X'
After X plays → 'O'
After O plays → 'X'
Game End → frozen (no transition)
```

---

### GameStatus

Represents the current outcome state of the game.

| Value | Description |
|-------|-------------|
| `'playing'` | Game is in progress, moves are accepted |
| `'x-wins'` | Player X achieved three in a row |
| `'o-wins'` | Player O achieved three in a row |
| `'draw'` | All cells filled, no winner |

**State Transitions**:
```
           ┌──────────────┐
           │   playing    │
           └──────┬───────┘
                  │
     ┌────────────┼────────────┐
     │            │            │
     ▼            ▼            ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│ x-wins  │ │ o-wins  │ │  draw   │
└─────────┘ └─────────┘ └─────────┘
     │            │            │
     └────────────┼────────────┘
                  │
                  ▼ (New Game)
           ┌──────────────┐
           │   playing    │
           └──────────────┘
```

**Validation Rules**:
- Terminal states (`x-wins`, `o-wins`, `draw`) only transition via explicit "New Game" action
- Win takes precedence over draw (if final move creates both conditions)

---

### GameBoard

A 3x3 grid represented as a flat array of 9 cells.

**Structure**:
```
Index mapping:
┌───┬───┬───┐
│ 0 │ 1 │ 2 │
├───┼───┼───┤
│ 3 │ 4 │ 5 │
├───┼───┼───┤
│ 6 │ 7 │ 8 │
└───┴───┴───┘

Row/Column conversion:
- index = row * 3 + col
- row = Math.floor(index / 3)
- col = index % 3
```

**Type**: `CellValue[]` (length: 9)

**Initial State**: `[null, null, null, null, null, null, null, null, null]`

**Validation Rules**:
- Array length must always be exactly 9
- Each element must be a valid CellValue

---

### GameState

The complete state of the game at any point in time.

| Field | Type | Description |
|-------|------|-------------|
| `board` | `CellValue[]` | 9-element array representing the 3x3 grid |
| `currentPlayer` | `Player` | Which player should move next |
| `status` | `GameStatus` | Current game outcome state |

**Initial State**:
```typescript
{
  board: [null, null, null, null, null, null, null, null, null],
  currentPlayer: 'X',
  status: 'playing'
}
```

**Invariants**:
1. If `status !== 'playing'`, `currentPlayer` is informational only (no moves accepted)
2. `board` always has exactly 9 elements
3. Number of X marks ≥ number of O marks (X always goes first)
4. Number of X marks - number of O marks ∈ {0, 1}

---

## Winning Combinations

The 8 possible winning lines (indices into the board array):

| Name | Indices | Visual |
|------|---------|--------|
| Row 0 | `[0, 1, 2]` | Top row |
| Row 1 | `[3, 4, 5]` | Middle row |
| Row 2 | `[6, 7, 8]` | Bottom row |
| Col 0 | `[0, 3, 6]` | Left column |
| Col 1 | `[1, 4, 7]` | Center column |
| Col 2 | `[2, 5, 8]` | Right column |
| Diag 1 | `[0, 4, 8]` | Top-left to bottom-right |
| Diag 2 | `[2, 4, 6]` | Top-right to bottom-left |

**Detection Algorithm**:
```
For each winning combination [a, b, c]:
  If board[a] !== null AND board[a] === board[b] === board[c]:
    Winner is board[a]
```

---

## Relationships

```
┌─────────────────────────────────────────────┐
│                 GameState                    │
├─────────────────────────────────────────────┤
│ board: CellValue[9] ◄────────┐              │
│ currentPlayer: Player        │              │
│ status: GameStatus           │              │
└──────────────────────────────┼──────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
              ┌─────▼─────┐         ┌─────▼─────┐
              │ CellValue │         │  Player   │
              ├───────────┤         ├───────────┤
              │ null      │         │ 'X'       │
              │ 'X'       │◄────────│ 'O'       │
              │ 'O'       │         └───────────┘
              └───────────┘
```
