/**
 * Central error handler middleware.
 * Handles both API and HTML responses.
 */
const ErrorHandler = (() => {
  /**
   * Checks if route is API.
   * @param {string} route
   * @returns {boolean}
   */
  const isApiRoute = (route) => route.startsWith('/api');

  /**
   * Express-style error handler middleware.
   *
   * @param {any} err
   * @param {Request} req
   * @param {Response} res
   * @param {Function} _next
   */
  const handleError = (err, req, res, _next) => {
    // Prevent double send
    if (res._hasSent()) return;

    console.error(err);

    const route = req.route;
    const isApi = isApiRoute(route);

    // Normalize error
    let status = 500;
    let type = 'INTERNAL_ERROR';
    let message = 'Unexpected server error';
    let details = null;

    if (err instanceof HttpError.HttpError) {
      status = err.status || err.code || 500;
      type = err.type;
      message = err.expose ? err.message : 'Internal server error';
      details = err.details;
    }

    // ---------- API ----------
    if (isApi) {
      return res.status(status).json({
        error: {
          type,
          message,
          ...(details && { details }),
        },
      });
    }

    // ---------- HTML ----------
    try {
      res.locals.pageTitle = status === 404 ? 'Not Found' : 'Error';
      res.locals.message = message;

      return res.status(status).render(status === 404 ? '404' : '500');
    } catch (renderErr) {
      console.error('Render failed:', renderErr);

      // 🚨 FINAL FALLBACK (guaranteed response)
      return res
        .status(status)
        .send(status === 404 ? '404 not found' : 'Internal server error');
    }
  };

  return { handleError };
})();
