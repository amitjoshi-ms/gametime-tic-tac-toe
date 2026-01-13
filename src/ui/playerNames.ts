/**
 * Player configuration editor UI component.
 * Allows players to customize their display names and symbols.
 *
 * @module ui/playerNames
 */

import type { PlayerConfigs, Player, PlayerSymbol } from '../game/types';
import { AVAILABLE_SYMBOLS } from '../game/types';
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

  // Validate symbol is from available list
  if (!AVAILABLE_SYMBOLS.includes(symbol)) {
    return;
  }

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
 * Options for rendering player names.
 */
export interface PlayerNamesOptions {
  /** Whether in remote mode */
  isRemoteMode?: boolean;
  /** Local player symbol in remote mode (X or O) */
  localPlayerSymbol?: 'X' | 'O';
}

/** Current options */
let currentOptions: PlayerNamesOptions = {};

/**
 * Renders the player configuration editor UI (names and symbols).
 * In remote mode, only the local player's fields are editable.
 *
 * @param container - DOM element to render into
 * @param playerConfigs - Current player configurations
 * @param onChange - Handler for config changes
 * @param options - Additional rendering options
 */
export function renderPlayerNames(
  container: HTMLElement,
  playerConfigs: PlayerConfigs,
  onChange: PlayerConfigChangeHandler,
  options: PlayerNamesOptions = {}
): void {
  currentChangeHandler = onChange;
  currentConfigs = playerConfigs;
  currentOptions = options;

  const isRemote = options.isRemoteMode ?? false;
  const localSymbol = options.localPlayerSymbol;
  const xHidden = isRemote && localSymbol !== 'X';
  const oHidden = isRemote && localSymbol !== 'O';

  container.innerHTML = `
    <div class="player-configs">
      <div class="player-config-field${xHidden ? ' player-config-field--hidden' : ''}">
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
      <div class="player-config-field${oHidden ? ' player-config-field--hidden' : ''}">
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

  // Set up event listeners for name inputs (only enabled ones)
  const inputs = container.querySelectorAll('.player-name-input:not([disabled])');
  inputs.forEach((input) => {
    input.addEventListener('blur', handleNameBlur);
  });

  // Render symbol selectors (only for local player in remote mode)
  const symbolContainer = document.createElement('div');
  symbolContainer.className = 'symbol-selectors-wrapper';
  renderSymbolSelectors(
    symbolContainer,
    playerConfigs.X.symbol,
    playerConfigs.O.symbol,
    handleSymbolChange,
    isRemote ? localSymbol : undefined
  );
  container.appendChild(symbolContainer);
}

/**
 * Updates the player config display without full re-render.
 *
 * @param container - DOM element containing the player configs
 * @param playerConfigs - Current player configurations
 * @param options - Additional rendering options (uses stored options if not provided)
 */
export function updatePlayerNames(
  container: HTMLElement,
  playerConfigs: PlayerConfigs,
  options?: PlayerNamesOptions
): void {
  currentConfigs = playerConfigs;
  if (options) {
    currentOptions = options;
  }

  const isRemote = currentOptions.isRemoteMode ?? false;
  const localSymbol = currentOptions.localPlayerSymbol;
  const xHidden = isRemote && localSymbol !== 'X';
  const oHidden = isRemote && localSymbol !== 'O';

  const xInput = container.querySelector('#player-x-name');
  const oInput = container.querySelector('#player-o-name');

  if (xInput instanceof HTMLInputElement) {
    if (xInput.value !== playerConfigs.X.name) {
      xInput.value = playerConfigs.X.name;
    }
  }
  if (oInput instanceof HTMLInputElement) {
    if (oInput.value !== playerConfigs.O.name) {
      oInput.value = playerConfigs.O.name;
    }
  }

  // Update field hidden states for remote mode
  const xField = xInput?.parentElement;
  const oField = oInput?.parentElement;
  if (xField?.classList.contains('player-config-field')) {
    xField.classList.toggle('player-config-field--hidden', xHidden);
  }
  if (oField?.classList.contains('player-config-field')) {
    oField.classList.toggle('player-config-field--hidden', oHidden);
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
