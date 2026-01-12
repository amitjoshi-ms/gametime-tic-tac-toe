---
description: 'Performance optimization guidelines'
applyTo: '**/*.ts, **/*.css, **/*.html'
---

# Performance Guidelines

## Bundle Size Target

- **Goal:** < 50KB total (gzipped)
- **Current (as of 2026-01-10):** ~15KB (no runtime dependencies!)

## DOM Performance

### Batch DOM Updates

```typescript
// ❌ Multiple reflows
cells.forEach((cell, i) => {
  container.appendChild(cell); // Reflow each time
});

// ✅ Single reflow
const fragment = document.createDocumentFragment();
cells.forEach((cell) => fragment.appendChild(cell));
container.appendChild(fragment);
```

### Avoid Layout Thrashing

```typescript
// ❌ Read-write-read-write pattern
element.style.width = '100px';
const height = element.offsetHeight; // Forces layout
element.style.height = `${height * 2}px`;
const width = element.offsetWidth; // Forces layout again

// ✅ Batch reads, then batch writes
const height = element.offsetHeight;
const width = element.offsetWidth;
element.style.width = `${width}px`;
element.style.height = `${height * 2}px`;
```

### Use CSS Classes Over Inline Styles

```typescript
// ❌ Many style property changes
cell.style.backgroundColor = '#fff';
cell.style.color = '#000';
cell.style.fontWeight = 'bold';

// ✅ Single class toggle
cell.classList.add('cell--highlighted');
```

## Event Handling

### Use Event Delegation

```typescript
// ❌ Listener per cell (9 listeners)
cells.forEach((cell, i) => {
  cell.addEventListener('click', () => handleClick(i));
});

// ✅ Single listener on parent
board.addEventListener('click', (e) => {
  const cell = (e.target as HTMLElement).closest('.cell');
  if (cell) {
    const index = Number(cell.dataset.index);
    handleClick(index);
  }
});
```

### Debounce High-Frequency Events

```typescript
function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | undefined;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), delay);
  };
}

// Usage for name input
const debouncedSave = debounce(savePlayerNames, 300);
input.addEventListener('input', () => debouncedSave(getNames()));
```

## Rendering Optimization

### Conditional Updates

```typescript
// ❌ Re-render everything always
function updateUI() {
  renderBoard(container, state);
  renderStatus(statusEl, state);
  renderControls(controlsEl);
}

// ✅ Only update what changed
function updateUI(prevState: GameState | null, newState: GameState) {
  // NOTE: This check uses reference equality and only works reliably with immutable updates:
  // a new board array must be created whenever the board changes (e.g., `board = [...board]`).
  // If you instead mutate the existing array in place, `prevState.board` and `newState.board` will
  // still reference the same array, so use a deeper comparison instead of reference equality.
  // The board is re-rendered ONLY when its reference changes (prevState.board !== newState.board).
  // If only status changes (not the board), only renderStatus() is called, avoiding unnecessary work.
  if (!prevState || prevState.board !== newState.board) {
    updateBoard(container, newState);
  }
  if (!prevState || prevState.status !== newState.status) {
    renderStatus(statusEl, newState);
  }
}
```

### Early Exit for No-Op Updates

```typescript
function makeMove(state: GameState, cellIndex: number): GameState {
  if (state.status !== 'playing') return state;
  if (state.board[cellIndex] !== null) return state;

  // Only proceed if move is valid
  // NOTE: This pattern assumes an immutable state model where callers
  //       skip re-renders when the returned state is the same reference
  //       (e.g. `if (nextState === prevState) { return; }`).
  //       Callers MUST perform that reference check for this optimization
  //       to have any effect.
}

// Example caller using the reference-check contract:
function onCellClick(currentState: GameState, cellIndex: number) {
  const nextState = makeMove(currentState, cellIndex);
  if (nextState === currentState) {
    // No state change; skip expensive work (e.g., re-render)
    return;
  }

  // State changed; proceed with update/render
  renderBoard(container, nextState);
  renderStatus(statusEl, nextState);
}
```

## CSS Performance

### Use Transform/Opacity for Animations

```css
/* ❌ Triggers layout */
.cell:hover {
  width: 110px;
  height: 110px;
}

/* ✅ GPU-accelerated */
.cell:hover {
  transform: scale(1.1);
}
```

### Avoid Expensive Selectors

```css
/* ❌ Complex, slow selector */
.board > div:nth-child(3n+1):not(.disabled) .cell-content { }

/* ✅ Simple, fast selector */
.cell--active { }
```

### Use `will-change` Sparingly

```css
/* Only when needed for animations */
.cell {
  will-change: transform; /* Hints GPU acceleration */
}
```

## Loading Performance

### Vite Handles This

- Tree-shaking removes unused code
- Code splitting for lazy loading
- Asset optimization (minification, compression)

### Keep Imports Minimal

- Prefer importing only the specific functions or values you need instead of entire modules to keep the bundle smaller.
