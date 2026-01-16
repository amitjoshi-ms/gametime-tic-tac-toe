/**
 * Unit tests for the version display component.
 *
 * @module tests/unit/version.test
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderVersion } from '../../src/ui/version';

// Mock the __APP_VERSION__ global
vi.stubGlobal('__APP_VERSION__', '1.2.3');

describe('renderVersion', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a footer element', () => {
    renderVersion(container);

    const footer = container.querySelector('footer');
    expect(footer).not.toBeNull();
  });

  it('should apply the app-version class', () => {
    renderVersion(container);

    const footer = container.querySelector('.app-version');
    expect(footer).not.toBeNull();
  });

  it('should display the version with v prefix', () => {
    renderVersion(container);

    const footer = container.querySelector('.app-version');
    expect(footer?.textContent).toBe('v1.2.3');
  });

  it('should include aria-label for accessibility', () => {
    renderVersion(container);

    const footer = container.querySelector('.app-version');
    expect(footer?.getAttribute('aria-label')).toBe('Application version');
  });

  it('should append to the container', () => {
    const existingChild = document.createElement('div');
    container.appendChild(existingChild);

    renderVersion(container);

    expect(container.children.length).toBe(2);
    expect(container.lastElementChild?.tagName).toBe('FOOTER');
  });
});
