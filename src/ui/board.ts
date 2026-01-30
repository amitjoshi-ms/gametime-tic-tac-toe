/**
 * Board rendering and interaction handling.
 * Manages the 3x3 grid display and cell click events.
 *
 * @module ui/board
 */

import type { GameState, CellValue, WinningLine } from '../game/types';
import { isLocalPlayerTurn } from '../game/remote';
import { getWinningCells } from '../game/logic';

/**
 * Callback signature for cell click events.
 */
export type CellClickHandler = (cellIndex: number) => void;

/** Reference to the current click handler */
let currentClickHandler: CellClickHandler | null = null;

/**
 * Determines if the board should be interactive based on game state.
 *
 * @param state - Current game state
 * @returns true if the board should accept clicks
 */
function isBoardInteractive(state: GameState): boolean {
  // Board is never interactive when game is over
  if (state.status !== 'playing') {
    return false;
  }

  // In demo mode, board is never interactive
  if (state.gameMode === 'demo') {
    return false;
  }

  // In computer mode, not interactive when computer is thinking
  if (state.gameMode === 'computer' && state.isComputerThinking) {
    return false;
  }

  // In remote mode, only interactive on local player's turn
  if (state.gameMode === 'remote') {
    return isLocalPlayerTurn(state);
  }

  // Human mode - always interactive when playing
  return true;
}

/**
 * Creates a cell element for the board.
 *
 * @param value - Current cell value
 * @param index - Cell index (0-8)
 * @param isDisabled - Whether the cell should be disabled
 * @param playerConfigs - Player configurations to determine which player placed the symbol
 * @returns HTMLButtonElement for the cell
 */
function createCellElement(
  value: CellValue,
  index: number,
  isDisabled: boolean,
  playerConfigs: { X: { symbol: CellValue }; O: { symbol: CellValue } }
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
    
    // Determine which player placed this symbol for coloring
    if (value === playerConfigs.X.symbol) {
      cell.classList.add('cell--x');
    } else if (value === playerConfigs.O.symbol) {
      cell.classList.add('cell--o');
    }
    
    cell.setAttribute('aria-label', `Cell ${String(index + 1)}: ${value}`);
  }

  if (isDisabled) {
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
 * Extended to handle computer thinking state, demo mode, and remote mode.
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

  const isInteractive = isBoardInteractive(state);
  const isDemo = state.gameMode === 'demo';
  const isRemote = state.gameMode === 'remote';
  const isWaitingForOpponent = isRemote && !isInteractive && state.status === 'playing';

  // Clear and rebuild
  container.innerHTML = '';

  // Add thinking class if computer is thinking
  container.classList.toggle('board--thinking', state.isComputerThinking);
  // Add demo-mode class for styling hooks
  container.classList.toggle('board--demo', isDemo);
  // Add remote-mode class for styling hooks
  container.classList.toggle('board--remote', isRemote);
  // Add waiting class when waiting for remote opponent
  container.classList.toggle('board--waiting', isWaitingForOpponent);

  // Create cells - disable if not interactive
  state.board.forEach((value, index) => {
    const cell = createCellElement(value, index, !isInteractive, state.playerConfigs);
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
 * Extended to handle thinking state, demo mode, and remote mode.
 *
 * @param container - DOM element containing the board
 * @param state - Current game state
 */
export function updateBoard(container: HTMLElement, state: GameState): void {
  const cells = container.querySelectorAll('.cell');
  const isInteractive = isBoardInteractive(state);
  const isGameOver = state.status !== 'playing';
  const isDemo = state.gameMode === 'demo';
  const isRemote = state.gameMode === 'remote';
  const isWaitingForOpponent = isRemote && !isInteractive && !isGameOver;

  // Determine winning cells if game is won
  let winningCells: WinningLine | null = null;
  if (state.status === 'x-wins') {
    winningCells = getWinningCells(state.board, state.playerConfigs.X.symbol);
  } else if (state.status === 'o-wins') {
    winningCells = getWinningCells(state.board, state.playerConfigs.O.symbol);
  }

  // Handle thinking state class toggling
  container.classList.toggle('board--thinking', state.isComputerThinking);
  // Handle demo mode class toggling
  container.classList.toggle('board--demo', isDemo);
  // Handle remote mode class toggling
  container.classList.toggle('board--remote', isRemote);
  // Handle waiting for opponent state
  container.classList.toggle('board--waiting', isWaitingForOpponent);

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
      
      // Determine which player placed this symbol for coloring
      if (value === state.playerConfigs.X.symbol) {
        button.classList.add('cell--x');
      } else if (value === state.playerConfigs.O.symbol) {
        button.classList.add('cell--o');
      }
      
      button.setAttribute('aria-label', `Cell ${String(index + 1)}: ${value}`);
    } else {
      delete button.dataset.symbol;
      button.setAttribute('aria-label', `Cell ${String(index + 1)}`);
    }

    // Apply winning cell styling if this cell is part of the winning line
    if (winningCells?.includes(index)) {
      button.classList.add('cell--winner');
    }

    // Handle disabled state:
    // - Game over: all cells disabled
    // - Not interactive (remote waiting, computer thinking, demo): all cells disabled
    // Note: Occupied cells are NOT disabled during play - the game logic handles ignoring clicks
    if (isGameOver || !isInteractive) {
      button.classList.add('cell--disabled');
      button.disabled = true;
    } else {
      button.disabled = false;
    }
  });
}
