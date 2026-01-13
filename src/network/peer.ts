/**
 * WebRTC peer connection wrapper.
 * Manages RTCPeerConnection and DataChannel lifecycle.
 *
 * @module network/peer
 */

import type { GameMessage } from '../game/types';
import { deserializeMessage, serializeMessage } from './protocol';

/** Default ICE servers (public STUN) */
export const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

/** Connection timeout in milliseconds */
export const CONNECTION_TIMEOUT = 30000;

/** ICE gathering timeout in milliseconds */
export const ICE_GATHERING_TIMEOUT = 10000;

/** DataChannel label */
const DATA_CHANNEL_LABEL = 'game';

/**
 * Peer connection event handlers.
 */
export interface PeerConnectionHandlers {
  /** Called when DataChannel opens */
  onOpen: () => void;
  /** Called when message received */
  onMessage: (message: GameMessage) => void;
  /** Called when connection closes */
  onClose: () => void;
  /** Called on connection error */
  onError: (error: Error) => void;
  /** Called with ICE connection state changes */
  onStateChange: (state: RTCIceConnectionState) => void;
}

/**
 * Host connection interface (offer creator).
 */
export interface HostConnection {
  /** Generate SDP offer (includes ICE candidates) */
  createOffer(): Promise<RTCSessionDescription>;
  /** Process answer from joining peer */
  acceptAnswer(answer: RTCSessionDescription): Promise<void>;
  /** Send message to peer */
  send(message: GameMessage): void;
  /** Close connection and cleanup */
  close(): void;
}

/**
 * Guest connection interface (answer creator).
 */
export interface GuestConnection {
  /** Process offer and generate answer */
  acceptOffer(offer: RTCSessionDescription): Promise<RTCSessionDescription>;
  /** Send message to peer */
  send(message: GameMessage): void;
  /** Close connection and cleanup */
  close(): void;
}

/**
 * Sets up event handlers for a DataChannel.
 *
 * @param dataChannel - The DataChannel to configure
 * @param handlers - Event handlers
 */
function setupDataChannelHandlers(
  dataChannel: RTCDataChannel,
  handlers: PeerConnectionHandlers
): void {
  dataChannel.onopen = (): void => {
    handlers.onOpen();
  };

  dataChannel.onclose = (): void => {
    handlers.onClose();
  };

  dataChannel.onerror = (event): void => {
    // RTCDataChannel error events contain an error property
    const error =
      'error' in event && event.error instanceof DOMException
        ? event.error.message
        : 'DataChannel error';
    handlers.onError(new Error(error));
  };

  dataChannel.onmessage = (event): void => {
    const message = deserializeMessage(event.data as string);
    if (message) {
      handlers.onMessage(message);
    }
  };
}

/**
 * Sets up ICE connection state change handler.
 *
 * @param connection - RTCPeerConnection to monitor
 * @param handlers - Event handlers
 */
function setupConnectionStateHandler(
  connection: RTCPeerConnection,
  handlers: PeerConnectionHandlers
): void {
  connection.oniceconnectionstatechange = (): void => {
    handlers.onStateChange(connection.iceConnectionState);

    if (
      connection.iceConnectionState === 'failed' ||
      connection.iceConnectionState === 'disconnected'
    ) {
      handlers.onClose();
    }
  };
}

/**
 * Waits for ICE gathering to complete.
 *
 * @param connection - RTCPeerConnection to wait on
 * @param timeout - Maximum wait time in ms
 * @returns Promise resolving when complete or timeout
 */
export function waitForIceGathering(
  connection: RTCPeerConnection,
  timeout: number = ICE_GATHERING_TIMEOUT
): Promise<void> {
  return new Promise((resolve) => {
    // If already complete, resolve immediately
    if (connection.iceGatheringState === 'complete') {
      resolve();
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleStateChange = (): void => {
      if (connection.iceGatheringState === 'complete') {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        connection.removeEventListener(
          'icegatheringstatechange',
          handleStateChange
        );
        resolve();
      }
    };

    connection.addEventListener('icegatheringstatechange', handleStateChange);

    // Set timeout
    timeoutId = setTimeout((): void => {
      connection.removeEventListener(
        'icegatheringstatechange',
        handleStateChange
      );
      // Resolve anyway after timeout - we'll use whatever candidates we have
      resolve();
    }, timeout);
  });
}

/**
 * Creates a new peer connection as the host (offer creator).
 *
 * @param handlers - Event handlers
 * @returns Object with connection management functions
 *
 * @example
 * const host = await createHostConnection({
 *   onOpen: () => console.log('Connected!'),
 *   onMessage: (msg) => handleMessage(msg),
 *   onClose: () => console.log('Disconnected'),
 *   onError: (err) => console.error(err),
 *   onStateChange: (state) => updateUI(state),
 * });
 *
 * const offer = await host.createOffer();
 * // Share offer with peer...
 * await host.acceptAnswer(peerAnswer);
 */
export function createHostConnection(
  handlers: PeerConnectionHandlers
): HostConnection {
  const connection = new RTCPeerConnection({
    iceServers: DEFAULT_ICE_SERVERS,
  });

  // Create data channel (host creates, guest receives)
  const dataChannel = connection.createDataChannel(DATA_CHANNEL_LABEL, {
    ordered: true,
  });

  setupDataChannelHandlers(dataChannel, handlers);
  setupConnectionStateHandler(connection, handlers);

  return {
    async createOffer(): Promise<RTCSessionDescription> {
      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);

      // Wait for ICE candidates to be gathered
      await waitForIceGathering(connection);

      // Return the local description with all ICE candidates
      if (!connection.localDescription) {
        throw new Error('Failed to create offer');
      }
      return connection.localDescription;
    },

    async acceptAnswer(answer: RTCSessionDescription): Promise<void> {
      await connection.setRemoteDescription(answer);
    },

    send(message: GameMessage): void {
      if (dataChannel.readyState === 'open') {
        dataChannel.send(serializeMessage(message));
      }
    },

    close(): void {
      dataChannel.close();
      connection.close();
    },
  };
}

/**
 * Creates a new peer connection as the guest (answer creator).
 *
 * @param handlers - Event handlers
 * @returns Object with connection management functions
 *
 * @example
 * const guest = await createGuestConnection({
 *   onOpen: () => console.log('Connected!'),
 *   onMessage: (msg) => handleMessage(msg),
 *   onClose: () => console.log('Disconnected'),
 *   onError: (err) => console.error(err),
 *   onStateChange: (state) => updateUI(state),
 * });
 *
 * const answer = await guest.acceptOffer(hostOffer);
 * // Share answer with host...
 */
export function createGuestConnection(
  handlers: PeerConnectionHandlers
): GuestConnection {
  const connection = new RTCPeerConnection({
    iceServers: DEFAULT_ICE_SERVERS,
  });

  let dataChannel: RTCDataChannel | null = null;

  // Guest receives data channel from host
  connection.ondatachannel = (event): void => {
    dataChannel = event.channel;
    setupDataChannelHandlers(dataChannel, handlers);
  };

  setupConnectionStateHandler(connection, handlers);

  return {
    async acceptOffer(
      offer: RTCSessionDescription
    ): Promise<RTCSessionDescription> {
      await connection.setRemoteDescription(offer);

      const answer = await connection.createAnswer();
      await connection.setLocalDescription(answer);

      // Wait for ICE candidates to be gathered
      await waitForIceGathering(connection);

      // Return the local description with all ICE candidates
      if (!connection.localDescription) {
        throw new Error('Failed to create answer');
      }
      return connection.localDescription;
    },

    send(message: GameMessage): void {
      if (dataChannel?.readyState === 'open') {
        dataChannel.send(serializeMessage(message));
      }
    },

    close(): void {
      if (dataChannel) {
        dataChannel.close();
      }
      connection.close();
    },
  };
}
