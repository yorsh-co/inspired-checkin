import { AppErrorCode } from '../../types/appErrorCode.js';

/**
 * Base class for operational errors — expected failures from bad input,
 * missing resources, auth, conflicts, etc. — as opposed to programming
 * errors (bugs, unhandled exceptions), which are NOT instances of this
 * class and are always reported to the client as a generic 500.
 */
export class AppError extends Error {
  /**
   * @param {string} message
   * @param {Object} [options]
   * @param {number} [options.statusCode=500]
   * @param {AppErrorCode} [options.code='INTERNAL_ERROR']
   * @param {Object} [options.details]
   * @param {number} [options.details.retryAfterSeconds]
   */
  constructor(message, options = {}) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
export class ValidationError extends AppError {
  /**
   * @param {string} [message='Invalid request']
   * @param {string} [details]
   */
  constructor(message = 'Invalid request', details) {
    super(message, { statusCode: 400, code: 'VALIDATION_ERROR', details });
  }
}

export class NotFoundError extends AppError {
  /**
   * @param {string} [message='Resource not found']
   */
  constructor(message = 'Resource not found') {
    super(message, { statusCode: 404, code: 'NOT_FOUND' });
  }
}

export class UnauthorizedError extends AppError {
  /**
   * @param {string} [message='Unauthorized']
   */
  constructor(message = 'Unauthorized') {
    super(message, { statusCode: 401, code: 'UNAUTHORIZED' });
  }
}

export class ConflictError extends AppError {
  /**
   * @param {string} [message='Conflict']
   */
  constructor(message = 'Conflict') {
    super(message, { statusCode: 409, code: 'CONFLICT' });
  }
}

export class RateLimitError extends AppError {
  /**
   * @param {string} [message='Too many requests']
   * @param {number} [retryAfterSeconds]
   */
  constructor(message = 'Too many requests', retryAfterSeconds) {
    super(message, {
      statusCode: 429,
      code: 'RATE_LIMITED',
      details: { retryAfterSeconds },
    });
  }
}

export class CaptchaRequiredError extends AppError {
  /**
   * @param {string} [message='Captcha verification required']
   */
  constructor(message = 'Captcha verification required') {
    super(message, { statusCode: 400, code: 'CAPTCHA_REQUIRED' });
  }
}
