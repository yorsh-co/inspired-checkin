import { env } from '../../config/env.js';

export class TurnstileValidator {
  constructor(secretKey, timeout = 10000) {
    this.secretKey = secretKey;
    this.timeout = timeout;
  }

  /**
   *
   * @param {string} token
   * @param {Object} [options]
   * @param {string} [options.remoteIp]
   * @param {string} [options.idempotencyKey]
   * @param {string} [options.expectedAction]
   * @param {string} [options.expectedHostname]
   *
   * @returns {Promise<{ success: boolean, error?: string, expected?: string, received?: string }>}
   */
  async validate(token, options = {}) {
    if (!token || typeof token !== 'string') {
      return { success: false, error: 'Invalid token format' };
    }

    if (token.length > 2048) {
      return { success: false, error: 'Token too long' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const body = {
        secret: env.captcha.secret,
        response: token,
      };

      if (options.remoteip) body.remoteip = options.remoteIp;

      if (options.idempotencyKey) {
        body.idempotency_key = options.idempotencyKey;
      }

      const response = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        },
      );

      const result = await response.json();

      if (result.success) {
        if (
          options.expectedAction &&
          result.action !== options.expectedAction
        ) {
          return {
            success: false,
            error: 'Action mismatch',
            expected: options.expectedAction,
            received: result.action,
          };
        }

        if (
          options.expectedHostname &&
          result.hostname !== options.expectedHostname
        ) {
          return {
            success: false,
            error: 'Hostname mismatch',
            expected: options.expectedHostname,
            received: result.hostname,
          };
        }
      }

      return result;
    } catch (error) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Validation timeout' };
      }

      console.error('Turnstile validation error:', error);
      return { success: false, error: 'Internal error' };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
