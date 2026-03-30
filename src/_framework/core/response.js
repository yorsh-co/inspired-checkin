/**
 * Response factory for Apps Script WebApp.
 * Provides Express-like response methods for JSON, HTML, redirects, and errors.
 */
const Response = (() => {
  /**
   * Creates a new response object.
   *
   * @returns {{
   *  locals: Object,
   *  status: (code: number) => any,
   *  send: (content: any) => any,
   *  json: (data: any) => any,
   *  render: (view: string, options?: Object) => any,
   *  redirect: (url: string) => any,
   *  error: (err: any) => any,
   *  _get: () => any,
   *  _hasSent: () => boolean,
   *  _getStatus: () => number
   * }}
   */
  const create = () => {
    /** @type {any} */
    let output = null;

    /** @type {number} */
    let statusCode = 200;

    /**
     * Shared data between middleware and controllers.
     * Similar to Express `res.locals`.
     * @type {Object}
     */
    const locals = {};

    /**
     * Sets the response output.
     *
     * @param {any} value
     * @returns {any}
     */
    const setOutput = (value) => {
      if (output !== null) throw new Error('Response already sent');
      output = value;
      return value;
    };

    /**
     * Sets HTTP status code.
     *
     * @param {number} code
     * @returns {api}
     */
    const setStatus = (code) => {
      statusCode = code;
      return api;
    };

    /**
     * Response API exposed to controllers and middleware.
     */
    const api = {
      locals,

      /**
       * Sets HTTP status code.
       *
       * @param {number} code
       * @returns {api}
       */
      status: (code) => setStatus(code),

      /**
       * Sends a raw response.
       *
       * @param {any} content
       * @returns {any}
       */
      send: (content) => setOutput(content),

      /**
       * Sends a JSON response.
       * Automatically wraps response in `{ ok, code, data }`.
       *
       * @param {any} data
       * @returns {Object}
       */
      json: (data) => {
        return setOutput({
          ok: statusCode < 400,
          code: statusCode,
          data: statusCode <= 400 ? data : null,
        });
      },

      /**
       * Renders an HTML view using HtmlResponse.
       *
       * @param {string} view
       * @param {Object} [options]
       * @returns {GoogleAppsScript.HTML.HtmlOutput}
       */
      render: (view, options = {}) => {
        return setOutput(
          HtmlResponse.render(view, locals, {
            ...options,
            status: statusCode,
          }),
        );
      },

      /**
       * Redirects to a different URL.
       *
       * @param {string} url
       * @returns {GoogleAppsScript.HTML.HtmlOutput}
       */
      redirect: (url) =>
        setOutput(
          HtmlService.createHtmlOutput(
            `<script>window.top.location.href="${url}"</script>`,
          ),
        ),

      /**
       * Sends a standardized error response.
       *
       * @param {{ code?: number, type: string, message: string, details?: any }} err
       * @returns {Object}
       */
      error: (err) => {
        return setOutput(
          JsonResponse.error(
            err.code || statusCode,
            err.type,
            err.message,
            err.details,
          ),
        );
      },

      /**
       * Internal: returns final output.
       * Used by router.
       *
       * @returns {any}
       */
      _get: () => output,

      /**
       * Internal: checks if response was already sent.
       *
       * @returns {boolean}
       */
      _hasSent: () => output !== null,

      /**
       * Internal: returns current status code.
       *
       * @returns {number}
       */
      _getStatus: () => statusCode,
    };

    return api;
  };

  return {
    create,
  };
})();
