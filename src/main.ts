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
  createRemoteGameState,
  updateRemoteSession,
  clearRemoteSession,
  resetRemoteGame,
  resetRemoteGameKeepSymbols,
} from './game/state';
import { savePlayerConfigs, loadPlayerConfigs, getLocalPlayerName, saveLocalPlayerName, getComputerConfig, saveComputerConfig } from './game/playerNames';
import { scheduleComputerMove, scheduleDemoRestart } from './game/computer';
import {
  createRemoteSession,
  joinRemoteSession,
  completeHostConnection,
} from './game/remote';
import { copyToClipboard } from './network/signaling';
import { loadGameMode, saveGameMode } from './utils/storage';
import { renderBoard, updateBoard } from './ui/board';
import { renderStatus } from './ui/status';
import { renderControls, updateControls, type ControlsOptions } from './ui/controls';
import { renderPlayerNames, updatePlayerNames } from './ui/playerNames';
import { renderModeSelector, updateModeSelector } from './ui/modeSelector';
import {
  renderRemotePanel,
  updateRemotePanel,
  type RemotePanelState,
} from './ui/remotePanel';
import type { GameState, GameMode, PlayerConfigs } from './game/types';
import { AVAILABLE_SYMBOLS } from './game/types';

/**
 * Applies mode-specific player configs to the game state.
 * Computer mode uses separate storage for the computer opponent's config.
 * @param state - Current game state
 * @returns Updated game state with mode-specific configs
 */
function applyModeSpecificConfigs(state: GameState): GameState {
  if (state.gameMode === 'computer') {
    const computerConfig = getComputerConfig();
    return {
      ...state,
      playerConfigs: {
        ...state.playerConfigs,
        O: {
          name: computerConfig.name,
          symbol: computerConfig.symbol,
        },
      },
    };
  }
  return state;
}

/** Current game state - module-level for simplicity */
let gameState: GameState = applyModeSpecificConfigs(resetGame(loadGameMode()));

/** Cancel function for pending computer move */
let cancelPendingMove: (() => void) | null = null;

/** Cancel function for pending demo restart timer */
let cancelRestartTimer: (() => void) | null = null;

/** Previous game mode before demo started (to restore on stop) */
let preDemoMode: GameMode | null = null;

/** Remote session controller for sending messages */
let remoteController: Awaited<ReturnType<typeof createRemoteSession>>['controller'] | null = null;

/** Cleanup function for remote session */
let remoteCleanup: (() => void) | null = null;

/** Current remote panel state */
let remotePanelState: RemotePanelState = { phase: 'select' };

/** Remote panel handlers (set during initApp) */
let remotePanelHandlers: Parameters<typeof renderRemotePanel>[2] | null = null;

/** Whether we sent a rematch request and are waiting for response */
let isRematchPending = false;

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

  // For remote mode, send move via controller and apply locally
  if (gameState.gameMode === 'remote' && remoteController) {
    // Board interactivity is already handled in ui/board.ts via isBoardInteractive()
    // This is a defensive check - the click handler shouldn't be called for invalid moves
    const newState = makeMove(gameState, cellIndex);
    if (newState !== gameState && gameState.remoteSession?.localPlayer) {
      // Send the move to the remote player with current symbol
      const localSymbol = gameState.remoteSession.localPlayer.symbol;
      remoteController.sendMove(cellIndex, localSymbol);
      // Apply move locally
      gameState = newState;
      updateUI();
    }
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
 * In remote mode, resets the game and syncs with remote player.
 */
function handleNewGame(): void {
  // Cancel any pending computer move
  if (cancelPendingMove) {
    cancelPendingMove();
    cancelPendingMove = null;
  }

  // In remote mode when connected, use rematch request flow for confirmation
  if (gameState.gameMode === 'remote' && gameState.remoteSession?.connectionStatus === 'connected') {
    if (remoteController && !isRematchPending) {
      // Send rematch request to remote player for confirmation
      remoteController.requestRematch();
      isRematchPending = true;
      updateUI();
    }
    return;
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

  // Clean up any existing remote session when switching modes
  if (remoteCleanup) {
    remoteCleanup();
    remoteCleanup = null;
  }
  remoteController = null;
  remotePanelState = { phase: 'select' };

  // Save mode to localStorage (except for remote and demo which are transient)
  if (mode !== 'remote' && mode !== 'demo') {
    saveGameMode(mode);
  }

  // Reset game with new mode
  gameState = resetGame(mode);

  // Update player configs based on mode
  if (mode === 'computer') {
    // Use saved computer config (name and symbol) - separate from Player O
    gameState = applyModeSpecificConfigs(gameState);
    // Don't save to player_configs - computer config is stored separately
  } else if (mode === 'demo') {
    // Demo mode uses temporary names - don't persist
    gameState = {
      ...gameState,
      playerConfigs: {
        X: { name: 'Computer X', symbol: 'X' },
        O: { name: 'Computer O', symbol: 'O' },
      },
    };
  } else {
    // Human mode: restore saved configs from localStorage
    gameState = { ...gameState, playerConfigs: loadPlayerConfigs() };
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
  // Update game state with new configs
  gameState = {
    ...gameState,
    playerConfigs: configs,
  };

  // Persist based on mode
  if (gameState.gameMode === 'demo') {
    // Demo mode: don't persist any changes
  } else if (gameState.gameMode === 'computer') {
    // Computer mode: save X's config to player_configs, O's config to computer_config
    savePlayerConfigs({
      ...loadPlayerConfigs(),
      X: configs.X,
    });
    saveComputerConfig(configs.O.name, configs.O.symbol);
  } else if (gameState.gameMode === 'remote') {
    // Remote mode: save local player name to remote_name
    if (gameState.remoteSession?.connectionStatus === 'connected' && remoteController) {
      const localPlayerKey = gameState.remoteSession.localPlayer.symbol;
      const localConfig = configs[localPlayerKey];
      // Send the actual display symbol, not the player key (X/O)
      remoteController.updatePlayer(localConfig.name, localConfig.symbol);
      // Save the remote name separately for future remote sessions
      saveLocalPlayerName(localConfig.name);
    }
  } else {
    // Human mode: save all configs to localStorage
    savePlayerConfigs(configs);
  }

  // Update UI to reflect new configs
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
  // Save current player configs for restart
  const currentConfigs = gameState.playerConfigs;

  // Schedule auto-restart after DEMO_RESTART_DELAY
  cancelRestartTimer = scheduleDemoRestart(() => {
    // Clear timer reference before executing callback to prevent race condition
    // with stopDemo() being called while this callback is executing
    cancelRestartTimer = null;

    // Only restart if still in demo mode
    if (gameState.gameMode === 'demo') {
      // Reset game and start new demo with same configs.
      // Note: resetGame() alternates the starting player for fairness,
      // so consecutive demo games will alternate between X and O starting.
      gameState = resetGame('demo');
      gameState = {
        ...gameState,
        playerConfigs: currentConfigs,
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

  // Get the current player configs from state (which reflects form inputs)
  const currentConfigs = gameState.playerConfigs;

  // Reset game with demo mode
  gameState = resetGame('demo');

  // Use the current player configs (user-entered configs) for the demo
  gameState = {
    ...gameState,
    playerConfigs: currentConfigs,
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

// =============================================================================
// Remote Multiplayer Handlers
// =============================================================================

/**
 * Handles creating a new remote session (host flow).
 */
async function handleCreateSession(): Promise<void> {
  // Use the persisted local player name from localStorage
  const localName = getLocalPlayerName();

  // Update UI to show creating state
  remotePanelState = { phase: 'creating' };
  gameState = createRemoteGameState(true, localName);
  gameState = updateRemoteSession(gameState, { connectionStatus: 'connecting' });
  updateUI();

  try {
    const result = await createRemoteSession(localName, {
      onConnected: handleRemoteConnected,
      onRemoteMove: handleRemoteMove,
      onDisconnected: handleRemoteDisconnect,
      onError: handleRemoteError,
      onRematchRequested: handleRematchRequest,
      onRematchResponse: handleRematchResponse,
      onGameReset: handleRemoteGameReset,
      onPlayerUpdate: handleRemotePlayerUpdate,
    });

    // Store controller and cleanup
    remoteController = result.controller;
    remoteCleanup = result.cleanup;

    // Update state with session info
    gameState = updateRemoteSession(gameState, {
      sessionId: result.sessionId,
      sessionCode: result.sessionCode,
      connectionStatus: 'waiting-for-peer',
    });

    // Update panel to waiting state
    remotePanelState = {
      phase: 'waiting',
      sessionId: result.sessionId,
      sessionCode: result.sessionCode,
      codeCopied: false,
    };
    updateUI();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create session';
    remotePanelState = { phase: 'error', error: message };
    gameState = updateRemoteSession(gameState, {
      connectionStatus: 'error',
      error: message,
    });
    updateUI();
  }
}

/**
 * Handles joining an existing remote session (guest flow).
 * @param sessionCode - The session code from the host
 */
async function handleJoinSession(sessionCode: string): Promise<void> {
  // Use the persisted local player name from localStorage
  const localName = getLocalPlayerName();

  // Update UI to show joining state
  remotePanelState = { phase: 'joining' };
  gameState = createRemoteGameState(false, localName);
  gameState = updateRemoteSession(gameState, { connectionStatus: 'connecting' });
  updateUI();

  try {
    const result = await joinRemoteSession(sessionCode, localName, {
      onConnected: handleRemoteConnected,
      onRemoteMove: handleRemoteMove,
      onDisconnected: handleRemoteDisconnect,
      onError: handleRemoteError,
      onRematchRequested: handleRematchRequest,
      onRematchResponse: handleRematchResponse,
      onGameReset: handleRemoteGameReset,
      onPlayerUpdate: handleRemotePlayerUpdate,
    });

    // Store controller and cleanup
    remoteController = result.controller;
    remoteCleanup = result.cleanup;

    // Update panel to answer-input state (guest needs to send answer back)
    remotePanelState = {
      phase: 'answer-input',
      sessionCode: result.answerCode,
    };
    updateUI();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to join session';
    remotePanelState = { phase: 'error', error: message };
    gameState = updateRemoteSession(gameState, {
      connectionStatus: 'error',
      error: message,
    });
    updateUI();
  }
}

/**
 * Handles host receiving the answer code from guest.
 * @param answerCode - The answer code from the guest
 */
async function handleAnswerSubmit(answerCode: string): Promise<void> {
  // Update UI to show connecting state
  remotePanelState = { phase: 'connecting' };
  updateUI();

  try {
    await completeHostConnection(answerCode);
    // Connection will trigger onConnected callback
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to connect';
    remotePanelState = { phase: 'error', error: message };
    gameState = updateRemoteSession(gameState, {
      connectionStatus: 'error',
      error: message,
    });
    updateUI();
  }
}

/**
 * Handles copying the session code to clipboard.
 */
async function handleCopyCode(): Promise<void> {
  const code = remotePanelState.sessionCode;
  if (!code) return;

  try {
    await copyToClipboard(code);
    remotePanelState = { ...remotePanelState, codeCopied: true };
    updateUI();
  } catch {
    // Clipboard API not available, user can select and copy manually
  }
}

/**
 * Handles leaving/canceling a remote session.
 */
function handleLeaveSession(): void {
  // Clean up remote session
  if (remoteCleanup) {
    remoteCleanup();
    remoteCleanup = null;
  }
  remoteController = null;
  remotePanelState = { phase: 'select' };

  // Clear remote session from game state
  gameState = clearRemoteSession(gameState);
  updateUI();
}

/**
 * Handles successful remote connection.
 * @param remoteName - Name of the remote player
 */
function handleRemoteConnected(remoteName: string): void {
  // Update game state with remote player info
  const remotePlayerKey = gameState.remoteSession?.localPlayer.symbol === 'X' ? 'O' : 'X';
  gameState = updateRemoteSession(gameState, {
    connectionStatus: 'connected',
    remotePlayer: {
      name: remoteName,
      symbol: remotePlayerKey,
      isLocal: false,
    },
  });

  // Update player configs with remote player's name
  const remoteDisplaySymbol = gameState.playerConfigs[remotePlayerKey].symbol;
  gameState = {
    ...gameState,
    playerConfigs: {
      ...gameState.playerConfigs,
      [remotePlayerKey]: { name: remoteName, symbol: remoteDisplaySymbol },
    },
  };

  // Update panel to connected state with remote player's display symbol
  remotePanelState = {
    phase: 'connected',
    remoteName,
    remoteSymbol: remoteDisplaySymbol,
  };
  updateUI();
}

/**
 * Handles receiving a move from the remote player.
 * @param cellIndex - The cell index where the remote player moved
 */
function handleRemoteMove(cellIndex: number): void {
  // Apply the move to game state
  const newState = makeMove(gameState, cellIndex);
  if (newState !== gameState) {
    gameState = newState;
    updateUI();
  }
}

/**
 * Handles remote player disconnection.
 * @param reason - Optional reason for disconnection
 */
function handleRemoteDisconnect(reason?: string): void {
  const message = reason ?? 'Remote player disconnected';
  remotePanelState = {
    phase: 'disconnected',
    error: message,
    ...(remotePanelState.remoteName ? { remoteName: remotePanelState.remoteName } : {}),
  };
  gameState = updateRemoteSession(gameState, {
    connectionStatus: 'disconnected',
    error: message,
  });

  // Clean up controller reference but keep remoteCleanup for full cleanup on leave
  remoteController = null;
  isRematchPending = false;
  updateUI();
}

/**
 * Handles remote connection error.
 * @param error - Error message
 */
function handleRemoteError(error: string): void {
  remotePanelState = { phase: 'error', error };
  gameState = updateRemoteSession(gameState, {
    connectionStatus: 'error',
    error,
  });
  updateUI();
}

/**
 * Handles game reset from remote player (they clicked New Game).
 */
function handleRemoteGameReset(): void {
  // Reset locally - preserve player configs and connection
  gameState = resetRemoteGameKeepSymbols(gameState);
  isRematchPending = false;
  updateUI();
}

/**
 * Handles player info update from remote player (name/symbol changed).
 * If remote player picks the same symbol as local player, we assign a
 * temporary different symbol to the remote player locally. The local
 * player's symbol is never changed - they chose it intentionally.
 * @param name - New player name
 * @param symbol - New player symbol (display character)
 */
function handleRemotePlayerUpdate(name: string, symbol: string): void {
  if (!gameState.remoteSession?.remotePlayer) {
    return;
  }

  const remotePlayerKey = gameState.remoteSession.remotePlayer.symbol;
  const localPlayerKey = gameState.remoteSession.localPlayer.symbol;
  const localSymbol = gameState.playerConfigs[localPlayerKey].symbol;

  // Check for symbol conflict - assign temporary symbol to remote player if needed
  let displaySymbol = symbol;
  if (symbol === localSymbol) {
    // Remote player chose the same symbol as local player
    // Assign a different symbol to remote player locally (they won't know)
    displaySymbol = AVAILABLE_SYMBOLS.find((s) => s !== localSymbol) ?? 'O';
  }

  gameState = {
    ...gameState,
    playerConfigs: {
      ...gameState.playerConfigs,
      [remotePlayerKey]: { name, symbol: displaySymbol },
    },
    remoteSession: {
      ...gameState.remoteSession,
      remotePlayer: {
        ...gameState.remoteSession.remotePlayer,
        name,
      },
    },
  };

  // Update panel with new name and resolved symbol
  remotePanelState = {
    ...remotePanelState,
    remoteName: name,
    remoteSymbol: displaySymbol,
  };
  updateUI();
}

/**
 * Handles receiving a rematch request from remote player.
 * Shows UI to accept/decline the rematch.
 * If we already sent a request (race condition), treat as mutual acceptance.
 */
function handleRematchRequest(): void {
  // Race condition: both players clicked rematch at the same time
  // Treat as mutual acceptance - both wanted a rematch
  if (isRematchPending) {
    isRematchPending = false;
    // Send acceptance back (they'll get our request, we auto-accept theirs)
    remoteController?.respondToRematch(true);
    // Reset the game (symbols stay the same, starting player alternates)
    gameState = resetRemoteGame(gameState);
    remotePanelState = {
      ...remotePanelState,
      phase: 'connected',
    };
    updateUI();
    return;
  }

  remotePanelState = {
    ...remotePanelState,
    phase: 'rematch-request',
  };
  updateUI();
}

/**
 * Handles receiving a rematch response from remote player.
 * @param accepted - Whether the rematch was accepted
 */
function handleRematchResponse(accepted: boolean): void {
  isRematchPending = false;

  if (accepted) {
    // Reset the game (symbols stay the same, starting player alternates)
    gameState = resetRemoteGame(gameState);
    remotePanelState = {
      ...remotePanelState,
      phase: 'connected',
    };
  } else {
    // Opponent declined - stay in connected state, they can try again
    remotePanelState = {
      ...remotePanelState,
      phase: 'connected',
    };
  }
  updateUI();
}

/**
 * Handles user clicking "Request Rematch" button.
 */
function handleRequestRematch(): void {
  if (!remoteController) {
    return;
  }

  isRematchPending = true;
  remoteController.requestRematch();
  updateUI();
}

/**
 * Handles user accepting a rematch request.
 */
function handleRematchAccept(): void {
  if (!remoteController) {
    return;
  }

  remoteController.respondToRematch(true);
  // Reset the game (symbols stay the same, starting player alternates)
  gameState = resetRemoteGame(gameState);
  remotePanelState = {
    ...remotePanelState,
    phase: 'connected',
  };
  updateUI();
}

/**
 * Handles user declining a rematch request.
 */
function handleRematchDecline(): void {
  if (!remoteController) {
    return;
  }

  remoteController.respondToRematch(false);
  // Stay in connected state
  remotePanelState = {
    ...remotePanelState,
    phase: 'connected',
  };
  updateUI();
}

/**
 * Updates all UI components to reflect current game state.
 */
function updateUI(): void {
  const modeSelectorContainer = document.getElementById('mode-selector');
  const playerNamesContainer = document.getElementById('player-names');
  const remotePanelContainer = document.getElementById('remote-panel');
  const boardContainer = document.getElementById('board');
  const statusContainer = document.getElementById('status');
  const controlsContainer = document.getElementById('controls');

  const isDemoActive = gameState.gameMode === 'demo';
  const isRemoteMode = gameState.gameMode === 'remote';

  if (modeSelectorContainer) {
    // Disable mode selector during demo mode or active remote session
    const isDisabled = isDemoActive || (isRemoteMode && remotePanelState.phase !== 'select');
    updateModeSelector(modeSelectorContainer, gameState.gameMode, isDisabled);
  }

  // Show/hide remote panel based on mode
  if (remotePanelContainer && remotePanelHandlers) {
    if (isRemoteMode) {
      remotePanelContainer.style.display = 'block';
      updateRemotePanel(remotePanelContainer, remotePanelState, remotePanelHandlers);
    } else {
      remotePanelContainer.style.display = 'none';
    }
  }

  // Show/hide player names (hide in remote mode when not connected)
  if (playerNamesContainer) {
    if (isRemoteMode && remotePanelState.phase !== 'connected') {
      playerNamesContainer.style.display = 'none';
    } else {
      playerNamesContainer.style.display = '';
      // Pass remote mode options so inputs are properly disabled
      const playerNamesOptions = isRemoteMode && gameState.remoteSession
        ? { isRemoteMode: true, localPlayerSymbol: gameState.remoteSession.localPlayer.symbol }
        : undefined;
      updatePlayerNames(playerNamesContainer, gameState.playerConfigs, playerNamesOptions);
    }
  }

  // Show/hide board (hide in remote mode when not connected)
  if (boardContainer) {
    if (isRemoteMode && remotePanelState.phase !== 'connected') {
      boardContainer.style.display = 'none';
    } else {
      boardContainer.style.display = '';
      updateBoard(boardContainer, gameState);
    }
  }

  if (statusContainer) {
    if (isRemoteMode && remotePanelState.phase !== 'connected') {
      statusContainer.style.display = 'none';
    } else {
      statusContainer.style.display = '';
      renderStatus(statusContainer, gameState);
    }
  }

  if (controlsContainer) {
    if (isRemoteMode && remotePanelState.phase !== 'connected') {
      controlsContainer.style.display = 'none';
    } else {
      controlsContainer.style.display = '';
      const controlsOptions: ControlsOptions = {
        isDemoActive,
        gameMode: gameState.gameMode,
        gameStatus: gameState.status,
        isRematchPending,
        onRematch: handleRequestRematch,
      };
      updateControls(controlsContainer, controlsOptions);
    }
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
    <div id="remote-panel" class="remote-panel-container" style="display: none;"></div>
    <div id="player-names" class="player-names-container"></div>
    <div id="status" class="status"></div>
    <div id="board" class="board"></div>
    <div id="controls" class="controls"></div>
  `;

  // Get container references
  const modeSelectorContainer = document.getElementById('mode-selector');
  const remotePanelContainer = document.getElementById('remote-panel');
  const playerNamesContainer = document.getElementById('player-names');
  const boardContainer = document.getElementById('board');
  const statusContainer = document.getElementById('status');
  const controlsContainer = document.getElementById('controls');

  if (
    !modeSelectorContainer ||
    !remotePanelContainer ||
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

  // Initialize remote panel handlers (store for updates)
  remotePanelHandlers = {
    onCreate: handleCreateSession,
    onJoin: handleJoinSession,
    onCopyCode: handleCopyCode,
    onLeave: handleLeaveSession,
    onAnswerSubmit: handleAnswerSubmit,
    onRematchAccept: handleRematchAccept,
    onRematchDecline: handleRematchDecline,
  };

  // Initialize remote panel (hidden by default)
  renderRemotePanel(remotePanelContainer, remotePanelState, remotePanelHandlers);

  const playerNamesOptions = gameState.gameMode === 'remote' && gameState.remoteSession
    ? {
        isRemoteMode: true,
        localPlayerSymbol: gameState.remoteSession.localPlayer.symbol,
      }
    : {};

  renderPlayerNames(
    playerNamesContainer,
    gameState.playerConfigs,
    handleConfigChange,
    playerNamesOptions
  );
  renderBoard(boardContainer, gameState, handleCellClick);
  renderStatus(statusContainer, gameState);

  const controlsOptions: ControlsOptions = {
    isDemoActive: gameState.gameMode === 'demo',
    gameMode: gameState.gameMode,
    gameStatus: gameState.status,
    isRematchPending,
    onRematch: handleRequestRematch,
  };
  renderControls(
    controlsContainer,
    handleNewGame,
    handleDemoToggle,
    controlsOptions
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
