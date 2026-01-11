/**
 * Player name editor UI component.
 * Allows players to customize their display names.
 *
 * @module ui/playerNames
 */

import type { PlayerNames } from '../game/types';

/**
 * Callback signature for player name changes.
 */
export type PlayerNameChangeHandler = (names: PlayerNames) => void;

/** Reference to current change handler */
let currentChangeHandler: PlayerNameChangeHandler | null = null;

/**
 * Handles input blur events on player name fields.
 * Only saves when user leaves the field, allowing empty intermediate states.
 */
function handleNameBlur(event: Event): void {
  if (!currentChangeHandler) return;

  const target = event.target as HTMLInputElement;
  const player = target.dataset.player as 'X' | 'O' | undefined;
  if (!player) return;

  // Get current values from both inputs
  const xInput = document.getElementById('player-x-name') as HTMLInputElement | null;
  const oInput = document.getElementById('player-o-name') as HTMLInputElement | null;

  if (xInput !== null && oInput !== null) {
    const names: PlayerNames = {
      X: xInput.value.trim() || 'Player X',
      O: oInput.value.trim() || 'Player O',
    };
    currentChangeHandler(names);
  }
}

/**
 * Escapes HTML special characters to prevent XSS.
 *
 * @param str - String to escape
 * @returns HTML-escaped string
 */
function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Renders the player name editor UI.
 *
 * @param container - DOM element to render into
 * @param playerNames - Current player names
 * @param onChange - Handler for name changes
 */
export function renderPlayerNames(
  container: HTMLElement,
  playerNames: PlayerNames,
  onChange: PlayerNameChangeHandler
): void {
  currentChangeHandler = onChange;

  container.innerHTML = `
    <div class="player-names">
      <div class="player-name-field">
        <label for="player-x-name" class="player-name-label player-name-label--x">
          <span class="player-mark">X</span>
        </label>
        <input
          type="text"
          id="player-x-name"
          class="player-name-input"
          data-player="X"
          value="${escapeHtml(playerNames.X)}"
          placeholder="Player X"
          maxlength="20"
          aria-label="Player X name"
        />
      </div>
      <div class="player-name-field">
        <label for="player-o-name" class="player-name-label player-name-label--o">
          <span class="player-mark">O</span>
        </label>
        <input
          type="text"
          id="player-o-name"
          class="player-name-input"
          data-player="O"
          value="${escapeHtml(playerNames.O)}"
          placeholder="Player O"
          maxlength="20"
          aria-label="Player O name"
        />
      </div>
    </div>
  `;

  // Set up event listeners - only save on blur to allow clearing the field
  const inputs = container.querySelectorAll('.player-name-input');
  inputs.forEach((input) => {
    input.addEventListener('blur', handleNameBlur);
  });
}

/**
 * Updates the player name display without full re-render.
 *
 * @param container - DOM element containing the player names
 * @param playerNames - Current player names
 */
export function updatePlayerNames(
  container: HTMLElement,
  playerNames: PlayerNames
): void {
  const xInput = container.querySelector('#player-x-name');
  const oInput = container.querySelector('#player-o-name');

  if (xInput instanceof HTMLInputElement && xInput.value !== playerNames.X) {
    xInput.value = playerNames.X;
  }
  if (oInput instanceof HTMLInputElement && oInput.value !== playerNames.O) {
    oInput.value = playerNames.O;
  }
}
