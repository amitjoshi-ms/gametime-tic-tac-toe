/**
 * Unit tests for signaling functions.
 * Tests SDP encoding/decoding and URL hash helpers.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  encodeSessionDescription,
  decodeSessionCode,
  getSessionFromURL,
  setSessionInURL,
  clearSessionFromURL,
} from '../../src/network/signaling';

describe('encodeSessionDescription', () => {
  it('should produce decodable string', () => {
    // Create a mock RTCSessionDescription
    const mockDescription = {
      type: 'offer' as RTCSdpType,
      sdp: 'v=0\r\no=- 1234567890 1 IN IP4 127.0.0.1\r\n',
    } as RTCSessionDescription;

    const encoded = encodeSessionDescription(mockDescription, 'ABC123');
    const decoded = decodeSessionCode(encoded);

    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe('ABC123');
    expect(decoded?.type).toBe('offer');
    expect(decoded?.sdp).toBe(mockDescription.sdp);
  });

  it('should include session ID prefix', () => {
    const mockDescription = {
      type: 'offer' as RTCSdpType,
      sdp: 'test-sdp',
    } as RTCSessionDescription;

    const encoded = encodeSessionDescription(mockDescription, 'XYZ789');

    expect(encoded.startsWith('XYZ789:')).toBe(true);
  });

  it('should handle answer type', () => {
    const mockDescription = {
      type: 'answer' as RTCSdpType,
      sdp: 'answer-sdp-data',
    } as RTCSessionDescription;

    const encoded = encodeSessionDescription(mockDescription, 'ANS456');
    const decoded = decodeSessionCode(encoded);

    expect(decoded?.type).toBe('answer');
    expect(decoded?.sdp).toBe('answer-sdp-data');
  });
});

describe('decodeSessionCode', () => {
  it('should decode valid code', () => {
    // Manually create a valid encoded code
    const payload = { type: 'offer', sdp: 'test-sdp-content' };
    const base64 = btoa(JSON.stringify(payload));
    const code = `TEST12:${base64}`;

    const decoded = decodeSessionCode(code);

    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe('TEST12');
    expect(decoded?.type).toBe('offer');
    expect(decoded?.sdp).toBe('test-sdp-content');
  });

  it('should return null for invalid format (no separator)', () => {
    expect(decodeSessionCode('ABC123base64data')).toBeNull();
  });

  it('should return null for corrupted base64', () => {
    expect(decodeSessionCode('ABC123:not-valid-base64!!!')).toBeNull();
  });

  it('should return null for invalid JSON in base64', () => {
    const invalidBase64 = btoa('not json');
    expect(decodeSessionCode(`ABC123:${invalidBase64}`)).toBeNull();
  });

  it('should return null for wrong session ID length', () => {
    const payload = { type: 'offer', sdp: 'test' };
    const base64 = btoa(JSON.stringify(payload));

    // Too short
    expect(decodeSessionCode(`AB:${base64}`)).toBeNull();

    // Too long
    expect(decodeSessionCode(`ABCDEFGH:${base64}`)).toBeNull();
  });

  it('should return null for missing type in payload', () => {
    const payload = { sdp: 'test' };
    const base64 = btoa(JSON.stringify(payload));
    expect(decodeSessionCode(`ABC123:${base64}`)).toBeNull();
  });

  it('should return null for missing sdp in payload', () => {
    const payload = { type: 'offer' };
    const base64 = btoa(JSON.stringify(payload));
    expect(decodeSessionCode(`ABC123:${base64}`)).toBeNull();
  });

  it('should return null for invalid type value', () => {
    const payload = { type: 'invalid', sdp: 'test' };
    const base64 = btoa(JSON.stringify(payload));
    expect(decodeSessionCode(`ABC123:${base64}`)).toBeNull();
  });

  it('should return null for non-string sdp', () => {
    const payload = { type: 'offer', sdp: 123 };
    const base64 = btoa(JSON.stringify(payload));
    expect(decodeSessionCode(`ABC123:${base64}`)).toBeNull();
  });

  it('should handle empty string', () => {
    expect(decodeSessionCode('')).toBeNull();
  });
});

describe('URL hash helpers', () => {
  const originalLocation = window.location.href;

  beforeEach(() => {
    // Reset URL to clean state
    window.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    // Restore original location
    window.history.replaceState(null, '', originalLocation);
  });

  describe('getSessionFromURL', () => {
    it('should return null when no hash', () => {
      window.history.replaceState(null, '', '/');
      expect(getSessionFromURL()).toBeNull();
    });

    it('should return null when hash has wrong prefix', () => {
      window.history.replaceState(null, '', '/#other=something');
      expect(getSessionFromURL()).toBeNull();
    });

    it('should extract session code from URL', () => {
      window.history.replaceState(null, '', '/#join=ABC123:encoded-data');
      expect(getSessionFromURL()).toBe('ABC123:encoded-data');
    });
  });

  describe('setSessionInURL', () => {
    it('should set hash with join prefix', () => {
      setSessionInURL('XYZ789:data');
      expect(window.location.hash).toBe('#join=XYZ789:data');
    });
  });

  describe('clearSessionFromURL', () => {
    it('should remove hash from URL', () => {
      window.history.replaceState(null, '', '/#join=ABC123:data');
      clearSessionFromURL();
      expect(window.location.hash).toBe('');
    });
  });
});
