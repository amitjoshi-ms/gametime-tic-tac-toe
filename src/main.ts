/**
 * Application entry point.
 * Initializes the game and sets up the UI.
 *
 * @module main
 */

import { createInitialState, makeMove, resetGame } from './game/state';
import { renderBoard, updateBoard } from './ui/board';
import { renderStatus } from './ui/status';
import { renderControls } from './ui/controls';
import type { GameState } from './game/types';

/** Current game state - module-level for simplicity */
let gameState: GameState = createInitialState();

/**
 * Handles a cell click event.
 * @param cellIndex - Index 0-8 of the clicked cell
 */
function handleCellClick(cellIndex: number): void {
  const newState = makeMove(gameState, cellIndex);

  // Only update if state actually changed
  if (newState !== gameState) {
    gameState = newState;
    updateUI();
  }
}

/**
 * Handles the "New Game" button click.
 */
function handleNewGame(): void {
  gameState = resetGame();
  updateUI();
}

/**
 * Updates all UI components to reflect current game state.
 */
function updateUI(): void {
  const boardContainer = document.getElementById('board');
  const statusContainer = document.getElementById('status');

  if (boardContainer) {
    updateBoard(boardContainer, gameState);
  }

  if (statusContainer) {
    renderStatus(statusContainer, gameState);
  }
}

/**
 * Initializes the application.
 * Sets up DOM structure, creates initial game state, and wires up event handlers.
 */
function initApp(): void {
  const app = document.getElementById('app');
  if (!app) {
    console.error('App container not found');
    return;
  }

  // Create DOM structure
  app.innerHTML = `
    <h1 class="game-title">Tic-Tac-Toe</h1>
    <div id="status" class="status"></div>
    <div id="board" class="board"></div>
    <div id="controls" class="controls"></div>
  `;

  // Get container references
  const boardContainer = document.getElementById('board');
  const statusContainer = document.getElementById('status');
  const controlsContainer = document.getElementById('controls');

  if (!boardContainer || !statusContainer || !controlsContainer) {
    console.error('Required containers not found');
    return;
  }

  // Initialize UI components
  renderBoard(boardContainer, gameState, handleCellClick);
  renderStatus(statusContainer, gameState);
  renderControls(controlsContainer, handleNewGame);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Export for testing
export { initApp, handleCellClick, handleNewGame };
