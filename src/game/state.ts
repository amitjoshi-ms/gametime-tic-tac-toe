/**
 * Game state management - the single source of truth.
 * Uses immutable state updates for predictable behavior.
 *
 * @module game/state
 */

import type {
  GameState,
  GameMode,
  Player,
  PlayerConfigs,
  RemoteSession,
  ConnectionStatus,
} from './types';
import { isValidMove, determineStatus } from './logic';
import { loadPlayerConfigs } from './playerNames';

/**
 * Tracks which player should start the next game.
 * Alternates between games to ensure fairness.
 */
let nextStartingPlayer: Player = 'X';

/**
 * Creates a fresh game state with empty board, always with X to play.
 * Unlike resetGame(), this function does NOT alternate starting players.
 *
 * @param playerConfigs - Optional custom player configs
 * @param gameMode - Optional game mode (defaults to 'human')
 * @returns Initial game state with X as the starting player
 */
export function createInitialState(
  playerConfigs?: PlayerConfigs,
  gameMode: GameMode = 'human'
): GameState {
  const configs = playerConfigs ?? loadPlayerConfigs();
  return {
    board: [null, null, null, null, null, null, null, null, null],
    currentPlayer: 'X',
    status: 'playing',
    playerConfigs: {
      X: { ...configs.X },
      O: { ...configs.O },
    },
    gameMode,
    isComputerThinking: false,
    remoteSession: null,
  };
}

/**
 * Attempts to place a mark at the given cell index.
 * Returns new state if valid, or same state reference if invalid move.
 *
 * @param state - Current game state
 * @param cellIndex - Index 0-8 of the cell to mark
 * @returns New game state (immutable update) or same state if invalid
 */
export function makeMove(state: GameState, cellIndex: number): GameState {
  // Validate move - also reject if computer is thinking
  if (
    !isValidMove(state.board, cellIndex, state.status) ||
    state.isComputerThinking
  ) {
    return state; // Return same reference to indicate no change
  }

  // Create new board with the move (using player's symbol)
  const newBoard = [...state.board];
  newBoard[cellIndex] = state.playerConfigs[state.currentPlayer].symbol;

  // Determine new status after this move
  const newStatus = determineStatus(newBoard, state.currentPlayer, state.playerConfigs);

  // Determine next player
  const nextPlayer: Player = state.currentPlayer === 'X' ? 'O' : 'X';

  return {
    board: newBoard,
    currentPlayer: nextPlayer,
    status: newStatus,
    playerConfigs: state.playerConfigs,
    gameMode: state.gameMode,
    isComputerThinking: false,
    remoteSession: state.remoteSession,
  };
}

/**
 * Resets the alternating starting player state to its initial value.
 * Primarily intended for test setups to ensure deterministic behavior.
 */
export function resetStartingPlayerState(): void {
  nextStartingPlayer = 'X';
}

/**
 * Resets the game to initial state with alternating starting player.
 * Each new game starts with the opposite player from the previous game
 * to ensure fairness. This alternating behavior applies to all game modes,
 * including demo mode where games auto-restart.
 *
 * @param currentMode - Current game mode to preserve (defaults to 'human')
 * @returns Fresh game state with alternating starting player
 */
export function resetGame(currentMode: GameMode = 'human'): GameState {
  const startingPlayer = nextStartingPlayer;
  // Toggle for next reset
  nextStartingPlayer = nextStartingPlayer === 'X' ? 'O' : 'X';

  return {
    board: [null, null, null, null, null, null, null, null, null],
    currentPlayer: startingPlayer,
    status: 'playing',
    playerConfigs: loadPlayerConfigs(),
    gameMode: currentMode,
    isComputerThinking: false,
    remoteSession: null,
  };
}

/**
 * Sets the computer thinking state.
 *
 * @param state - Current game state
 * @param isThinking - Whether computer is thinking
 * @returns New game state with thinking state updated
 */
export function setComputerThinking(
  state: GameState,
  isThinking: boolean
): GameState {
  if (state.isComputerThinking === isThinking) {
    return state; // No change needed
  }
  return {
    ...state,
    isComputerThinking: isThinking,
  };
}

/**
 * Checks if it's currently the computer's turn.
 *
 * @param state - Current game state
 * @returns True if computer should move
 */
export function isComputerTurn(state: GameState): boolean {
  return (
    state.gameMode === 'computer' &&
    state.currentPlayer === 'O' &&
    state.status === 'playing' &&
    !state.isComputerThinking
  );
}

// ============================================
// Remote Game State Functions
// ============================================

/**
 * Creates initial state for remote mode.
 *
 * @param isHost - Whether local player is creating the session
 * @param localName - Local player's display name
 * @returns New game state configured for remote play
 */
export function createRemoteGameState(
  isHost: boolean,
  localName: string
): GameState {
  const localSymbol: Player = isHost ? 'X' : 'O';

  const playerConfigs: PlayerConfigs = isHost
    ? {
        X: { name: localName, symbol: 'X' },
        O: { name: 'Opponent', symbol: 'O' },
      }
    : {
        X: { name: 'Opponent', symbol: 'X' },
        O: { name: localName, symbol: 'O' },
      };

  return {
    board: [null, null, null, null, null, null, null, null, null],
    currentPlayer: 'X',
    status: 'playing',
    playerConfigs,
    gameMode: 'remote',
    isComputerThinking: false,
    remoteSession: {
      sessionId: '',
      sessionCode: null,
      connectionStatus: 'idle',
      localPlayer: {
        name: localName,
        symbol: localSymbol,
        isLocal: true,
      },
      remotePlayer: null,
      error: null,
      isHost,
      lastStartingPlayer: 'X',
    },
  };
}

/**
 * Updates remote session in game state.
 *
 * @param state - Current state
 * @param session - Updated session info (partial)
 * @returns New state with updated session
 */
export function updateRemoteSession(
  state: GameState,
  session: Partial<RemoteSession>
): GameState {
  if (!state.remoteSession) {
    return state;
  }

  return {
    ...state,
    remoteSession: {
      ...state.remoteSession,
      ...session,
    },
  };
}

/**
 * Updates only the connection status in remote session.
 *
 * @param state - Current state
 * @param status - New connection status
 * @returns New state with updated connection status
 */
export function setConnectionStatus(
  state: GameState,
  status: ConnectionStatus
): GameState {
  return updateRemoteSession(state, { connectionStatus: status });
}

/**
 * Sets remote player info after handshake.
 *
 * @param state - Current state
 * @param remoteName - Remote player's name
 * @returns New state with remote player configured
 */
export function setRemotePlayer(
  state: GameState,
  remoteName: string
): GameState {
  if (!state.remoteSession) {
    return state;
  }

  const remoteSymbol: Player = state.remoteSession.isHost ? 'O' : 'X';

  return {
    ...state,
    playerConfigs: {
      ...state.playerConfigs,
      [remoteSymbol]: { name: remoteName, symbol: remoteSymbol },
    },
    remoteSession: {
      ...state.remoteSession,
      connectionStatus: 'connected',
      remotePlayer: {
        name: remoteName,
        symbol: remoteSymbol,
        isLocal: false,
      },
    },
  };
}

/**
 * Clears remote session and returns to normal mode.
 *
 * @param state - Current state
 * @returns New state without remote session
 */
export function clearRemoteSession(state: GameState): GameState {
  return {
    ...state,
    gameMode: 'human',
    remoteSession: null,
  };
}

/**
 * Resets the remote game board while keeping current symbols.
 * Used for "New Game" button during gameplay.
 *
 * @param state - Current state
 * @returns New state with reset board, same symbols
 */
export function resetRemoteGameKeepSymbols(state: GameState): GameState {
  if (!state.remoteSession) {
    return state;
  }

  return {
    ...state,
    board: [null, null, null, null, null, null, null, null, null],
    currentPlayer: 'X',
    status: 'playing',
  };
}

/**
 * Resets the remote game board for a rematch.
 * Keeps symbols fixed but alternates the starting player.
 * In remote mode, player symbols remain constant throughout
 * the session - only who goes first changes each game.
 *
 * @param state - Current state
 * @returns New state with reset board and alternating starting player
 */
export function resetRemoteGame(state: GameState): GameState {
  if (!state.remoteSession?.remotePlayer) {
    return state;
  }

  // Alternate starting player: whoever started last game doesn't start this one
  const lastStarter = state.remoteSession.lastStartingPlayer;
  const nextStartingPlayer: Player = lastStarter === 'X' ? 'O' : 'X';

  return {
    ...state,
    board: [null, null, null, null, null, null, null, null, null],
    currentPlayer: nextStartingPlayer,
    status: 'playing',
    remoteSession: {
      ...state.remoteSession,
      lastStartingPlayer: nextStartingPlayer,
    },
    // Keep playerConfigs unchanged - symbols stay the same throughout session
  };
}

/**
 * Resets a remote game with a specified starting player.
 * Used when receiving rematch acceptance from remote peer.
 *
 * @param state - Current state
 * @param startingPlayer - Which player should start
 * @returns New state with reset board and specified starting player
 */
export function resetRemoteGameWithStarter(
  state: GameState,
  startingPlayer: Player
): GameState {
  if (!state.remoteSession?.remotePlayer) {
    return state;
  }

  return {
    ...state,
    board: [null, null, null, null, null, null, null, null, null],
    currentPlayer: startingPlayer,
    status: 'playing',
    remoteSession: {
      ...state.remoteSession,
      lastStartingPlayer: startingPlayer,
    },
    // Keep playerConfigs unchanged - symbols stay the same throughout session
  };
}
