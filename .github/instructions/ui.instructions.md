---
description: 'UI/DOM manipulation standards'
applyTo: 'src/ui/**/*.ts, src/styles/**/*.css'
---

# UI Development Standards

## Architecture

UI code in `src/ui/` handles all DOM manipulation. Keep logic separate from rendering.

```text
src/ui/
├── board.ts        # Game board rendering
├── status.ts       # Game status display
├── controls.ts     # Buttons and controls
└── playerNames.ts  # Player name inputs
```

## DOM Manipulation Patterns

### Render Functions

Create initial DOM structure:

```typescript
/**
 * Creates and renders the game board.
 * @param container - Parent element to render into
 * @param state - Current game state
 * @param onCellClick - Callback for cell clicks
 */
export function renderBoard(
  container: HTMLElement,
  state: GameState,
  onCellClick: (cellIndex: number) => void
): void {
  container.innerHTML = '';
  
  state.board.forEach((cell, index) => {
    const cellElement = document.createElement('button');
    cellElement.className = 'cell';
    cellElement.textContent = cell ?? '';
    cellElement.addEventListener('click', () => onCellClick(index));
    container.appendChild(cellElement);
  });
}
```

### Update Functions

Update existing DOM (more efficient than re-rendering):

```typescript
/**
 * Updates an existing board with new state.
 * @param container - Element containing the board
 * @param state - Updated game state
 */
export function updateBoard(container: HTMLElement, state: GameState): void {
  const cells = container.querySelectorAll('.cell');
  cells.forEach((cell, index) => {
    cell.textContent = state.board[index] ?? '';
  });
}
```

## Event Handling

### Pass Callbacks, Don't Import State

```typescript
// ✅ Good: Callback passed in
export function renderControls(
  container: HTMLElement,
  onNewGame: () => void
): void {
  const button = document.createElement('button');
  button.textContent = 'New Game';
  button.addEventListener('click', onNewGame);
  container.appendChild(button);
}

// ❌ Bad: Directly accessing module-level state
let internalGameState: GameState = resetGame();

export function renderControls(container: HTMLElement): void {
  const button = document.createElement('button');
  button.textContent = 'New Game';
  button.addEventListener('click', () => {
    internalGameState = resetGame(); // Hidden module-level state update via internalGameState
    // Now main.ts won't know about this change!
  });
  container.appendChild(button);
}
```

### Use Event Delegation for Lists

```typescript
export function renderBoard(
  container: HTMLElement,
  state: GameState,
  onCellClick: (cellIndex: number) => void
): void {
  // Clear container
  container.innerHTML = '';

  // Create and append all cells
  state.board.forEach((cell, index) => {
    const cellElement = document.createElement('button');
    cellElement.className = 'cell';
    cellElement.textContent = cell ?? '';
    cellElement.dataset.index = String(index);
    container.appendChild(cellElement);
  });

  // Set up event delegation: single listener on parent handles all cells
  const handleClick = (e: MouseEvent) => {
    const cell = (e.target as HTMLElement | null)?.closest('.cell');
    if (cell) {
      const indexStr = (cell as HTMLElement).dataset.index;
      if (indexStr === undefined) return;
      const index = parseInt(indexStr, 10);
      onCellClick(index);
    }
  };

  // Remove any existing listener to avoid duplicates
  container.removeEventListener('click', handleClick);
  container.addEventListener('click', handleClick);
}
```

## Accessibility

### Semantic HTML

```typescript
// ✅ Use appropriate elements
const button = document.createElement('button'); // Not div with click handler
const input = document.createElement('input');
input.type = 'text';
input.setAttribute('aria-label', 'Player X name');
```

### ARIA Attributes

```typescript
// Game status announcements
statusElement.setAttribute('role', 'status');
statusElement.setAttribute('aria-live', 'polite');

// Disabled states
button.setAttribute('aria-disabled', 'true');
```

### Keyboard Navigation

```typescript
// Cells should be focusable and keyboard-accessible
cell.setAttribute('tabindex', '0');
cell.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    onCellClick(index);
  }
});
```

## CSS Guidelines

### Use CSS Classes for State

```typescript
// ✅ Toggle classes for visual state
cell.classList.add('cell--occupied');
cell.classList.toggle('cell--winning', isWinning);

// ❌ Don't set inline styles
cell.style.backgroundColor = 'green';
```

### CSS Class Naming (BEM-ish)

```css
/* Block */
.board { }

/* Element */
.board__cell { }

/* Modifier */
.board__cell--winning { }
.board__cell--disabled { }
```

### CSS Custom Properties for Theming

```css
:root {
  --color-x: #2563eb;
  --color-o: #dc2626;
  --color-winning: #16a34a;
  --cell-size: 100px;
}

.cell[data-player="X"] {
  color: var(--color-x);
}
```

## Performance

### Batch DOM Updates

```typescript
// ✅ Good: Build fragment, then append once
const fragment = document.createDocumentFragment();
state.board.forEach((cell, index) => {
  const cellElement = createCell(cell, index);
  fragment.appendChild(cellElement);
});
container.appendChild(fragment);

// ❌ Bad: Multiple reflows
state.board.forEach((cell, index) => {
  container.appendChild(createCell(cell, index)); // Reflow each time
});
```

### Minimize Reflows

- Read all DOM values first, then write
- Use `classList` instead of setting `className` string
- Avoid reading layout properties (`offsetHeight`) after writes
