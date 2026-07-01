import { logger } from '../../modules/log/logger.js';

/**
 * Error thrown by the API request helper when the server responds
 * with a non-2xx status. Mirrors the backend AppError JSON shape so
 * callers can branch on `code` instead of matching message strings.
 */
export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {Object} [options]
   * @param {number} [options.status]
   * @param {string} [options.code='UNKNOWN_ERROR']
   * @param {Object} [options.details]
   */
  constructor(message, options = {}) {
    const { status, code = 'UNKNOWN_ERROR', details } = options;

    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
