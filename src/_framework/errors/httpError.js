/**
 * Base HTTP Error class.
 * Similar to Express/http-errors pattern.
 */
const HttpError = (() => {
  /**
   * Base HTTP Error.
   */
  class HttpError extends Error {
    /**
     * @param {number} status - HTTP status code
     * @param {string} message - Error message
     * @param {string} [type] - Optional error type identifier
     * @param {any} [details] - Optional additional details
     */
    constructor(status, message, type = null, details = null) {
      super(message);

      /** @type {number} */
      this.status = status;

      /** @type {string} */
      this.code = status; // alias for compatibility

      /** @type {string} */
      this.type = type || HttpError.defaultType(status);

      /** @type {any} */
      this.details = details;

      /** @type {boolean} */
      this.expose = status < 500; // expose client errors
    }

    /**
     * Maps status → default type.
     * @param {number} status
     * @returns {string}
     */
    static defaultType(status) {
      const map = {
        400: 'BAD_REQUEST',
        401: 'UNAUTHORIZED',
        403: 'FORBIDDEN',
        404: 'NOT_FOUND',
        405: 'METHOD_NOT_ALLOWED',
        409: 'CONFLICT',
        500: 'INTERNAL_ERROR',
      };
      return map[status] || 'HTTP_ERROR';
    }
  }

  // ---------- Specific Errors ----------

  class BadRequest extends HttpError {
    constructor(message = 'Bad request', details = null) {
      super(400, message, 'BAD_REQUEST', details);
    }
  }

  class Unauthorized extends HttpError {
    constructor(message = 'Unauthorized', details = null) {
      super(401, message, 'UNAUTHORIZED', details);
    }
  }

  class Forbidden extends HttpError {
    constructor(message = 'Forbidden', details = null) {
      super(403, message, 'FORBIDDEN', details);
    }
  }

  class NotFound extends HttpError {
    constructor(message = 'Not found', details = null) {
      super(404, message, 'NOT_FOUND', details);
    }
  }

  class MethodNotAllowed extends HttpError {
    constructor(message = 'Method not allowed', details = null) {
      super(405, message, 'METHOD_NOT_ALLOWED', details);
    }
  }

  class Conflict extends HttpError {
    constructor(message = 'Conflict', details = null) {
      super(409, message, 'CONFLICT', details);
    }
  }

  class InternalError extends HttpError {
    constructor(message = 'Internal server error', details = null) {
      super(500, message, 'INTERNAL_ERROR', details);
    }
  }

  // ---------- Factory helpers (Express-like ergonomics) ----------

  const badRequest = (msg, details) => new BadRequest(msg, details);
  const unauthorized = (msg, details) => new Unauthorized(msg, details);
  const forbidden = (msg, details) => new Forbidden(msg, details);
  const notFound = (msg, details) => new NotFound(msg, details);
  const methodNotAllowed = (msg, details) => new MethodNotAllowed(msg, details);
  const conflict = (msg, details) => new Conflict(msg, details);
  const internal = (msg, details) => new InternalError(msg, details);

  return {
    HttpError,
    BadRequest,
    Unauthorized,
    Forbidden,
    NotFound,
    MethodNotAllowed,
    Conflict,
    InternalError,

    // helpers
    badRequest,
    unauthorized,
    forbidden,
    notFound,
    methodNotAllowed,
    conflict,
    internal,
  };
})();
