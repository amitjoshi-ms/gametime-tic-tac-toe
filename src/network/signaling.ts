/**
 * Signaling helpers for WebRTC connection establishment.
 * Uses manual SDP exchange (copy/paste) - no signaling server.
 *
 * @module network/signaling
 */

/**
 * Encoded session offer/answer for sharing.
 */
export interface EncodedSession {
  /** Human-readable session ID */
  id: string;
  /** Base64-encoded SDP */
  sdp: string;
  /** Whether this is an offer or answer */
  type: 'offer' | 'answer';
}

/** Separator between session ID and encoded SDP */
const SESSION_CODE_SEPARATOR = ':';

/**
 * Encodes an SDP description for sharing.
 * Compresses and base64-encodes the SDP.
 *
 * @param description - RTCSessionDescription to encode
 * @param sessionId - Human-readable session ID
 * @returns Encoded string for sharing
 *
 * @example
 * const code = encodeSessionDescription(offer, 'A3K9PW');
 * // Returns: 'A3K9PW:eyJ0eXBlIjoib2ZmZXIi...'
 */
export function encodeSessionDescription(
  description: RTCSessionDescription,
  sessionId: string
): string {
  const payload = {
    type: description.type,
    sdp: description.sdp,
  };
  const jsonString = JSON.stringify(payload);
  const base64 = btoa(jsonString);
  return `${sessionId}${SESSION_CODE_SEPARATOR}${base64}`;
}

/**
 * Decodes a shared session code.
 *
 * @param code - Encoded session string
 * @returns Decoded session or null if invalid
 */
export function decodeSessionCode(code: string): EncodedSession | null {
  try {
    const separatorIndex = code.indexOf(SESSION_CODE_SEPARATOR);
    if (separatorIndex === -1) {
      return null;
    }

    const id = code.substring(0, separatorIndex);
    const base64 = code.substring(separatorIndex + 1);

    if (id.length !== 6) {
      return null;
    }

    const jsonString = atob(base64);
    const parsed: unknown = JSON.parse(jsonString);

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('type' in parsed) ||
      !('sdp' in parsed)
    ) {
      return null;
    }

    const { type, sdp } = parsed as { type: unknown; sdp: unknown };

    if (type !== 'offer' && type !== 'answer') {
      return null;
    }

    if (typeof sdp !== 'string') {
      return null;
    }

    return {
      id,
      sdp,
      type,
    };
  } catch {
    return null;
  }
}

/**
 * Creates an RTCSessionDescription from decoded session data.
 *
 * @param session - Decoded session data
 * @returns RTCSessionDescription for WebRTC
 */
export function createSessionDescription(
  session: EncodedSession
): RTCSessionDescription {
  return new RTCSessionDescription({
    type: session.type,
    sdp: session.sdp,
  });
}

/** URL hash prefix for join links */
const URL_HASH_PREFIX = 'join=';

/**
 * Extracts session code from URL hash if present.
 *
 * @returns Session code from URL or null
 *
 * @example
 * // URL: https://game.example.com/#join=A3K9PW:eyJ...
 * getSessionFromURL() // Returns full session code
 */
export function getSessionFromURL(): string | null {
  const hash = window.location.hash;
  if (!hash.startsWith(`#${URL_HASH_PREFIX}`)) {
    return null;
  }
  return hash.substring(URL_HASH_PREFIX.length + 1);
}

/**
 * Updates URL hash with session code.
 *
 * @param code - Session code to put in URL
 */
export function setSessionInURL(code: string): void {
  window.history.replaceState(null, '', `#${URL_HASH_PREFIX}${code}`);
}

/**
 * Clears session code from URL hash.
 */
export function clearSessionFromURL(): void {
  window.history.replaceState(null, '', window.location.pathname);
}

/**
 * Copies text to clipboard.
 *
 * @param text - Text to copy
 * @returns Promise resolving when copied
 */
export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
