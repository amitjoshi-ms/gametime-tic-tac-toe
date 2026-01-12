/**
 * Board rendering and interaction handling.
 * Manages the 3x3 grid display and cell click events.
 *
 * @module ui/board
 */

import type { GameState, CellValue } from '../game/types';

/**
 * Callback signature for cell click events.
 */
export type CellClickHandler = (cellIndex: number) => void;

/** Reference to the current click handler */
let currentClickHandler: CellClickHandler | null = null;

/**
 * Creates a cell element for the board.
 *
 * @param value - Current cell value (X, O, or null)
 * @param index - Cell index (0-8)
 * @param isGameOver - Whether the game has ended
 * @returns HTMLButtonElement for the cell
 */
function createCellElement(
  value: CellValue,
  index: number,
  isGameOver: boolean
): HTMLButtonElement {
  const cell = document.createElement('button');
  cell.className = 'cell';
  cell.dataset.index = String(index);
  cell.type = 'button';
  cell.setAttribute('aria-label', `Cell ${String(index + 1)}`);

  if (value) {
    cell.textContent = value;
    cell.classList.add('cell--occupied');
    cell.dataset.symbol = value;
    cell.setAttribute('aria-label', `Cell ${String(index + 1)}: ${value}`);
  }

  if (isGameOver) {
    cell.classList.add('cell--disabled');
    cell.disabled = true;
  }

  return cell;
}

/**
 * Handles click events on the board using event delegation.
 *
 * @param event - Click event
 */
function handleBoardClick(event: Event): void {
  if (!currentClickHandler) return;

  const target = event.target as HTMLElement;
  if (!target.classList.contains('cell')) return;

  const index = target.dataset.index;
  if (index === undefined) return;

  currentClickHandler(parseInt(index, 10));
}

/**
 * Renders the game board to the DOM.
 * Sets up the initial board structure and event delegation.
 * Extended to handle computer thinking state.
 *
 * @param container - DOM element to render into
 * @param state - Current game state
 * @param onCellClick - Handler for cell clicks
 */
export function renderBoard(
  container: HTMLElement,
  state: GameState,
  onCellClick: CellClickHandler
): void {
  currentClickHandler = onCellClick;

  const isGameOver = state.status !== 'playing';

  // Clear and rebuild
  container.innerHTML = '';

  // Add thinking class if computer is thinking
  container.classList.toggle('board--thinking', state.isComputerThinking);

  // Create cells
  state.board.forEach((value, index) => {
    const cell = createCellElement(value, index, isGameOver);
    container.appendChild(cell);
  });

  // Remove any existing event listener before adding a new one.
  // This handles cases where renderBoard might be called multiple times on the same container,
  // such as during hot module reloading in development or if the app is re-initialized.
  // Without this cleanup, multiple listeners would accumulate, causing the handler to fire
  // multiple times per click.
  container.removeEventListener('click', handleBoardClick);
  // Set up event delegation (single listener on container)
  container.addEventListener('click', handleBoardClick);
}

/**
 * Updates the board display without full re-render.
 * More efficient for incremental updates.
 * Extended to handle thinking state.
 *
 * @param container - DOM element containing the board
 * @param state - Current game state
 */
export function updateBoard(container: HTMLElement, state: GameState): void {
  const cells = container.querySelectorAll('.cell');
  const isGameOver = state.status !== 'playing';

  // Handle thinking state class toggling
  container.classList.toggle('board--thinking', state.isComputerThinking);

  cells.forEach((cell, index) => {
    const button = cell as HTMLButtonElement;
    const value = state.board[index];

    // Update content
    button.textContent = value ?? '';

    // Update classes
    button.className = 'cell';
    if (value) {
      button.classList.add('cell--occupied');
      button.dataset.symbol = value;
      button.setAttribute('aria-label', `Cell ${String(index + 1)}: ${value}`);
    } else {
      delete button.dataset.symbol;
      button.setAttribute('aria-label', `Cell ${String(index + 1)}`);
    }

    // Handle game over state
    if (isGameOver) {
      button.classList.add('cell--disabled');
      button.disabled = true;
    } else {
      button.disabled = false;
    }
  });
}
