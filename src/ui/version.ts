/**
 * Version display component.
 * Shows the application version in the footer.
 *
 * @module ui/version
 */

/**
 * Creates and renders the version display element.
 * @param container - Parent element to append the version display to
 */
export function renderVersion(container: HTMLElement): void {
  const versionElement = document.createElement('footer');
  versionElement.className = 'app-version';
  versionElement.setAttribute('aria-label', 'Application version');
  versionElement.textContent = `v${__APP_VERSION__}`;
  container.appendChild(versionElement);
}
