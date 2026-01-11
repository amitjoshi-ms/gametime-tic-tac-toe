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
import { renderPlayerNames } from './ui/playerNames';
import { savePlayerNames } from './game/playerNames';
import type { GameState, PlayerNames } from './game/types';

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
 * Handles player name changes.
 * @param names - New player names
 */
function handleNameChange(names: PlayerNames): void {
  // Save to localStorage
  savePlayerNames(names);

  // Update game state with new names
  gameState = {
    ...gameState,
    playerNames: names,
  };

  // Update UI to reflect new names
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
    <div id="player-names" class="player-names-container"></div>
    <div id="status" class="status"></div>
    <div id="board" class="board"></div>
    <div id="controls" class="controls"></div>
  `;

  // Get container references
  const playerNamesContainer = document.getElementById('player-names');
  const boardContainer = document.getElementById('board');
  const statusContainer = document.getElementById('status');
  const controlsContainer = document.getElementById('controls');

  if (!playerNamesContainer || !boardContainer || !statusContainer || !controlsContainer) {
    console.error('Required containers not found');
    return;
  }

  // Initialize UI components
  renderPlayerNames(playerNamesContainer, gameState.playerNames, handleNameChange);
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
