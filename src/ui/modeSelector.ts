/**
 * Game mode selector UI component.
 * Renders toggle between human and computer opponent modes.
 *
 * @module ui/modeSelector
 */

import type { GameMode } from '../game/types';

/**
 * Callback signature for mode changes.
 */
export type ModeChangeHandler = (mode: GameMode) => void;

/**
 * Renders the game mode selector.
 * Creates radio button group styled as toggle buttons.
 *
 * @param container - DOM element to render into
 * @param currentMode - Currently selected mode
 * @param onChange - Handler for mode changes
 * @param disabled - Whether selector should be disabled (e.g., during demo)
 */
export function renderModeSelector(
  container: HTMLElement,
  currentMode: GameMode,
  onChange: ModeChangeHandler,
  disabled = false
): void {
  container.innerHTML = '';

  const fieldset = document.createElement('fieldset');
  fieldset.className = 'mode-selector';
  fieldset.setAttribute('role', 'radiogroup');
  fieldset.setAttribute('aria-label', 'Game mode selector');
  if (disabled) {
    fieldset.disabled = true;
  }

  const legend = document.createElement('legend');
  legend.className = 'mode-selector__legend';
  legend.textContent = 'Play Against';
  fieldset.appendChild(legend);

  const options: { value: GameMode; label: string }[] = [
    { value: 'human', label: 'Human' },
    { value: 'computer', label: 'Computer' },
    { value: 'remote', label: 'Remote' },
  ];

  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'mode-selector__options';

  for (const option of options) {
    const label = document.createElement('label');
    label.className = 'mode-selector__option';
    if (option.value === currentMode) {
      label.classList.add('mode-selector__option--selected');
    }
    if (disabled) {
      label.classList.add('mode-selector__option--disabled');
    }

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'game-mode';
    input.value = option.value;
    input.checked = option.value === currentMode;
    input.className = 'mode-selector__input';
    input.setAttribute('aria-label', `Play against ${option.label}`);
    if (disabled) {
      input.disabled = true;
    }

    input.addEventListener('change', () => {
      if (input.checked) {
        onChange(option.value);
      }
    });

    const span = document.createElement('span');
    span.className = 'mode-selector__label';
    span.textContent = option.label;

    label.appendChild(input);
    label.appendChild(span);
    optionsContainer.appendChild(label);
  }

  fieldset.appendChild(optionsContainer);
  container.appendChild(fieldset);
}

/**
 * Updates mode selector state without full re-render.
 *
 * @param container - DOM element containing the mode selector
 * @param currentMode - Currently selected mode
 * @param disabled - Whether selector should be disabled
 */
export function updateModeSelector(
  container: HTMLElement,
  currentMode: GameMode,
  disabled = false
): void {
  const fieldset = container.querySelector<HTMLFieldSetElement>('.mode-selector');
  if (!fieldset) {
    return;
  }

  // Update disabled state on fieldset
  fieldset.disabled = disabled;

  // Update radio buttons and option styling
  const inputs = container.querySelectorAll<HTMLInputElement>(
    '.mode-selector__input'
  );
  const options = container.querySelectorAll('.mode-selector__option');

  inputs.forEach((input, index) => {
    const isSelected = input.value === currentMode;
    input.checked = isSelected;
    input.disabled = disabled;

    const option = options[index];
    if (option) {
      option.classList.toggle('mode-selector__option--selected', isSelected);
      option.classList.toggle('mode-selector__option--disabled', disabled);
    }
  });
}
