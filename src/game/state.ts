/**
 * Game state management - the single source of truth.
 * Uses immutable state updates for predictable behavior.
 *
 * @module game/state
 */

import type { GameState, GameMode, Player, PlayerConfigs } from './types';
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
