/**
 * Turn indicator and result message display.
 * Shows whose turn it is or the game result.
 *
 * @module ui/status
 */

import type { GameState } from '../game/types';

/**
 * Gets the display message for current game state.
 *
 * @param state - Current game state
 * @returns Human-readable status message
 */
export function getStatusMessage(state: GameState): string {
  switch (state.status) {
    case 'x-wins':
      return '🎉 Player X Wins!';
    case 'o-wins':
      return '🎉 Player O Wins!';
    case 'draw':
      return "It's a Draw!";
    case 'playing':
    default:
      return `Player ${state.currentPlayer}'s Turn`;
  }
}

/**
 * Gets the CSS modifier class for the status element.
 *
 * @param state - Current game state
 * @returns CSS class name for styling
 */
function getStatusClass(state: GameState): string {
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
