/**
 * Remote multiplayer session UI panel.
 * Handles create/join flow and connection status display.
 *
 * @module ui/remotePanel
 */

/**
 * Callback signatures for panel actions.
 */
export interface RemotePanelHandlers {
  /** User clicked Create Game */
  onCreate: () => void | Promise<void>;
  /** User submitted session code to join */
  onJoin: (code: string) => void | Promise<void>;
  /** User clicked Copy Code */
  onCopyCode: () => void | Promise<void>;
  /** User clicked Leave/Cancel */
  onLeave: () => void;
  /** User submitted answer code (host completing connection) */
  onAnswerSubmit: (code: string) => void | Promise<void>;
  /** User accepted rematch request */
  onRematchAccept?: () => void;
  /** User declined rematch request */
  onRematchDecline?: () => void;
}

/**
 * Remote panel display state.
 */
export interface RemotePanelState {
  /** Current connection phase */
  phase:
    | 'select'
    | 'creating'
    | 'waiting'
    | 'joining'
    | 'answer-input'
    | 'connecting'
    | 'connected'
    | 'rematch-request'
    | 'disconnected'
    | 'error';
  /** Session code to display (when waiting) */
  sessionCode?: string;
  /** Session ID (short form) */
  sessionId?: string;
  /** Remote player name (when connected) */
  remoteName?: string;
  /** Remote player symbol (when connected) */
  remoteSymbol?: string;
  /** Error message (when error) */
  error?: string;
  /** Whether code was copied */
  codeCopied?: boolean;
  /** Whether local player sent rematch request */
  rematchPending?: boolean;
}

/** Module-level handlers reference for event callbacks */
let currentHandlers: RemotePanelHandlers | null = null;

/**
 * Creates the select phase UI with Create/Join buttons.
 */
function createSelectPhaseUI(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'remote-panel__select';

  const title = document.createElement('p');
  title.className = 'remote-panel__title';
  title.textContent = 'Remote Multiplayer';
  container.appendChild(title);

  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'remote-panel__buttons';

  const createBtn = document.createElement('button');
  createBtn.type = 'button';
  createBtn.className = 'remote-panel__btn remote-panel__btn--primary';
  createBtn.textContent = 'Create Game';
  createBtn.addEventListener('click', () => {
    void currentHandlers?.onCreate();
  });

  const joinBtn = document.createElement('button');
  joinBtn.type = 'button';
  joinBtn.className = 'remote-panel__btn remote-panel__btn--secondary';
  joinBtn.textContent = 'Join Game';
  joinBtn.addEventListener('click', () => {
    // Switch to join input UI
    const panel = document.querySelector('.remote-panel');
    if (panel) {
      panel.innerHTML = '';
      panel.appendChild(createJoinPhaseUI());
    }
  });

  buttonsContainer.appendChild(createBtn);
  buttonsContainer.appendChild(joinBtn);
  container.appendChild(buttonsContainer);

  return container;
}

/**
 * Creates the join phase UI with code input field.
 */
function createJoinPhaseUI(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'remote-panel__join';

  const title = document.createElement('p');
  title.className = 'remote-panel__title';
  title.textContent = 'Enter Session Code';
  container.appendChild(title);

  const form = document.createElement('form');
  form.className = 'remote-panel__form';

  const input = document.createElement('textarea');
  input.className = 'remote-panel__code-input';
  input.placeholder = 'Paste the session code here...';
  input.rows = 3;
  input.required = true;

  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'remote-panel__buttons';

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'remote-panel__btn remote-panel__btn--primary';
  submitBtn.textContent = 'Join';

  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'remote-panel__btn remote-panel__btn--secondary';
  backBtn.textContent = 'Back';
  backBtn.addEventListener('click', () => {
    // Switch back to select UI
    const panel = document.querySelector('.remote-panel');
    if (panel) {
      panel.innerHTML = '';
      panel.appendChild(createSelectPhaseUI());
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = input.value.trim();
    if (code) {
      void currentHandlers?.onJoin(code);
    }
  });

  form.appendChild(input);
  buttonsContainer.appendChild(submitBtn);
  buttonsContainer.appendChild(backBtn);
  form.appendChild(buttonsContainer);
  container.appendChild(form);

  return container;
}

/**
 * Creates the creating phase UI with spinner.
 */
function createCreatingPhaseUI(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'remote-panel__creating';

  const spinner = document.createElement('div');
  spinner.className = 'remote-panel__spinner';

  const text = document.createElement('p');
  text.className = 'remote-panel__status-text';
  text.textContent = 'Creating session...';

  container.appendChild(spinner);
  container.appendChild(text);

  return container;
}

/**
 * Creates the waiting phase UI with session code display.
 */
function createWaitingPhaseUI(
  sessionId: string,
  sessionCode: string,
  codeCopied: boolean
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'remote-panel__waiting';

  const title = document.createElement('p');
  title.className = 'remote-panel__title';
  title.textContent = `Session: ${sessionId}`;
  container.appendChild(title);

  const instructions = document.createElement('p');
  instructions.className = 'remote-panel__instructions';
  instructions.textContent =
    'Share this code with your opponent, then paste their response code below.';
  container.appendChild(instructions);

  const codeDisplay = document.createElement('div');
  codeDisplay.className = 'remote-panel__code-display';

  const codeText = document.createElement('textarea');
  codeText.className = 'remote-panel__code-text';
  codeText.value = sessionCode;
  codeText.readOnly = true;
  codeText.rows = 3;

  codeDisplay.appendChild(codeText);
  container.appendChild(codeDisplay);

  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'remote-panel__buttons';

  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'remote-panel__btn remote-panel__btn--primary';
  copyBtn.textContent = codeCopied ? '✓ Copied!' : 'Copy Code';
  copyBtn.addEventListener('click', () => {
    void currentHandlers?.onCopyCode();
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'remote-panel__btn remote-panel__btn--secondary';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => currentHandlers?.onLeave());

  buttonsContainer.appendChild(copyBtn);
  buttonsContainer.appendChild(cancelBtn);
  container.appendChild(buttonsContainer);

  // Add answer input section for host to receive guest's response
  const answerSection = document.createElement('div');
  answerSection.className = 'remote-panel__answer-section';

  const answerLabel = document.createElement('p');
  answerLabel.className = 'remote-panel__answer-label';
  answerLabel.textContent = "Paste opponent's response code:";
  answerSection.appendChild(answerLabel);

  const answerForm = document.createElement('form');
  answerForm.className = 'remote-panel__form';

  const answerInput = document.createElement('textarea');
  answerInput.className = 'remote-panel__code-input';
  answerInput.placeholder = "Paste your opponent's response code here...";
  answerInput.rows = 3;
  answerInput.required = true;

  const connectBtn = document.createElement('button');
  connectBtn.type = 'submit';
  connectBtn.className = 'remote-panel__btn remote-panel__btn--primary';
  connectBtn.textContent = 'Connect';

  answerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const code = answerInput.value.trim();
    if (code) {
      void currentHandlers?.onAnswerSubmit(code);
    }
  });

  answerForm.appendChild(answerInput);
  answerForm.appendChild(connectBtn);
  answerSection.appendChild(answerForm);
  container.appendChild(answerSection);

  return container;
}

/**
 * Creates the joining phase UI with spinner.
 */
function createJoiningPhaseUI(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'remote-panel__joining';

  const spinner = document.createElement('div');
  spinner.className = 'remote-panel__spinner';

  const text = document.createElement('p');
  text.className = 'remote-panel__status-text';
  text.textContent = 'Joining session...';

  container.appendChild(spinner);
  container.appendChild(text);

  return container;
}

/**
 * Creates the answer-input phase UI for guest sending answer code.
 */
function createAnswerInputPhaseUI(answerCode: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'remote-panel__answer-input';

  const title = document.createElement('p');
  title.className = 'remote-panel__title';
  title.textContent = 'Send Response to Host';
  container.appendChild(title);

  const instructions = document.createElement('p');
  instructions.className = 'remote-panel__instructions';
  instructions.textContent =
    'Copy this response code and send it back to the host.';
  container.appendChild(instructions);

  const codeDisplay = document.createElement('div');
  codeDisplay.className = 'remote-panel__code-display';

  const codeText = document.createElement('textarea');
  codeText.className = 'remote-panel__code-text';
  codeText.value = answerCode;
  codeText.readOnly = true;
  codeText.rows = 3;

  codeDisplay.appendChild(codeText);
  container.appendChild(codeDisplay);

  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'remote-panel__buttons';

  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'remote-panel__btn remote-panel__btn--primary';
  copyBtn.textContent = 'Copy Response';
  copyBtn.addEventListener('click', () => {
    void currentHandlers?.onCopyCode();
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'remote-panel__btn remote-panel__btn--secondary';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => currentHandlers?.onLeave());

  buttonsContainer.appendChild(copyBtn);
  buttonsContainer.appendChild(cancelBtn);
  container.appendChild(buttonsContainer);

  const waitingText = document.createElement('p');
  waitingText.className = 'remote-panel__waiting-text';
  waitingText.textContent = 'Waiting for host to connect...';
  container.appendChild(waitingText);

  return container;
}

/**
 * Creates the connecting phase UI with spinner.
 */
function createConnectingPhaseUI(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'remote-panel__connecting';

  const spinner = document.createElement('div');
  spinner.className = 'remote-panel__spinner';

  const text = document.createElement('p');
  text.className = 'remote-panel__status-text';
  text.textContent = 'Connecting...';

  container.appendChild(spinner);
  container.appendChild(text);

  return container;
}

/**
 * Creates the connected phase UI with opponent info.
 */
function createConnectedPhaseUI(remoteName: string, remoteSymbol?: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'remote-panel__connected';

  const status = document.createElement('p');
  status.className = 'remote-panel__connected-status';
  status.innerHTML = `<span class="remote-panel__connected-dot"></span> Connected`;
  container.appendChild(status);

  const opponent = document.createElement('p');
  opponent.className = 'remote-panel__opponent-name';
  const symbolDisplay = remoteSymbol ? ` (${remoteSymbol})` : '';
  opponent.textContent = `Playing against: ${remoteName}${symbolDisplay}`;
  container.appendChild(opponent);

  const leaveBtn = document.createElement('button');
  leaveBtn.type = 'button';
  leaveBtn.className = 'remote-panel__btn remote-panel__btn--secondary';
  leaveBtn.textContent = 'Leave Game';
  leaveBtn.addEventListener('click', () => currentHandlers?.onLeave());
  container.appendChild(leaveBtn);

  return container;
}

/**
 * Creates the rematch request phase UI with accept/decline buttons.
 */
function createRematchRequestPhaseUI(remoteName: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'remote-panel__rematch-request';

  const icon = document.createElement('span');
  icon.className = 'remote-panel__rematch-icon';
  icon.textContent = '🎮';

  const text = document.createElement('p');
  text.className = 'remote-panel__rematch-text';
  text.textContent = `${remoteName} wants a rematch!`;

  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'remote-panel__buttons';

  const acceptBtn = document.createElement('button');
  acceptBtn.type = 'button';
  acceptBtn.className = 'remote-panel__btn remote-panel__btn--primary';
  acceptBtn.textContent = 'Accept';
  acceptBtn.setAttribute('aria-label', 'Accept rematch request');
  acceptBtn.addEventListener('click', () => currentHandlers?.onRematchAccept?.());

  const declineBtn = document.createElement('button');
  declineBtn.type = 'button';
  declineBtn.className = 'remote-panel__btn remote-panel__btn--secondary';
  declineBtn.textContent = 'Decline';
  declineBtn.setAttribute('aria-label', 'Decline rematch request');
  declineBtn.addEventListener('click', () => currentHandlers?.onRematchDecline?.());

  buttonsContainer.appendChild(acceptBtn);
  buttonsContainer.appendChild(declineBtn);

  container.appendChild(icon);
  container.appendChild(text);
  container.appendChild(buttonsContainer);

  return container;
}

/**
 * Creates the disconnected phase UI.
 */
function createDisconnectedPhaseUI(reason?: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'remote-panel__disconnected';

  const icon = document.createElement('span');
  icon.className = 'remote-panel__disconnected-icon';
  icon.textContent = '🔌';

  const text = document.createElement('p');
  text.className = 'remote-panel__disconnected-text';
  text.textContent = reason ?? 'Connection lost';

  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'remote-panel__btn remote-panel__btn--secondary';
  backBtn.textContent = 'Back to Menu';
  backBtn.addEventListener('click', () => currentHandlers?.onLeave());

  container.appendChild(icon);
  container.appendChild(text);
  container.appendChild(backBtn);

  return container;
}

/**
 * Creates the error phase UI with error message.
 */
function createErrorPhaseUI(error: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'remote-panel__error';

  const icon = document.createElement('span');
  icon.className = 'remote-panel__error-icon';
  icon.textContent = '⚠️';

  const text = document.createElement('p');
  text.className = 'remote-panel__error-text';
  text.textContent = error;

  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'remote-panel__btn remote-panel__btn--secondary';
  backBtn.textContent = 'Try Again';
  backBtn.addEventListener('click', () => currentHandlers?.onLeave());

  container.appendChild(icon);
  container.appendChild(text);
  container.appendChild(backBtn);

  return container;
}

/**
 * Renders the remote session panel.
 * Shows different UI based on connection phase.
 *
 * @param container - DOM element to render into
 * @param state - Current panel state
 * @param handlers - Action callbacks
 */
export function renderRemotePanel(
  container: HTMLElement,
  state: RemotePanelState,
  handlers: RemotePanelHandlers
): void {
  currentHandlers = handlers;

  container.innerHTML = '';
  container.className = 'remote-panel';

  let content: HTMLElement;

  switch (state.phase) {
    case 'select':
      content = createSelectPhaseUI();
      break;
    case 'creating':
      content = createCreatingPhaseUI();
      break;
    case 'waiting':
      content = createWaitingPhaseUI(
        state.sessionId ?? '',
        state.sessionCode ?? '',
        state.codeCopied ?? false
      );
      break;
    case 'joining':
      content = createJoiningPhaseUI();
      break;
    case 'answer-input':
      content = createAnswerInputPhaseUI(state.sessionCode ?? '');
      break;
    case 'connecting':
      content = createConnectingPhaseUI();
      break;
    case 'connected':
      content = createConnectedPhaseUI(state.remoteName ?? 'Unknown', state.remoteSymbol);
      break;
    case 'rematch-request':
      content = createRematchRequestPhaseUI(state.remoteName ?? 'Opponent');
      break;
    case 'disconnected':
      content = createDisconnectedPhaseUI(state.error);
      break;
    case 'error':
      content = createErrorPhaseUI(state.error ?? 'An error occurred');
      break;
    default:
      content = createSelectPhaseUI();
  }

  container.appendChild(content);
}

/**
 * Updates the remote panel with new state.
 * Performs full re-render for simplicity.
 *
 * @param container - DOM element containing the panel
 * @param state - New state
 * @param handlers - Action callbacks
 */
export function updateRemotePanel(
  container: HTMLElement,
  state: RemotePanelState,
  handlers: RemotePanelHandlers
): void {
  renderRemotePanel(container, state, handlers);
}
