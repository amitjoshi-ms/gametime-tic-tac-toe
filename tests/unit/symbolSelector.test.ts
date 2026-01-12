/**
 * Unit tests for symbol selector UI component.
 * Tests DOM creation, option handling, and event callbacks.
 * 
 * @vitest-environment happy-dom
 */

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  renderSymbolSelectors,
  updateSymbolSelectors,
  type SymbolChangeHandler,
} from '../../src/ui/symbolSelector';
import { AVAILABLE_SYMBOLS } from '../../src/game/types';

describe('renderSymbolSelectors', () => {
  let container: HTMLElement;
  let mockOnChange: SymbolChangeHandler;

  beforeEach(() => {
    container = document.createElement('div');
    mockOnChange = vi.fn();
  });

  it('should create both X and O selectors', () => {
    renderSymbolSelectors(container, 'X', 'O', mockOnChange);

    const xSelector = container.querySelector('#symbol-selector-X')!;
    const oSelector = container.querySelector('#symbol-selector-O')!;

    expect(xSelector).toBeTruthy();
    expect(oSelector).toBeTruthy();
  });

  it('should create selector with all available symbols as options', () => {
    renderSymbolSelectors(container, 'X', 'O', mockOnChange);

    const xSelector = container.querySelector('#symbol-selector-X');
    expect(xSelector).toBeInstanceOf(HTMLSelectElement);
    const options = Array.from((xSelector as HTMLSelectElement).options);

    expect(options).toHaveLength(AVAILABLE_SYMBOLS.length);
    AVAILABLE_SYMBOLS.forEach((symbol, index) => {
      expect(options[index]?.value).toBe(symbol);
    });
  });

  it('should mark the current symbol as selected', () => {
    renderSymbolSelectors(container, '★', '🔵', mockOnChange);

    const xSelector = container.querySelector('#symbol-selector-X');
    expect(xSelector).toBeInstanceOf(HTMLSelectElement);
    expect((xSelector as HTMLSelectElement).value).toBe('★');

    const oSelector = container.querySelector('#symbol-selector-O');
    expect(oSelector).toBeInstanceOf(HTMLSelectElement);
    expect((oSelector as HTMLSelectElement).value).toBe('🔵');
  });

  it('should disable the other player\'s symbol in each selector', () => {
    renderSymbolSelectors(container, 'X', 'O', mockOnChange);

    const xSelector = container.querySelector('#symbol-selector-X');
    expect(xSelector).toBeInstanceOf(HTMLSelectElement);
    const xOptions = Array.from((xSelector as HTMLSelectElement).options);
    const oOptionInX = xOptions.find((opt) => opt.value === 'O');
    expect(oOptionInX?.disabled).toBe(true);
    expect(oOptionInX?.textContent).toContain('in use');

    const oSelector = container.querySelector('#symbol-selector-O');
    expect(oSelector).toBeInstanceOf(HTMLSelectElement);
    const oOptions = Array.from((oSelector as HTMLSelectElement).options);
    const xOptionInO = oOptions.find((opt) => opt.value === 'X');
    expect(xOptionInO?.disabled).toBe(true);
    expect(xOptionInO?.textContent).toContain('in use');
  });

  it('should have proper aria labels', () => {
    renderSymbolSelectors(container, 'X', 'O', mockOnChange);

    const xSelector = container.querySelector('#symbol-selector-X');
    expect(xSelector).toBeInstanceOf(HTMLSelectElement);
    const oSelector = container.querySelector('#symbol-selector-O');
    expect(oSelector).toBeInstanceOf(HTMLSelectElement);

    expect(xSelector?.getAttribute('aria-label')).toBe('Symbol for Player X');
    expect(oSelector?.getAttribute('aria-label')).toBe('Symbol for Player O');
  });

  it('should call onChange when X selector value changes', () => {
    renderSymbolSelectors(container, 'X', 'O', mockOnChange);

    const xSelector = container.querySelector('#symbol-selector-X');
    expect(xSelector).toBeInstanceOf(HTMLSelectElement);
    (xSelector as HTMLSelectElement).value = '★';
    xSelector?.dispatchEvent(new Event('change'));

    expect(mockOnChange).toHaveBeenCalledWith('X', '★');
  });

  it('should call onChange when O selector value changes', () => {
    renderSymbolSelectors(container, 'X', 'O', mockOnChange);

    const oSelector = container.querySelector('#symbol-selector-O');
    expect(oSelector).toBeInstanceOf(HTMLSelectElement);
    (oSelector as HTMLSelectElement).value = '🔵';
    oSelector?.dispatchEvent(new Event('change'));

    expect(mockOnChange).toHaveBeenCalledWith('O', '🔵');
  });

  it('should not call onChange if selecting the other player\'s symbol', () => {
    renderSymbolSelectors(container, 'X', 'O', mockOnChange);

    const xSelector = container.querySelector('#symbol-selector-X');
    expect(xSelector).toBeInstanceOf(HTMLSelectElement);
    (xSelector as HTMLSelectElement).value = 'O'; // Try to select O's symbol
    xSelector?.dispatchEvent(new Event('change'));

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should clear container before rendering', () => {
    container.innerHTML = '<div>Existing content</div>';
    renderSymbolSelectors(container, 'X', 'O', mockOnChange);

    expect(container.querySelector('div')?.textContent).not.toBe('Existing content');
    expect(container.querySelector('#symbol-selector-X')).toBeTruthy();
  });

  it('should create proper DOM structure with wrapper and groups', () => {
    renderSymbolSelectors(container, 'X', 'O', mockOnChange);

    const wrapper = container.querySelector('.symbol-selectors');
    expect(wrapper).toBeTruthy();

    const groups = container.querySelectorAll('.symbol-selector-group');
    expect(groups).toHaveLength(2);

    const labels = container.querySelectorAll('.symbol-selector-label');
    expect(labels).toHaveLength(2);
  });
});

describe('updateSymbolSelectors', () => {
  let container: HTMLElement;
  let mockOnChange: SymbolChangeHandler;

  beforeEach(() => {
    container = document.createElement('div');
    mockOnChange = vi.fn();
    // Render initial state
    renderSymbolSelectors(container, 'X', 'O', mockOnChange);
  });

  it('should update X selector value when changed', () => {
    updateSymbolSelectors(container, '★', 'O');

    const xSelector = container.querySelector('#symbol-selector-X');
    expect(xSelector).toBeInstanceOf(HTMLSelectElement);
    expect((xSelector as HTMLSelectElement).value).toBe('★');
  });

  it('should update O selector value when changed', () => {
    updateSymbolSelectors(container, 'X', '🔵');

    const oSelector = container.querySelector('#symbol-selector-O');
    expect(oSelector).toBeInstanceOf(HTMLSelectElement);
    expect((oSelector as HTMLSelectElement).value).toBe('🔵');
  });

  it('should update disabled state in X selector based on new O symbol', () => {
    updateSymbolSelectors(container, 'X', '★');

    const xSelector = container.querySelector('#symbol-selector-X');
    expect(xSelector).toBeInstanceOf(HTMLSelectElement);
    const options = Array.from((xSelector as HTMLSelectElement).options);
    const starOption = options.find((opt) => opt.value === '★');

    expect(starOption?.disabled).toBe(true);
    expect(starOption?.textContent).toContain('in use');
  });

  it('should update disabled state in O selector based on new X symbol', () => {
    updateSymbolSelectors(container, '●', 'O');

    const oSelector = container.querySelector('#symbol-selector-O');
    expect(oSelector).toBeInstanceOf(HTMLSelectElement);
    const options = Array.from((oSelector as HTMLSelectElement).options);
    const circleOption = options.find((opt) => opt.value === '●');

    expect(circleOption?.disabled).toBe(true);
    expect(circleOption?.textContent).toContain('in use');
  });

  it('should not update selector if value is already correct', () => {
    const xSelector = container.querySelector('#symbol-selector-X');
    expect(xSelector).toBeInstanceOf(HTMLSelectElement);
    const initialValue = (xSelector as HTMLSelectElement).value;

    updateSymbolSelectors(container, 'X', 'O');

    expect((xSelector as HTMLSelectElement).value).toBe(initialValue);
  });

  it('should handle missing selectors gracefully', () => {
    const emptyContainer = document.createElement('div');

    // Should not throw
    expect(() => {
      updateSymbolSelectors(emptyContainer, 'X', 'O');
    }).not.toThrow();
  });

  it('should update both selectors when both symbols change', () => {
    updateSymbolSelectors(container, '★', '🔵');

    const xSelector = container.querySelector('#symbol-selector-X');
    expect(xSelector).toBeInstanceOf(HTMLSelectElement);
    const oSelector = container.querySelector('#symbol-selector-O');
    expect(oSelector).toBeInstanceOf(HTMLSelectElement);

    expect((xSelector as HTMLSelectElement).value).toBe('★');
    expect((oSelector as HTMLSelectElement).value).toBe('🔵');
  });

  it('should properly re-enable previously disabled options', () => {
    // Initially X='X', O='O', so X selector has 'O' disabled
    const xSelector = container.querySelector('#symbol-selector-X');
    expect(xSelector).toBeInstanceOf(HTMLSelectElement);
    let options = Array.from((xSelector as HTMLSelectElement).options);
    let oOption = options.find((opt) => opt.value === 'O');
    expect(oOption?.disabled).toBe(true);

    // Now change O to '★', so 'O' should become enabled in X selector
    updateSymbolSelectors(container, 'X', '★');

    options = Array.from((xSelector as HTMLSelectElement).options);
    oOption = options.find((opt) => opt.value === 'O');
    expect(oOption?.disabled).toBe(false);
    expect(oOption?.textContent).toBe('O');

    // And '★' should be disabled
    const starOption = options.find((opt) => opt.value === '★');
    expect(starOption?.disabled).toBe(true);
  });
});
