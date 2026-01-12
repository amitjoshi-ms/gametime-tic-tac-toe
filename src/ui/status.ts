/**
 * Turn indicator and result message display.
 * Shows whose turn it is or the game result.
 *
 * @module ui/status
 */

import type { GameState } from '../game/types';

/**
 * Gets the display message for current game state.
 * Extended to handle computer thinking state and demo mode.
 *
 * @param state - Current game state
 * @returns Human-readable status message
 */
export function getStatusMessage(state: GameState): string {
  const isDemo = state.gameMode === 'demo';
  const prefix = isDemo ? '🎬 ' : '';

  // Handle computer thinking state.
  // Note: currentPlayer always represents whose turn it is. When isComputerThinking
  // is true, the active turn is being taken by a computer. In demo mode, BOTH X and O
  // are computers, so isComputerThinking can be true for either player depending on
  // whose turn it is (currentPlayer identifies which computer is currently thinking).
  if (state.isComputerThinking) {
    return `${prefix}${state.playerConfigs[state.currentPlayer].name} is thinking`;
  }

  const currentPlayerConfig = state.playerConfigs[state.currentPlayer];

  switch (state.status) {
    case 'x-wins': {
      const xConfig = state.playerConfigs.X;
      const showSymbol = xConfig.symbol !== 'X';
      return showSymbol
        ? `🎉 ${xConfig.name} (${xConfig.symbol}) Wins!`
        : `🎉 ${xConfig.name} Wins!`;
    }
    case 'o-wins': {
      const oConfig = state.playerConfigs.O;
      const showSymbol = oConfig.symbol !== 'O';
      return showSymbol
        ? `🎉 ${oConfig.name} (${oConfig.symbol}) Wins!`
        : `🎉 ${oConfig.name} Wins!`;
    }
    case 'draw':
      return `${prefix}It's a Draw!`;
    case 'playing':
    default: {
      const showSymbol = currentPlayerConfig.symbol !== state.currentPlayer;
      return showSymbol
        ? `${currentPlayerConfig.name} (${currentPlayerConfig.symbol})'s Turn`
        : `${currentPlayerConfig.name}'s Turn`;
    }
  }
}

/**
 * Gets the CSS modifier class for the status element.
 *
 * @param state - Current game state
 * @returns CSS class name for styling
 */
function getStatusClass(state: GameState): string {
  // Handle computer thinking state
  if (state.isComputerThinking) {
    return 'status--thinking';
  }

  switch (state.status) {
    case 'x-wins':
    case 'o-wins':
      return 'status--winner';
    case 'draw':
      return 'status--draw';
    case 'playing':
    default:
      return state.currentPlayer === 'X' ? 'status--x-turn' : 'status--o-turn';
  }
}

/**
 * Renders the status display (turn indicator or result).
 *
 * @param container - DOM element to render into
 * @param state - Current game state
 */
export function renderStatus(container: HTMLElement, state: GameState): void {
  const message = getStatusMessage(state);
  const statusClass = getStatusClass(state);

  container.textContent = message;
  container.className = `status ${statusClass}`;

  // Update ARIA for screen readers
  container.setAttribute('aria-live', 'polite');
  container.setAttribute('role', 'status');
}
