# Research: Computer Opponent

**Feature**: 002-computer-opponent  
**Date**: January 11, 2026  
**Purpose**: Resolve technical decisions before implementation

## Research Areas

### 1. Timer Management for Thinking Delay

**Decision**: Use native `setTimeout` with cleanup via stored timer ID

**Rationale**:
- Native browser API - zero dependencies
- Simple cancellation via `clearTimeout(timerId)` for game reset scenarios
- 2-second delay is well within setTimeout's precision capabilities
- No need for requestAnimationFrame (not animation-based)

**Alternatives Considered**:
- `setInterval`: Rejected - single execution needed, not recurring
- `requestAnimationFrame`: Rejected - designed for rendering, overkill for simple delay
- Web Workers: Rejected - unnecessary complexity for simple timer
- Third-party timer libraries: Rejected - violates minimal dependency principle

**Implementation Pattern**:
```typescript
let thinkingTimerId: number | null = null;

function startThinking(callback: () => void): void {
  thinkingTimerId = window.setTimeout(callback, 2000);
}

function cancelThinking(): void {
  if (thinkingTimerId !== null) {
    clearTimeout(thinkingTimerId);
    thinkingTimerId = null;
  }
}
```

### 2. Random Position Selection

**Decision**: Use `Math.random()` with array filtering for available cells

**Rationale**:
- Native JavaScript - zero dependencies
- Uniform distribution sufficient for game purposes
- Simple implementation with `filter()` and array indexing
- Cryptographic randomness not required (not security-sensitive)

**Alternatives Considered**:
- `crypto.getRandomValues()`: Rejected - overkill for game AI, slower
- Third-party RNG libraries: Rejected - violates minimal dependency principle
- Weighted random: Rejected - spec explicitly requires uniform random

**Implementation Pattern**:
```typescript
function getAvailableCells(board: CellValue[]): number[] {
  return board
    .map((cell, index) => (cell === null ? index : -1))
    .filter((index) => index !== -1);
}

function selectRandomCell(available: number[]): number {
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
}
```

### 3. Game Mode State Management

**Decision**: Extend existing `GameState` with `gameMode` field; store mode in localStorage

**Rationale**:
- Follows existing state management pattern (immutable updates)
- Mode persists across page reloads for user convenience
- Single source of truth - mode stored in state, not separate variable
- Minimal change to existing architecture

**Alternatives Considered**:
- Separate module-level variable: Rejected - violates single source of truth
- URL parameter: Rejected - unnecessary for simple toggle
- Session storage: Rejected - localStorage already used for player names

**Implementation Pattern**:
```typescript
type GameMode = 'human' | 'computer';

interface GameState {
  // ... existing fields
  gameMode: GameMode;
  isComputerThinking: boolean; // Transient state for UI
}
```

### 4. UI Interaction Blocking During Computer Turn

**Decision**: Use CSS `pointer-events: none` combined with state-based disabled attribute

**Rationale**:
- CSS approach is performant (no JavaScript event handling overhead)
- Disabled attribute provides accessibility (screen readers announce state)
- Combines visual and functional blocking
- Already used in existing `cell--disabled` pattern

**Alternatives Considered**:
- JavaScript event.preventDefault(): Rejected - requires handling every click
- Overlay div: Rejected - more DOM complexity
- Remove click handler: Rejected - requires re-adding, error-prone

**Implementation Pattern**:
```css
.board--thinking {
  pointer-events: none;
  opacity: 0.8;
}

.board--thinking .cell {
  cursor: wait;
}
```

### 5. Computer Player Name Handling

**Decision**: Allow editable computer name with "Computer" as default

**Rationale**:
- User requested ability to edit computer player name
- Reuses existing player name input infrastructure
- Consistent UX - both players have editable names
- Persists via existing localStorage mechanism

**Alternatives Considered**:
- Fixed "Computer" label: Rejected - user explicitly requested editable name
- Different UI for computer name: Rejected - inconsistent UX
- Hide O player name input in computer mode: Rejected - less flexible

**Default Names by Mode**:
- Human mode: "Player X" / "Player O" (unchanged)
- Computer mode: "Player X" (or custom) / "Computer" (or custom)

### 6. Mode Selector UI Component

**Decision**: Radio button group styled as toggle buttons

**Rationale**:
- Clear binary choice (vs Human / vs Computer)
- Native form element - accessible by default
- Easy to style as segmented control
- Keyboard navigable (arrow keys switch options)

**Alternatives Considered**:
- Dropdown select: Rejected - overkill for 2 options
- Checkbox toggle: Rejected - less clear semantic meaning
- Custom buttons: Rejected - requires manual ARIA implementation

**Responsive Behavior**:
- Desktop/Tablet: Horizontal button group
- Mobile: Same, but with touch-friendly sizing (min 44px tap targets)

### 7. Status Message for Thinking State

**Decision**: Show "Computer is thinking..." with subtle animation

**Rationale**:
- Clear feedback that game is progressing
- Differentiates from normal turn indication
- Animation (CSS only) indicates activity without distraction
- Follows existing status message pattern

**Animation Approach**:
```css
.status--thinking::after {
  content: '...';
  animation: thinking 1.5s infinite;
}

@keyframes thinking {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
```

## Summary of Decisions

| Area | Decision | Key Reason |
|------|----------|------------|
| Timer | Native setTimeout | Zero deps, simple cancel |
| Random | Math.random() | Sufficient for game, native |
| State | Extend GameState | Immutable pattern, single source |
| UI Block | CSS pointer-events | Performant, accessible |
| Computer Name | Editable with default | User requirement |
| Mode UI | Radio buttons as toggle | Accessible, semantic |
| Thinking Status | Animated message | Clear feedback |

## Open Questions (Resolved)

All technical questions resolved. Ready for Phase 1 design.
