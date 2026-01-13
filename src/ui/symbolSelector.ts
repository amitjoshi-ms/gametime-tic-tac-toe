/**
 * Symbol selector UI component.
 * Allows players to choose their game symbols from available options.
 *
 * @module ui/symbolSelector
 */

import type { Player, PlayerSymbol } from '../game/types';
import { AVAILABLE_SYMBOLS } from '../game/types';

/**
 * Callback signature for symbol selection changes.
 */
export type SymbolChangeHandler = (player: Player, symbol: PlayerSymbol) => void;

/**
 * Creates a symbol selector dropdown element.
 *
 * @param player - Which player this selector is for
 * @param currentSymbol - Currently selected symbol
 * @param otherSymbol - The other player's symbol (for validation)
 * @param onChange - Handler for symbol changes
 * @returns HTMLSelectElement for symbol selection
 */
function createSymbolSelector(
  player: Player,
  currentSymbol: PlayerSymbol,
  otherSymbol: PlayerSymbol,
  onChange: SymbolChangeHandler
): HTMLSelectElement {
  const select = document.createElement('select');
  select.className = 'symbol-selector';
  select.id = `symbol-selector-${player}`;
  select.dataset.player = player;
  select.setAttribute('aria-label', `Symbol for Player ${player}`);

  // Add options for each available symbol
  AVAILABLE_SYMBOLS.forEach((symbol) => {
    const option = document.createElement('option');
    option.value = symbol;
    option.textContent = symbol;
    option.selected = symbol === currentSymbol;

    // Disable if this is the other player's symbol
    if (symbol === otherSymbol) {
      option.disabled = true;
      option.textContent = `${symbol} (in use)`;
    }

    select.appendChild(option);
  });

  // Explicitly set the value to ensure it's correct
  select.value = currentSymbol;

  // Handle selection changes
  select.addEventListener('change', () => {
    const selectedSymbol = select.value as PlayerSymbol;
    if (selectedSymbol !== otherSymbol) {
      onChange(player, selectedSymbol);
    }
  });

  return select;
}

/**
 * Renders symbol selectors for both players.
 * In remote mode, only the local player's selector is rendered.
 *
 * @param container - DOM element to render into
 * @param xSymbol - Current symbol for Player X
 * @param oSymbol - Current symbol for Player O
 * @param onChange - Handler for symbol changes
 * @param localPlayerOnly - Only show selector for this player (remote mode)
 */
export function renderSymbolSelectors(
  container: HTMLElement,
  xSymbol: PlayerSymbol,
  oSymbol: PlayerSymbol,
  onChange: SymbolChangeHandler,
  localPlayerOnly?: 'X' | 'O'
): void {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'symbol-selectors';

  // Player X selector
  if (!localPlayerOnly || localPlayerOnly === 'X') {
    const xGroup = document.createElement('div');
    xGroup.className = 'symbol-selector-group';

    const xLabel = document.createElement('label');
    xLabel.htmlFor = `symbol-selector-X`;
    xLabel.className = 'symbol-selector-label symbol-selector-label--x';
    xLabel.textContent = 'Symbol:';

    const xSelector = createSymbolSelector('X', xSymbol, oSymbol, onChange);

    xGroup.appendChild(xLabel);
    xGroup.appendChild(xSelector);
    wrapper.appendChild(xGroup);
  }

  // Player O selector
  if (!localPlayerOnly || localPlayerOnly === 'O') {
    const oGroup = document.createElement('div');
    oGroup.className = 'symbol-selector-group';

    const oLabel = document.createElement('label');
    oLabel.htmlFor = `symbol-selector-O`;
    oLabel.className = 'symbol-selector-label symbol-selector-label--o';
    oLabel.textContent = 'Symbol:';

    const oSelector = createSymbolSelector('O', oSymbol, xSymbol, onChange);

    oGroup.appendChild(oLabel);
    oGroup.appendChild(oSelector);
    wrapper.appendChild(oGroup);
  }

  container.appendChild(wrapper);
}

/**
 * Updates symbol selectors without full re-render.
 *
 * @param container - DOM element containing the selectors
 * @param xSymbol - Current symbol for Player X
 * @param oSymbol - Current symbol for Player O
 */
export function updateSymbolSelectors(
  container: HTMLElement,
  xSymbol: PlayerSymbol,
  oSymbol: PlayerSymbol
): void {
  const xSelector = container.querySelector('#symbol-selector-X');
  const oSelector = container.querySelector('#symbol-selector-O');

  if (xSelector instanceof HTMLSelectElement) {
    if (xSelector.value !== xSymbol) {
      xSelector.value = xSymbol;
    }
    // Update disabled options
    Array.from(xSelector.options).forEach((option) => {
      const isOtherSymbol = option.value === oSymbol;
      option.disabled = isOtherSymbol;
      option.textContent = isOtherSymbol
        ? `${option.value} (in use)`
        : option.value;
    });
  }

  if (oSelector instanceof HTMLSelectElement) {
    if (oSelector.value !== oSymbol) {
      oSelector.value = oSymbol;
    }
    // Update disabled options
    Array.from(oSelector.options).forEach((option) => {
      const isOtherSymbol = option.value === xSymbol;
      option.disabled = isOtherSymbol;
      option.textContent = isOtherSymbol
        ? `${option.value} (in use)`
        : option.value;
    });
  }
}
