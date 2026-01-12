/**
 * Game control buttons.
 * Provides the "New Game" and "Start/Stop Demo" buttons.
 *
 * @module ui/controls
 */

/**
 * Callback signature for new game button.
 */
export type NewGameHandler = () => void;

/**
 * Callback signature for demo toggle button.
 */
export type DemoToggleHandler = () => void;

/** Reference to current new game handler */
let currentNewGameHandler: NewGameHandler | null = null;

/** Reference to current demo toggle handler */
let currentDemoToggleHandler: DemoToggleHandler | null = null;

/**
 * Handles click events on controls using event delegation.
 */
function handleControlsClick(event: Event): void {
  const target = event.target as HTMLElement;

  if (target.classList.contains('btn-new-game') && currentNewGameHandler) {
    currentNewGameHandler();
  } else if (
    target.classList.contains('btn-demo') &&
    currentDemoToggleHandler
  ) {
    currentDemoToggleHandler();
  }
}

/**
 * Renders the control buttons.
 *
 * @param container - DOM element to render into
 * @param onNewGame - Handler for "New Game" button click
 * @param onDemoToggle - Handler for "Start/Stop Demo" button click
 * @param isDemoActive - Whether demo mode is currently active
 */
export function renderControls(
  container: HTMLElement,
  onNewGame: NewGameHandler,
  onDemoToggle: DemoToggleHandler,
  isDemoActive: boolean
): void {
  currentNewGameHandler = onNewGame;
  currentDemoToggleHandler = onDemoToggle;

  // Clear and rebuild
  container.innerHTML = '';

  const newGameBtn = document.createElement('button');
  newGameBtn.className = 'btn btn-new-game';
  newGameBtn.textContent = 'New Game';
  newGameBtn.type = 'button';
  newGameBtn.setAttribute('aria-label', 'Start a new game');

  const demoBtn = document.createElement('button');
  demoBtn.className = 'btn btn-demo';
  demoBtn.textContent = isDemoActive ? 'Stop Demo' : 'Start Demo';
  demoBtn.type = 'button';
  demoBtn.setAttribute(
    'aria-label',
    isDemoActive ? 'Stop demo mode' : 'Start demo mode'
  );

  container.appendChild(newGameBtn);
  container.appendChild(demoBtn);

  // Remove old event listener to prevent memory leak
  container.removeEventListener('click', handleControlsClick);
  // Set up event delegation (single listener on container)
  container.addEventListener('click', handleControlsClick);
}

/**
 * Updates control button states without full re-render.
 *
 * @param container - DOM element containing controls
 * @param isDemoActive - Whether demo mode is currently active
 */
export function updateControls(
  container: HTMLElement,
  isDemoActive: boolean
): void {
  const demoBtn = container.querySelector('.btn-demo');
  if (demoBtn) {
    demoBtn.textContent = isDemoActive ? 'Stop Demo' : 'Start Demo';
    demoBtn.setAttribute(
      'aria-label',
      isDemoActive ? 'Stop demo mode' : 'Start demo mode'
    );
  }
}
