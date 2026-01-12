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
import {
  DEFAULT_COMPUTER_NAME,
  savePlayerNames,
} from './game/playerNames';
import { scheduleComputerMove, scheduleDemoRestart } from './game/computer';
import { loadGameMode, saveGameMode } from './utils/storage';
import { renderBoard, updateBoard } from './ui/board';
import { renderStatus } from './ui/status';
import { renderControls, updateControls } from './ui/controls';
import { renderPlayerNames, updatePlayerNames } from './ui/playerNames';
import { renderModeSelector, updateModeSelector } from './ui/modeSelector';
import type { GameState, GameMode, PlayerNames } from './game/types';

/** Current game state - module-level for simplicity */
let gameState: GameState = resetGame(loadGameMode());

/** Cancel function for pending computer move */
let cancelPendingMove: (() => void) | null = null;

/** Cancel function for pending demo restart timer */
let cancelRestartTimer: (() => void) | null = null;

/** Previous game mode before demo started (to restore on stop) */
let preDemoMode: GameMode | null = null;

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
  // Ignore clicks in demo mode
  if (gameState.gameMode === 'demo') {
    return;
  }

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
      playerNames: {
        ...gameState.playerNames,
        O: DEFAULT_COMPUTER_NAME,
      },
    };
    savePlayerNames(gameState.playerNames);
  }

  updateUI();

  // Trigger computer turn if computer starts
  if (isComputerTurn(gameState)) {
    triggerComputerTurn();
  }
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
 * Triggers the next computer move in demo mode.
 * Called after each move completes or on demo start.
 */
function triggerDemoMove(): void {
  // Only proceed if in demo mode and game is still playing
  if (gameState.gameMode !== 'demo' || gameState.status !== 'playing') {
    return;
  }

  // Set thinking state
  gameState = setComputerThinking(gameState, true);
  updateUI();

  // Schedule the computer move and store cancel function
  cancelPendingMove = scheduleComputerMove(gameState.board, handleDemoMove);
}

/**
 * Handles a computer move in demo mode.
 * @param cellIndex - Index of the cell the computer selected
 */
function handleDemoMove(cellIndex: number): void {
  // Clear the pending move reference
  cancelPendingMove = null;

  // Exit if not in demo mode anymore
  if (gameState.gameMode !== 'demo') {
    return;
  }

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

  // Check if game ended
  if (gameState.status !== 'playing') {
    handleDemoGameComplete();
  } else {
    // Schedule next move
    triggerDemoMove();
  }
}

/**
 * Handles demo game completion.
 * Displays result and schedules auto-restart.
 */
function handleDemoGameComplete(): void {
  // Save current player names for restart
  const currentNames = gameState.playerNames;

  // Schedule auto-restart after DEMO_RESTART_DELAY
  cancelRestartTimer = scheduleDemoRestart(() => {
    // Only restart if still in demo mode
    if (gameState.gameMode === 'demo') {
      cancelRestartTimer = null;
      // Reset game and start new demo with same names
      gameState = resetGame('demo');
      gameState = {
        ...gameState,
        playerNames: currentNames,
      };
      updateUI();
      triggerDemoMove();
    }
  });
}

/**
 * Starts demo mode.
 * Saves current mode for restoration, resets game, and begins auto-play.
 * Uses current player names from the form inputs for the demo.
 */
function startDemo(): void {
  // Save current mode for restoration on stop
  preDemoMode = gameState.gameMode;

  // Cancel any pending computer move from previous mode
  if (cancelPendingMove) {
    cancelPendingMove();
    cancelPendingMove = null;
  }

  // Get the current player names from state (which reflects form inputs)
  const currentNames = gameState.playerNames;

  // Reset game with demo mode
  gameState = resetGame('demo');

  // Use the current player names (user-entered names) for the demo
  gameState = {
    ...gameState,
    playerNames: currentNames,
  };

  updateUI();

  // Schedule first move
  triggerDemoMove();
}

/**
 * Stops demo mode.
 * Cancels pending timers and restores previous game mode.
 */
function stopDemo(): void {
  // Cancel any pending move timer
  if (cancelPendingMove) {
    cancelPendingMove();
    cancelPendingMove = null;
  }

  // Cancel any pending restart timer
  if (cancelRestartTimer) {
    cancelRestartTimer();
    cancelRestartTimer = null;
  }

  // Clear thinking state
  gameState = setComputerThinking(gameState, false);

  // Restore previous mode (keep current board state)
  const restoredMode = preDemoMode ?? 'human';
  gameState = {
    ...gameState,
    gameMode: restoredMode,
  };
  preDemoMode = null;

  updateUI();
}

/**
 * Handles demo toggle button click.
 * Starts demo if not active, stops if active.
 */
function handleDemoToggle(): void {
  if (gameState.gameMode === 'demo') {
    stopDemo();
  } else {
    startDemo();
  }
}

/**
 * Updates all UI components to reflect current game state.
 */
function updateUI(): void {
  const modeSelectorContainer = document.getElementById('mode-selector');
  const playerNamesContainer = document.getElementById('player-names');
  const boardContainer = document.getElementById('board');
  const statusContainer = document.getElementById('status');
  const controlsContainer = document.getElementById('controls');

  const isDemoActive = gameState.gameMode === 'demo';

  if (modeSelectorContainer) {
    updateModeSelector(modeSelectorContainer, gameState.gameMode, isDemoActive);
  }

  if (playerNamesContainer) {
    updatePlayerNames(playerNamesContainer, gameState.playerNames);
  }

  if (boardContainer) {
    updateBoard(boardContainer, gameState);
  }

  if (statusContainer) {
    renderStatus(statusContainer, gameState);
  }

  if (controlsContainer) {
    updateControls(controlsContainer, isDemoActive);
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
    gameState.playerNames,
    handleNameChange
  );
  renderBoard(boardContainer, gameState, handleCellClick);
  renderStatus(statusContainer, gameState);
  renderControls(
    controlsContainer,
    handleNewGame,
    handleDemoToggle,
    gameState.gameMode === 'demo'
  );

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
