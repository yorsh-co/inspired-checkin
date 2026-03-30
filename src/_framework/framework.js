/**
 * Main framework entry point for creating an Apps Script WebApp.
 * Wires together router, middleware, routes, and global error handling.
 */
const Framework = (() => {
  /**
   * Creates a new application instance.
   *
   * @param {{
   *   routes: (router: {
   *     get: Function,
   *     post: Function,
   *     use: Function,
   *     group: Function
   *   }) => void,
   *   middleware?: Array<(req: any, res: any, next: Function) => void>,
   *   config?: Object
   * }} options
   *
   * @returns {{
   *   init: () => void,
   *   handle: (
   *     e: GoogleAppsScript.Events.DoGet | GoogleAppsScript.Events.DoPost,
   *     method: string
   *   ) => any
   * }}
   */
  const createApp = ({ routes, middleware = [], config }) => {
    // Apply global HTML config if provided
    if (config) HtmlResponse.setConfig(config);

    /**
     * Internal router instance.
     */
    const router = Router.create();

    /**
     * Initializes middleware, routes, and error handlers.
     * Automatically called on app creation.
     */
    const init = () => {
      // Register global middleware
      (middleware || []).forEach((mw) => router.use(mw));

      // Register routes
      if (typeof routes === 'function') routes(router);

      // Fallback: route not found
      router.use((req, res, next) => {
        if (res._hasSent()) return;

        if (!req._matched) {
          return next(HttpError.notFound(`Route not found: ${req.route}`));
        }

        return next(HttpError.internal('Request was not handled'));
      });

      // Global error handler (must be last)
      router.use(ErrorHandler.handleError);
    };

    // Initialize immediately
    init();

    /**
     * Handles incoming Apps Script requests (doGet / doPost).
     *
     * @param {GoogleAppsScript.Events.DoGet | GoogleAppsScript.Events.DoPost} e
     * @param {string} method - HTTP method (e.g., 'GET', 'POST')
     * @returns {any}
     */
    const handle = (e, method) => {
      try {
        const result = router.handle(e, method);

        // If nothing was returned → fallback
        if (result === null || result === undefined) {
          return ContentService.createTextOutput(
            'No response returned',
          ).setMimeType(ContentService.MimeType.TEXT);
        }

        if (result && typeof result.getContent === 'function') {
          return result;
        }

        if (typeof result === 'object') {
          return ContentService.createTextOutput(
            JSON.stringify(result),
          ).setMimeType(ContentService.MimeType.JSON);
        }

        return ContentService.createTextOutput(result).setMimeType(
          ContentService.MimeType.TEXT,
        );
      } catch (err) {
        console.error('Fatal error:', err);

        return ContentService.createTextOutput(
          'Internal server error',
        ).setMimeType(ContentService.MimeType.TEXT);
      }
    };

    return { init, handle };
  };

  return { createApp };
})();
