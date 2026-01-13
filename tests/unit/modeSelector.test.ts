/**
 * Unit tests for mode selector.
 * Tests the game mode toggle rendering and event handling.
 * 
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderModeSelector, updateModeSelector } from '../../src/ui/modeSelector';

describe('modeSelector rendering', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.className = 'mode-selector-container';
  });

  describe('renderModeSelector', () => {
    it('should create a fieldset with radiogroup role', () => {
      const onChange = vi.fn();

      renderModeSelector(container, 'human', onChange);

      const fieldset = container.querySelector('fieldset');
      expect(fieldset).toBeTruthy();
      expect(fieldset?.getAttribute('role')).toBe('radiogroup');
      expect(fieldset?.getAttribute('aria-label')).toBe('Game mode selector');
    });

    it('should create a legend with "Play Against"', () => {
      const onChange = vi.fn();

      renderModeSelector(container, 'human', onChange);

      const legend = container.querySelector('.mode-selector__legend');
      expect(legend?.textContent).toBe('Play Against');
    });

    it('should create three radio button options', () => {
      const onChange = vi.fn();

      renderModeSelector(container, 'human', onChange);

      const inputs = container.querySelectorAll('input[type="radio"]');
      expect(inputs).toHaveLength(3);
    });

    it('should label options as Human, Computer, and Remote', () => {
      const onChange = vi.fn();

      renderModeSelector(container, 'human', onChange);

      const labels = container.querySelectorAll('.mode-selector__label');
      expect(labels[0]?.textContent).toBe('Human');
      expect(labels[1]?.textContent).toBe('Computer');
      expect(labels[2]?.textContent).toBe('Remote');
    });

    it('should set human as checked when currentMode is human', () => {
      const onChange = vi.fn();

      renderModeSelector(container, 'human', onChange);

      const inputs = container.querySelectorAll<HTMLInputElement>('input[type="radio"]');
      expect(inputs[0]?.checked).toBe(true);
      expect(inputs[1]?.checked).toBe(false);
    });

    it('should set computer as checked when currentMode is computer', () => {
      const onChange = vi.fn();

      renderModeSelector(container, 'computer', onChange);

      const inputs = container.querySelectorAll<HTMLInputElement>('input[type="radio"]');
      expect(inputs[0]?.checked).toBe(false);
      expect(inputs[1]?.checked).toBe(true);
    });

    it('should add selected class to current mode option', () => {
      const onChange = vi.fn();

      renderModeSelector(container, 'computer', onChange);

      const options = container.querySelectorAll('.mode-selector__option');
      expect(options[0]?.classList.contains('mode-selector__option--selected')).toBe(false);
      expect(options[1]?.classList.contains('mode-selector__option--selected')).toBe(true);
    });

    it('should set aria-label for each radio button', () => {
      const onChange = vi.fn();

      renderModeSelector(container, 'human', onChange);

      const inputs = container.querySelectorAll<HTMLInputElement>('input[type="radio"]');
      expect(inputs[0]?.getAttribute('aria-label')).toBe('Play against Human');
      expect(inputs[1]?.getAttribute('aria-label')).toBe('Play against Computer');
    });

    it('should call onChange when human option is selected', () => {
      const onChange = vi.fn();

      renderModeSelector(container, 'computer', onChange);

      const humanInput = container.querySelector<HTMLInputElement>('input[value="human"]');
      if (humanInput) {
        humanInput.checked = true;
        humanInput.dispatchEvent(new Event('change'));
      }

      expect(onChange).toHaveBeenCalledWith('human');
    });

    it('should call onChange when computer option is selected', () => {
      const onChange = vi.fn();

      renderModeSelector(container, 'human', onChange);

      const computerInput = container.querySelector<HTMLInputElement>('input[value="computer"]');
      if (computerInput) {
        computerInput.checked = true;
        computerInput.dispatchEvent(new Event('change'));
      }

      expect(onChange).toHaveBeenCalledWith('computer');
    });

    it('should call onChange when already selected option triggers change event', () => {
      const onChange = vi.fn();

      renderModeSelector(container, 'human', onChange);

      // Clear the call from initial render
      onChange.mockClear();

      const humanInput = container.querySelector<HTMLInputElement>('input[value="human"]');
      // Triggering change event on already-selected option
      humanInput?.dispatchEvent(new Event('change'));

      // onChange should still be called (browser behavior)
      expect(onChange).toHaveBeenCalledWith('human');
    });

    it('should use name attribute for radio group', () => {
      const onChange = vi.fn();

      renderModeSelector(container, 'human', onChange);

      const inputs = container.querySelectorAll<HTMLInputElement>('input[type="radio"]');
      inputs.forEach((input) => {
        expect(input.name).toBe('game-mode');
      });
    });

    it('should clear container before rendering', () => {
      container.innerHTML = '<div>Old content</div>';
      const onChange = vi.fn();

      renderModeSelector(container, 'human', onChange);

      expect(container.innerHTML).not.toContain('Old content');
      expect(container.querySelector('fieldset')).toBeTruthy();
    });
  });

  describe('updateModeSelector', () => {
    it('should update checked state without re-rendering', () => {
      const onChange = vi.fn();

      renderModeSelector(container, 'human', onChange);

      updateModeSelector(container, 'computer');

      const inputs = container.querySelectorAll<HTMLInputElement>('input[type="radio"]');
      expect(inputs[0]?.checked).toBe(false);
      expect(inputs[1]?.checked).toBe(true);
    });

    it('should update selected class on options', () => {
      const onChange = vi.fn();

      renderModeSelector(container, 'human', onChange);

      updateModeSelector(container, 'computer');

      const options = container.querySelectorAll('.mode-selector__option');
      expect(options[0]?.classList.contains('mode-selector__option--selected')).toBe(false);
      expect(options[1]?.classList.contains('mode-selector__option--selected')).toBe(true);
    });

    it('should handle switching back to human mode', () => {
      const onChange = vi.fn();

      renderModeSelector(container, 'computer', onChange);
      updateModeSelector(container, 'human');

      const inputs = container.querySelectorAll<HTMLInputElement>('input[type="radio"]');
      expect(inputs[0]?.checked).toBe(true);
      expect(inputs[1]?.checked).toBe(false);

      const options = container.querySelectorAll('.mode-selector__option');
      expect(options[0]?.classList.contains('mode-selector__option--selected')).toBe(true);
      expect(options[1]?.classList.contains('mode-selector__option--selected')).toBe(false);
    });

    it('should handle update when mode selector is not present', () => {
      // Should not throw error
      expect(() => {
        updateModeSelector(container, 'computer');
      }).not.toThrow();
    });

    it('should preserve event handlers during update', () => {
      const onChange = vi.fn();

      renderModeSelector(container, 'human', onChange);
      updateModeSelector(container, 'computer');

      // Clear previous calls
      onChange.mockClear();

      // Click human option
      const humanInput = container.querySelector<HTMLInputElement>('input[value="human"]');
      if (humanInput) {
        humanInput.checked = true;
        humanInput.dispatchEvent(new Event('change'));
      }

      expect(onChange).toHaveBeenCalledWith('human');
    });
  });
});
