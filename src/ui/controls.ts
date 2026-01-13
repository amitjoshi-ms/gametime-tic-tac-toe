/**
 * Game control buttons.
 * Provides the "New Game", "Start/Stop Demo", and "Rematch" buttons.
 *
 * @module ui/controls
 */

import type { GameMode, GameStatus } from '../game/types';

/**
 * Callback signature for new game button.
 */
export type NewGameHandler = () => void;

/**
 * Callback signature for demo toggle button.
 */
export type DemoToggleHandler = () => void;

/**
 * Callback signature for rematch button.
 */
export type RematchHandler = () => void;

/** Reference to current new game handler */
let currentNewGameHandler: NewGameHandler | null = null;

/** Reference to current demo toggle handler */
let currentDemoToggleHandler: DemoToggleHandler | null = null;

/** Reference to current rematch handler */
let currentRematchHandler: RematchHandler | null = null;

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
  } else if (
    target.classList.contains('btn-rematch') &&
    currentRematchHandler
  ) {
    currentRematchHandler();
  }
}

/**
 * Control button options.
 */
export interface ControlsOptions {
  /** Whether demo mode is currently active */
  isDemoActive: boolean;
  /** Current game mode */
  gameMode: GameMode;
  /** Current game status */
  gameStatus: GameStatus;
  /** Whether rematch is pending (waiting for response) */
  isRematchPending?: boolean;
  /** Handler for rematch button */
  onRematch?: RematchHandler;
}

/**
 * Renders the control buttons.
 *
 * @param container - DOM element to render into
 * @param onNewGame - Handler for "New Game" button click
 * @param onDemoToggle - Handler for "Start/Stop Demo" button click
 * @param options - Control button options
 */
export function renderControls(
  container: HTMLElement,
  onNewGame: NewGameHandler,
  onDemoToggle: DemoToggleHandler,
  options: ControlsOptions | boolean
): void {
  // Handle legacy boolean parameter for backwards compatibility
  const opts: ControlsOptions =
    typeof options === 'boolean'
      ? { isDemoActive: options, gameMode: 'human', gameStatus: 'playing' }
      : options;

  currentNewGameHandler = onNewGame;
  currentDemoToggleHandler = onDemoToggle;
  currentRematchHandler = opts.onRematch ?? null;

  // Clear and rebuild
  container.innerHTML = '';

  const newGameBtn = document.createElement('button');
  newGameBtn.className = 'btn btn-new-game';
  newGameBtn.textContent = 'New Game';
  newGameBtn.type = 'button';
  newGameBtn.setAttribute('aria-label', 'Start a new game');

  const demoBtn = document.createElement('button');
  demoBtn.className = 'btn btn-demo';
  demoBtn.textContent = opts.isDemoActive ? 'Stop Demo' : 'Start Demo';
  demoBtn.type = 'button';
  demoBtn.setAttribute(
    'aria-label',
    opts.isDemoActive ? 'Stop demo mode' : 'Start demo mode'
  );

  container.appendChild(newGameBtn);

  // Show rematch button in remote mode when game is over
  const isGameOver = opts.gameStatus !== 'playing';
  if (opts.gameMode === 'remote' && isGameOver && currentRematchHandler) {
    const rematchBtn = document.createElement('button');
    rematchBtn.className = 'btn btn-rematch';
    rematchBtn.textContent = opts.isRematchPending
      ? 'Rematch Requested...'
      : 'Request Rematch';
    rematchBtn.type = 'button';
    rematchBtn.disabled = opts.isRematchPending ?? false;
    rematchBtn.setAttribute(
      'aria-label',
      opts.isRematchPending
        ? 'Waiting for opponent to respond to rematch request'
        : 'Request a rematch with opponent'
    );
    container.appendChild(rematchBtn);
  }

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
 * @param options - Control button options
 */
export function updateControls(
  container: HTMLElement,
  options: ControlsOptions | boolean
): void {
  // Handle legacy boolean parameter for backwards compatibility
  const opts: ControlsOptions =
    typeof options === 'boolean'
      ? { isDemoActive: options, gameMode: 'human', gameStatus: 'playing' }
      : options;

  const demoBtn = container.querySelector('.btn-demo');
  if (demoBtn) {
    demoBtn.textContent = opts.isDemoActive ? 'Stop Demo' : 'Start Demo';
    demoBtn.setAttribute(
      'aria-label',
      opts.isDemoActive ? 'Stop demo mode' : 'Start demo mode'
    );
  }

  // Update rematch button if present
  const rematchBtn = container.querySelector<HTMLButtonElement>('.btn-rematch');
  if (rematchBtn) {
    rematchBtn.textContent = opts.isRematchPending
      ? 'Rematch Requested...'
      : 'Request Rematch';
    rematchBtn.disabled = opts.isRematchPending ?? false;
    rematchBtn.setAttribute(
      'aria-label',
      opts.isRematchPending
        ? 'Waiting for opponent to respond to rematch request'
        : 'Request a rematch with opponent'
    );
  }
}
