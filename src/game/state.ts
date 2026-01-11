/**
 * Game state management - the single source of truth.
 * Uses immutable state updates for predictable behavior.
 *
 * @module game/state
 */

import type { GameState, Player, PlayerNames } from './types';
import { isValidMove, determineStatus } from './logic';
import { loadPlayerNames } from './playerNames';

/**
 * Tracks which player should start the next game.
 * Alternates between games to ensure fairness.
 */
let nextStartingPlayer: Player = 'X';

/**
 * Creates a fresh game state with empty board, always with X to play.
 * Note: For alternating starting players, use resetGame() instead.
 *
 * @returns Initial game state with X as the starting player
 */
export function createInitialState(playerNames?: PlayerNames): GameState {
  return {
    board: [null, null, null, null, null, null, null, null, null],
    currentPlayer: 'X',
    status: 'playing',
    playerNames: playerNames ?? loadPlayerNames(),
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
  // Validate move
  if (!isValidMove(state.board, cellIndex, state.status)) {
    return state; // Return same reference to indicate no change
  }

  // Create new board with the move
  const newBoard = [...state.board];
  newBoard[cellIndex] = state.currentPlayer;

  // Determine new status after this move
  const newStatus = determineStatus(newBoard, state.currentPlayer);

  // Determine next player
  const nextPlayer: Player = state.currentPlayer === 'X' ? 'O' : 'X';

  return {
    board: newBoard,
    currentPlayer: nextPlayer,
    status: newStatus,
    playerNames: state.playerNames,
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
 * Each new game starts with the opposite player from the previous game.
 *
 * @returns Fresh game state with alternating starting player
 */
export function resetGame(): GameState {
  const startingPlayer = nextStartingPlayer;
  // Toggle for next reset
  nextStartingPlayer = nextStartingPlayer === 'X' ? 'O' : 'X';

  return {
    board: [null, null, null, null, null, null, null, null, null],
    currentPlayer: startingPlayer,
    status: 'playing',
  };
}
