/**
 * Player configuration editor UI component.
 * Allows players to customize their display names and symbols.
 *
 * @module ui/playerNames
 */

import type { PlayerConfigs, Player, PlayerSymbol } from '../game/types';
import { DEFAULT_X_NAME, DEFAULT_O_NAME } from '../game/playerNames';
import {
  renderSymbolSelectors,
  updateSymbolSelectors,
} from './symbolSelector';

/**
 * Callback signature for player config changes.
 */
export type PlayerConfigChangeHandler = (configs: PlayerConfigs) => void;

/** Reference to current change handler */
let currentChangeHandler: PlayerConfigChangeHandler | null = null;

/** Reference to current player configs */
let currentConfigs: PlayerConfigs | null = null;

/**
 * Handles input blur events on player name fields.
 * Only saves when user leaves the field, allowing empty intermediate states.
 */
function handleNameBlur(event: Event): void {
  if (!currentChangeHandler || !currentConfigs) return;

  const target = event.target as HTMLInputElement;
  const player = target.dataset.player as Player | undefined;
  if (!player) return;

  // Get current values from both inputs
  const xInput = document.getElementById('player-x-name') as HTMLInputElement | null;
  const oInput = document.getElementById('player-o-name') as HTMLInputElement | null;

  if (xInput !== null && oInput !== null) {
    const configs: PlayerConfigs = {
      X: {
        name: xInput.value.trim() || DEFAULT_X_NAME,
        symbol: currentConfigs.X.symbol,
      },
      O: {
        name: oInput.value.trim() || DEFAULT_O_NAME,
        symbol: currentConfigs.O.symbol,
      },
    };
    currentChangeHandler(configs);
  }
}

/**
 * Handles symbol selection changes.
 *
 * @param player - Which player changed their symbol
 * @param symbol - New symbol selected
 */
function handleSymbolChange(player: Player, symbol: PlayerSymbol): void {
  if (!currentChangeHandler || !currentConfigs) return;

  const configs: PlayerConfigs = {
    X: player === 'X' ? { ...currentConfigs.X, symbol } : currentConfigs.X,
    O: player === 'O' ? { ...currentConfigs.O, symbol } : currentConfigs.O,
  };

  currentChangeHandler(configs);
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
 * Renders the player configuration editor UI (names and symbols).
 *
 * @param container - DOM element to render into
 * @param playerConfigs - Current player configurations
 * @param onChange - Handler for config changes
 */
export function renderPlayerNames(
  container: HTMLElement,
  playerConfigs: PlayerConfigs,
  onChange: PlayerConfigChangeHandler
): void {
  currentChangeHandler = onChange;
  currentConfigs = playerConfigs;

  container.innerHTML = `
    <div class="player-configs">
      <div class="player-config-field">
        <label for="player-x-name" class="player-name-label player-name-label--x">
          <span class="player-mark">${escapeHtml(playerConfigs.X.symbol)}</span>
        </label>
        <input
          type="text"
          id="player-x-name"
          class="player-name-input"
          data-player="X"
          value="${escapeHtml(playerConfigs.X.name)}"
          placeholder="${DEFAULT_X_NAME}"
          maxlength="20"
          aria-label="Player X name"
        />
        <div id="symbol-selector-x-container" class="symbol-selector-container"></div>
      </div>
      <div class="player-config-field">
        <label for="player-o-name" class="player-name-label player-name-label--o">
          <span class="player-mark">${escapeHtml(playerConfigs.O.symbol)}</span>
        </label>
        <input
          type="text"
          id="player-o-name"
          class="player-name-input"
          data-player="O"
          value="${escapeHtml(playerConfigs.O.name)}"
          placeholder="${DEFAULT_O_NAME}"
          maxlength="20"
          aria-label="Player O name"
        />
        <div id="symbol-selector-o-container" class="symbol-selector-container"></div>
      </div>
    </div>
  `;

  // Set up event listeners for name inputs
  const inputs = container.querySelectorAll('.player-name-input');
  inputs.forEach((input) => {
    input.addEventListener('blur', handleNameBlur);
  });

  // Render symbol selectors
  const symbolContainer = document.createElement('div');
  symbolContainer.className = 'symbol-selectors-wrapper';
  renderSymbolSelectors(
    symbolContainer,
    playerConfigs.X.symbol,
    playerConfigs.O.symbol,
    handleSymbolChange
  );
  container.appendChild(symbolContainer);
}

/**
 * Updates the player config display without full re-render.
 *
 * @param container - DOM element containing the player configs
 * @param playerConfigs - Current player configurations
 */
export function updatePlayerNames(
  container: HTMLElement,
  playerConfigs: PlayerConfigs
): void {
  currentConfigs = playerConfigs;

  const xInput = container.querySelector('#player-x-name');
  const oInput = container.querySelector('#player-o-name');

  if (xInput instanceof HTMLInputElement && xInput.value !== playerConfigs.X.name) {
    xInput.value = playerConfigs.X.name;
  }
  if (oInput instanceof HTMLInputElement && oInput.value !== playerConfigs.O.name) {
    oInput.value = playerConfigs.O.name;
  }

  // Update player marks
  const xMark = container.querySelector('.player-name-label--x .player-mark');
  const oMark = container.querySelector('.player-name-label--o .player-mark');

  if (xMark) {
    xMark.textContent = playerConfigs.X.symbol;
  }
  if (oMark) {
    oMark.textContent = playerConfigs.O.symbol;
  }

  // Update symbol selectors
  const symbolWrapper = container.querySelector('.symbol-selectors-wrapper');
  if (symbolWrapper) {
    updateSymbolSelectors(
      symbolWrapper as HTMLElement,
      playerConfigs.X.symbol,
      playerConfigs.O.symbol
    );
  }
}
