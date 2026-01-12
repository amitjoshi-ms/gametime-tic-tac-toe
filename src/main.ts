/**
 * Application entry point.
 * Initializes the game and sets up the UI.
 *
 * @module main
 */

import {
  resetGame,
  makeMove,
  setComputerThinking,
  isComputerTurn,
} from './game/state';
import { DEFAULT_COMPUTER_NAME } from './game/playerNames';
import { scheduleComputerMove } from './game/computer';
import { loadGameMode, saveGameMode } from './utils/storage';
import { renderBoard, updateBoard } from './ui/board';
import { renderStatus } from './ui/status';
import { renderControls } from './ui/controls';
import { renderPlayerNames, updatePlayerNames } from './ui/playerNames';
import { renderModeSelector, updateModeSelector } from './ui/modeSelector';
import { savePlayerConfigs } from './game/playerNames';
import type { GameState, GameMode, PlayerConfigs } from './game/types';

/** Current game state - module-level for simplicity */
let gameState: GameState = resetGame(loadGameMode());

/** Cancel function for pending computer move */
let cancelPendingMove: (() => void) | null = null;

/**
 * Handles the computer making its move.
 * @param cellIndex - Index of the cell the computer selected
 */
function handleComputerMove(cellIndex: number): void {
  // Clear the pending move reference
  cancelPendingMove = null;

  // Clear thinking state before making move
  gameState = setComputerThinking(gameState, false);

  // Ignore if no valid move (shouldn't happen in normal gameplay)
  if (cellIndex === -1) {
    updateUI();
    return;
  }

  // Make the computer's move
  const newState = makeMove(gameState, cellIndex);
  if (newState !== gameState) {
    gameState = newState;
  }

  updateUI();
}

/**
 * Triggers the computer's turn with thinking delay.
 */
function triggerComputerTurn(): void {
  // Set thinking state
  gameState = setComputerThinking(gameState, true);
  updateUI();

  // Schedule the computer move and store cancel function
  cancelPendingMove = scheduleComputerMove(gameState.board, handleComputerMove);
}

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

    // Check if computer should move next
    if (isComputerTurn(gameState)) {
      triggerComputerTurn();
    }
  }
}

/**
 * Handles the "New Game" button click.
 */
function handleNewGame(): void {
  // Cancel any pending computer move
  if (cancelPendingMove) {
    cancelPendingMove();
    cancelPendingMove = null;
  }

  gameState = resetGame(gameState.gameMode);
  updateUI();

  // Trigger computer turn if computer starts
  if (isComputerTurn(gameState)) {
    triggerComputerTurn();
  }
}

/**
 * Handles game mode changes.
 * @param mode - New game mode
 */
function handleModeChange(mode: GameMode): void {
  // Cancel any pending computer move
  if (cancelPendingMove) {
    cancelPendingMove();
    cancelPendingMove = null;
  }

  // Save mode to localStorage
  saveGameMode(mode);

  // Reset game with new mode
  gameState = resetGame(mode);

  // Update player O name when switching to computer mode
  if (mode === 'computer') {
    gameState = {
      ...gameState,
      playerConfigs: {
        ...gameState.playerConfigs,
        O: {
          ...gameState.playerConfigs.O,
          name: DEFAULT_COMPUTER_NAME,
        },
      },
    };
    savePlayerConfigs(gameState.playerConfigs);
  }

  updateUI();

  // Trigger computer turn if computer starts
  if (isComputerTurn(gameState)) {
    triggerComputerTurn();
  }
}

/**
 * Handles player config changes (names and symbols).
 * @param configs - New player configurations
 */
function handleConfigChange(configs: PlayerConfigs): void {
  // Save to localStorage
  savePlayerConfigs(configs);

  // Update game state with new configs
  gameState = {
    ...gameState,
    playerConfigs: configs,
  };

  // Update UI to reflect new configs
  updateUI();
}

/**
 * Updates all UI components to reflect current game state.
 */
function updateUI(): void {
  const modeSelectorContainer = document.getElementById('mode-selector');
  const playerNamesContainer = document.getElementById('player-names');
  const boardContainer = document.getElementById('board');
  const statusContainer = document.getElementById('status');

  if (modeSelectorContainer) {
    updateModeSelector(modeSelectorContainer, gameState.gameMode);
  }

  if (playerNamesContainer) {
    updatePlayerNames(playerNamesContainer, gameState.playerConfigs);
  }

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
    <div id="mode-selector" class="mode-selector-container"></div>
    <div id="player-names" class="player-names-container"></div>
    <div id="status" class="status"></div>
    <div id="board" class="board"></div>
    <div id="controls" class="controls"></div>
  `;

  // Get container references
  const modeSelectorContainer = document.getElementById('mode-selector');
  const playerNamesContainer = document.getElementById('player-names');
  const boardContainer = document.getElementById('board');
  const statusContainer = document.getElementById('status');
  const controlsContainer = document.getElementById('controls');

  if (
    !modeSelectorContainer ||
    !playerNamesContainer ||
    !boardContainer ||
    !statusContainer ||
    !controlsContainer
  ) {
    console.error('Required containers not found');
    return;
  }

  // Initialize UI components
  renderModeSelector(
    modeSelectorContainer,
    gameState.gameMode,
    handleModeChange
  );
  renderPlayerNames(
    playerNamesContainer,
    gameState.playerConfigs,
    handleConfigChange
  );
  renderBoard(boardContainer, gameState, handleCellClick);
  renderStatus(statusContainer, gameState);
  renderControls(controlsContainer, handleNewGame);

  // Trigger computer turn if computer starts
  if (isComputerTurn(gameState)) {
    triggerComputerTurn();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Export for testing
export { initApp, handleCellClick, handleNewGame };
