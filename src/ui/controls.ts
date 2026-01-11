/**
 * Game control buttons.
 * Provides the "New Game" button for resetting.
 *
 * @module ui/controls
 */

/**
 * Callback signature for new game button.
 */
export type NewGameHandler = () => void;

/** Reference to current handler for cleanup */
let currentHandler: NewGameHandler | null = null;

/**
 * Handles click events on controls using event delegation.
 */
function handleControlsClick(event: Event): void {
  if (!currentHandler) return;

  const target = event.target as HTMLElement;
  if (target.classList.contains('btn')) {
    currentHandler();
  }
}

/**
 * Renders the control buttons.
 *
 * @param container - DOM element to render into
 * @param onNewGame - Handler for "New Game" button click
 */
export function renderControls(
  container: HTMLElement,
  onNewGame: NewGameHandler
): void {
  currentHandler = onNewGame;

  // Clear and rebuild
  container.innerHTML = '';

  const newGameBtn = document.createElement('button');
  newGameBtn.className = 'btn';
  newGameBtn.textContent = 'New Game';
  newGameBtn.type = 'button';
  newGameBtn.setAttribute('aria-label', 'Start a new game');

  container.appendChild(newGameBtn);

  // Remove old event listener to prevent memory leak
  container.removeEventListener('click', handleControlsClick);
  // Set up event delegation (single listener on container)
  container.addEventListener('click', handleControlsClick);
}
