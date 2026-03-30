/**
 * JSON response helper for Apps Script WebApps.
 * Provides standardized success and error response formats.
 */
const JsonResponse = (() => {
  /**
   * Predefined error types with associated HTTP status codes.
   *
   * @readonly
   * @enum {{ type: string, code: number }}
   */
  const Errors = Object.freeze({
    INVALID_REQUEST: Object.freeze({
      type: 'INVALID_REQUEST',
      code: 400,
    }),
    NOT_AUTHORIZED: Object.freeze({
      type: 'NOT_AUTHORIZED',
      code: 401,
    }),
    FORBIDDEN: Object.freeze({
      type: 'FORBIDDEN',
      code: 403,
    }),
    NOT_FOUND: Object.freeze({
      type: 'NOT_FOUND',
      code: 404,
    }),
    METHOD_NOT_ALLOWED: Object.freeze({
      type: 'METHOD_NOT_ALLOWED',
      code: 405,
    }),
    CONFLICT: Object.freeze({
      type: 'CONFLICT',
      code: 409,
    }),
    INTERNAL_ERROR: Object.freeze({
      type: 'INTERNAL_ERROR',
      code: 500,
    }),
  });

  /**
   * Wraps a payload as a JSON response.
   * (Plain object for compatibility with google.script.run)
   *
   * @param {any} payload
   * @returns {any}
   */
  const json = (payload) => payload;

  /*
   * Alternative (not compatible with google.script.run):
   *
   * const json = (payload) =>
   *   ContentService
   *     .createTextOutput(JSON.stringify(payload))
   *     .setMimeType(ContentService.MimeType.JSON);
   */

  /**
   * Creates a standardized success response.
   *
   * @param {any} [data=null]
   * @returns {{
   *   ok: true,
   *   code: number,
   *   data: any
   * }}
   */
  const success = (data = null) =>
    json({
      ok: true,
      code: 200,
      data,
    });

  /**
   * Creates a standardized error response.
   *
   * @param {number} code - HTTP status code
   * @param {string} type - Error type identifier
   * @param {string} message - Human-readable error message
   * @param {any} [details=null] - Optional additional details
   *
   * @returns {{
   *   ok: false,
   *   code: number,
   *   error: {
   *     type: string,
   *     message: string,
   *     details?: any
   *   }
   * }}
   */
  const error = (code, type, message, details = null) => {
    /** @type {{ type: string, message: string, details?: any }} */
    const errorPayload = {
      type,
      message,
    };

    if (details !== null) errorPayload.details = details;

    return json({
      ok: false,
      code,
      error: errorPayload,
    });
  };

  return {
    Errors,
    success,
    error,
  };
})();
