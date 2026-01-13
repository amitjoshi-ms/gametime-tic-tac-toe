/**
 * Remote multiplayer game session management.
 * Coordinates between peer connection and game state.
 *
 * @module game/remote
 */

import type { GameState, Player, GameMessage } from './types';
import {
  createHostConnection,
  createGuestConnection,
  type HostConnection,
  type GuestConnection,
  type PeerConnectionHandlers,
} from '../network/peer';
import {
  generateSessionId,
  createHandshakeMessage,
  createMoveMessage,
  createRematchRequestMessage,
  createRematchResponseMessage,
  createDisconnectMessage,
  createGameResetMessage,
  createPlayerUpdateMessage,
  PROTOCOL_VERSION,
} from '../network/protocol';
import {
  encodeSessionDescription,
  decodeSessionCode,
  createSessionDescription,
  copyToClipboard,
} from '../network/signaling';

/**
 * Remote session controller interface.
 * Returned by startRemoteSession functions.
 */
export interface RemoteSessionController {
  /** Send a move to remote peer */
  sendMove(cellIndex: number, player: Player): void;
  /** Request a rematch */
  requestRematch(): void;
  /** Accept/decline rematch request */
  respondToRematch(accept: boolean): void;
  /** Leave the session */
  leave(): void;
  /** Get current move count for validation */
  getMoveCount(): number;
  /** Reset the game (New Game clicked) */
  resetGame(): void;
  /** Update local player info (name/symbol changed) */
  updatePlayer(name: string, symbol: string): void;
}

/**
 * Callbacks for remote session events.
 */
export interface RemoteSessionCallbacks {
  /** Remote player made a move */
  onRemoteMove: (cellIndex: number) => void;
  /** Rematch requested by remote */
  onRematchRequested: () => void;
  /** Rematch response received */
  onRematchResponse: (accepted: boolean) => void;
  /** Connection established */
  onConnected: (remoteName: string) => void;
  /** Connection lost */
  onDisconnected: (reason: string) => void;
  /** Connection error */
  onError: (message: string) => void;
  /** Game reset by remote player */
  onGameReset: () => void;
  /** Remote player updated their info */
  onPlayerUpdate: (name: string, symbol: string) => void;
}

/** Current move number for validation */
let moveCount = 0;

/** Active host connection */
let hostConnection: HostConnection | null = null;

/** Active guest connection */
let guestConnection: GuestConnection | null = null;

/** Expected player for next received move */
let expectedPlayer: Player = 'X';

/**
 * Resets the move counter.
 */
function resetMoveCount(): void {
  moveCount = 0;
  expectedPlayer = 'X';
}

/**
 * Creates peer connection handlers wired to session callbacks.
 */
function createPeerHandlers(
  callbacks: RemoteSessionCallbacks
): PeerConnectionHandlers {
  return {
    onOpen: (): void => {
      // onOpen is overridden by caller to send handshake with correct name
    },
    onMessage: (message: GameMessage): void => {
      handleMessage(message, callbacks);
    },
    onClose: (): void => {
      callbacks.onDisconnected('Connection closed');
    },
    onError: (error: Error): void => {
      callbacks.onError(error.message);
    },
    onStateChange: (): void => {
      // Could track ICE state changes here if needed
    },
  };
}

/**
 * Handles incoming messages from the remote peer.
 */
function handleMessage(
  message: GameMessage,
  callbacks: RemoteSessionCallbacks
): void {
  switch (message.type) {
    case 'handshake':
      if (message.protocolVersion !== PROTOCOL_VERSION) {
        callbacks.onError('Protocol version mismatch');
        return;
      }
      callbacks.onConnected(message.playerName);
      break;

    case 'move':
      // Validate the move
      // Note: Full board validation should happen in the caller
      if (message.player !== expectedPlayer) {
        callbacks.onError('Invalid move: wrong player');
        return;
      }
      if (message.moveNumber !== moveCount + 1) {
        callbacks.onError('Invalid move: wrong sequence');
        return;
      }

      // Accept the move
      moveCount++;
      expectedPlayer = expectedPlayer === 'X' ? 'O' : 'X';
      callbacks.onRemoteMove(message.cellIndex);
      break;

    case 'rematch-request':
      callbacks.onRematchRequested();
      break;

    case 'rematch-response':
      callbacks.onRematchResponse(message.accepted);
      break;

    case 'disconnect':
      callbacks.onDisconnected(
        message.reason === 'left' ? 'Opponent left the game' : 'Connection error'
      );
      break;

    case 'game-reset':
      // Reset move counter for new game
      resetMoveCount();
      callbacks.onGameReset();
      break;

    case 'player-update':
      callbacks.onPlayerUpdate(message.name, message.symbol);
      break;
  }
}

/**
 * Creates a new remote game session as host.
 *
 * @param localName - Local player's display name
 * @param callbacks - Event callbacks
 * @returns Session code to share and controller
 */
export async function createRemoteSession(
  localName: string,
  callbacks: RemoteSessionCallbacks
): Promise<{
  sessionCode: string;
  sessionId: string;
  controller: RemoteSessionController;
  cleanup: () => void;
}> {
  resetMoveCount();

  // Create host connection
  const handlers = createPeerHandlers(callbacks);

  // Override onOpen to send correct player name
  handlers.onOpen = (): void => {
    const handshake = createHandshakeMessage(localName);
    hostConnection?.send(handshake);
  };

  hostConnection = createHostConnection(handlers);

  // Generate session ID
  const sessionId = generateSessionId();

  // Create offer
  const offer = await hostConnection.createOffer();

  // Encode for sharing
  const sessionCode = encodeSessionDescription(offer, sessionId);

  const controller: RemoteSessionController = {
    sendMove(cellIndex: number, player: Player) {
      if (hostConnection) {
        moveCount++;
        const message = createMoveMessage(cellIndex, player, moveCount);
        hostConnection.send(message);
        expectedPlayer = expectedPlayer === 'X' ? 'O' : 'X';
      }
    },
    requestRematch() {
      if (hostConnection) {
        hostConnection.send(createRematchRequestMessage());
      }
    },
    respondToRematch(accept: boolean) {
      if (hostConnection) {
        hostConnection.send(createRematchResponseMessage(accept));
        if (accept) {
          resetMoveCount();
        }
      }
    },
    leave(): void {
      if (hostConnection) {
        hostConnection.send(createDisconnectMessage('left'));
        hostConnection.close();
        hostConnection = null;
      }
    },
    getMoveCount(): number {
      return moveCount;
    },
    resetGame(): void {
      if (hostConnection) {
        resetMoveCount();
        hostConnection.send(createGameResetMessage());
      }
    },
    updatePlayer(name: string, symbol: string): void {
      if (hostConnection) {
        hostConnection.send(createPlayerUpdateMessage(name, symbol));
      }
    },
  };

  const cleanup = (): void => {
    if (hostConnection) {
      hostConnection.close();
      hostConnection = null;
    }
  };

  return { sessionCode, sessionId, controller, cleanup };
}

/**
 * Completes host connection after receiving answer from guest.
 *
 * @param answerCode - Answer code from guest
 */
export async function completeHostConnection(answerCode: string): Promise<void> {
  if (!hostConnection) {
    throw new Error('No active host connection');
  }

  const decoded = decodeSessionCode(answerCode);
  if (decoded?.type !== 'answer') {
    throw new Error('Invalid answer code');
  }

  const answer = createSessionDescription(decoded);
  await hostConnection.acceptAnswer(answer);
}

/**
 * Joins an existing remote game session.
 *
 * @param sessionCode - Code from host
 * @param localName - Local player's display name
 * @param callbacks - Event callbacks
 * @returns Answer code to send back and controller
 */
export async function joinRemoteSession(
  sessionCode: string,
  localName: string,
  callbacks: RemoteSessionCallbacks
): Promise<{
  answerCode: string;
  controller: RemoteSessionController;
  cleanup: () => void;
}> {
  resetMoveCount();

  // Decode the session code
  const decoded = decodeSessionCode(sessionCode);
  if (decoded?.type !== 'offer') {
    throw new Error('Invalid session code');
  }

  // Create guest connection
  const handlers = createPeerHandlers(callbacks);

  // Override onOpen to send correct player name
  handlers.onOpen = (): void => {
    const handshake = createHandshakeMessage(localName);
    guestConnection?.send(handshake);
  };

  guestConnection = createGuestConnection(handlers);

  // Process offer and create answer
  const offer = createSessionDescription(decoded);
  const answer = await guestConnection.acceptOffer(offer);

  // Encode answer for sharing
  const answerCode = encodeSessionDescription(answer, decoded.id);

  const controller: RemoteSessionController = {
    sendMove(cellIndex: number, player: Player) {
      if (guestConnection) {
        moveCount++;
        const message = createMoveMessage(cellIndex, player, moveCount);
        guestConnection.send(message);
        expectedPlayer = expectedPlayer === 'X' ? 'O' : 'X';
      }
    },
    requestRematch() {
      if (guestConnection) {
        guestConnection.send(createRematchRequestMessage());
      }
    },
    respondToRematch(accept: boolean) {
      if (guestConnection) {
        guestConnection.send(createRematchResponseMessage(accept));
        if (accept) {
          resetMoveCount();
        }
      }
    },
    leave() {
      if (guestConnection) {
        guestConnection.send(createDisconnectMessage('left'));
        guestConnection.close();
        guestConnection = null;
      }
    },
    getMoveCount() {
      return moveCount;
    },
    resetGame(): void {
      if (guestConnection) {
        resetMoveCount();
        guestConnection.send(createGameResetMessage());
      }
    },
    updatePlayer(name: string, symbol: string): void {
      if (guestConnection) {
        guestConnection.send(createPlayerUpdateMessage(name, symbol));
      }
    },
  };

  const cleanup = (): void => {
    if (guestConnection) {
      guestConnection.close();
      guestConnection = null;
    }
  };

  return { answerCode, controller, cleanup };
}

/**
 * Determines if it's the local player's turn in remote mode.
 *
 * @param gameState - Current game state
 * @returns true if local player should move
 */
export function isLocalPlayerTurn(gameState: GameState): boolean {
  if (gameState.gameMode !== 'remote' || !gameState.remoteSession) {
    return false;
  }

  if (gameState.status !== 'playing') {
    return false;
  }

  if (gameState.remoteSession.connectionStatus !== 'connected') {
    return false;
  }

  return (
    gameState.currentPlayer === gameState.remoteSession.localPlayer.symbol
  );
}

/**
 * Gets the local player's symbol in remote mode.
 *
 * @param gameState - Current game state
 * @returns 'X' or 'O', or null if not in remote mode
 */
export function getLocalPlayerSymbol(gameState: GameState): Player | null {
  if (gameState.gameMode !== 'remote' || !gameState.remoteSession) {
    return null;
  }
  return gameState.remoteSession.localPlayer.symbol;
}

/**
 * Copies session code to clipboard.
 *
 * @param code - Session code to copy
 */
export async function copySessionCode(code: string): Promise<void> {
  await copyToClipboard(code);
}
