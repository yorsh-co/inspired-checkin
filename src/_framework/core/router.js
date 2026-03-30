/**
 * Minimal Express-like Router for Apps Script.
 * Supports middleware, route handlers, nested groups, and error handling.
 */
const Router = (() => {
  /**
   * Creates a new router instance.
   * @returns {{
   *  get: (path: string, ...handlers: Function[]) => void,
   *  post: (path: string, ...handlers: Function[]) => void,
   *  use: (handler: Function) => void,
   *  handle: (e: GoogleAppsScript.Events.DoGet, method: string) => any,
   *  group: (prefix: string, ...args: any[]) => void
   * }}
   */
  const create = () => {
    /**
     * Internal middleware/route stack.
     * @type {{ method: string|null, path: string|null, handler: Function }[]}
     */
    const stack = [];

    /**
     * Registers a global middleware (runs on every request).
     * @param {(req, res, next) => void} handler
     */
    const use = (handler) =>
      stack.push({
        method: null,
        path: null,
        handler,
      });

    /**
     * Registers handlers for a specific HTTP method and path.
     * @param {string} method
     * @param {string} path
     * @param {...Function} handlers
     */
    const register = (method, path, ...handlers) =>
      handlers.forEach((handler) => {
        stack.push({
          method,
          path,
          handler,
        });
      });

    /**
     * Registers a GET route.
     * @param {string} path
     * @param {...Function} handlers
     */
    const get = (path, ...handlers) => register('GET', path, ...handlers);

    /**
     * Registers a POST route.
     * @param {string} path
     * @param {...Function} handlers
     */
    const post = (path, ...handlers) => register('POST', path, ...handlers);

    /**
     * Matches a request against a stack layer.
     * Supports params like `/users/:id`.
     *
     * @param {{ method: string|null, path: string|null }} layer
     * @param {object} req
     * @returns {boolean}
     */
    const match = (layer, req) => {
      if (layer.method && layer.method !== req.method) return false;
      if (!layer.path) return true;

      const routeParts = req.route.split('/');
      const layerParts = layer.path.split('/');

      // Prefix match for middleware
      if (!layer.method) {
        for (let i = 0; i < layerParts.length; i++) {
          if (layerParts[i] !== routeParts[i]) return false;
        }
        return true;
      }

      if (routeParts.length !== layerParts.length) return false;

      const params = {};

      for (let i = 0; i < layerParts.length; i++) {
        const lp = layerParts[i];
        const rp = routeParts[i];

        if (lp.startsWith(':')) {
          params[lp.slice(1)] = rp;
        } else if (lp !== rp) {
          return false;
        }
      }

      req._matched = true;

      req.params = params;
      return true;
    };

    /**
     * Executes the middleware stack.
     * Supports standard and error middleware (4 args).
     *
     * @param {object} req
     * @param {object} res
     */
    const run = (req, res) => {
      let i = 0;
      let finished = false;

      console.log(
        stack.map((l) => ({
          method: l.method,
          path: l.path,
          name: l.handler.name || 'anonymous',
        })),
      );

      const end = () => {
        finished = true;
      };

      /**
       * Moves to the next middleware in the stack.
       * @param {any} [err]
       */
      const next = (err) => {
        if (finished || res._hasSent()) return end();

        const layer = stack[i++];
        if (!layer) return;

        if (!match(layer, req)) return next(err);

        const { handler } = layer;

        try {
          // Error flow
          if (err)
            return handler.length === 4
              ? handler(err, req, res, next)
              : next(err);

          // Skip error handlers in normal flow
          if (handler.length === 4) return next();

          console.log('Running:', handler.name || 'anonymous');

          const result = handler(req, res, next);
          return handleResult(result);
        } catch (e) {
          return next(e);
        }
      };

      /**
       * Handles return values from handlers (sync or async).
       *
       * @param {any} result
       */
      const handleResult = (result) => {
        // If handler returned a Promise → handle async
        if (result && typeof result.then === 'function') {
          return result
            .then(() => {
              if (!res._hasSent()) next();
            })
            .catch(next);
        }

        // If sync handler didn't send response → continue
        if (!res._hasSent()) return;

        // If response was sent → stop everything
        return end();
      };

      next();

      if (!res._hasSent()) {
        res.send('No response (unhandled route)');
      }
    };

    /**
     * Entry point for Apps Script doGet/doPost.
     *
     * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e
     * @param {string} method
     * @returns {any}
     */
    const handle = (e, method) => {
      const route = (e.parameter.route || '/').replace(/\/$/, '') || '/';

      const req = Request.create(e, method);
      req.route = route;

      const res = Response.create();

      run(req, res);

      return res._get();
    };

    /**
     * Creates a route group with a shared prefix and optional middleware.
     *
     * Usage:
     * router.group('/api', mw1, mw2, (api) => { ... })
     *
     * @param {string} prefix
     * @param {...any} args - middleware functions + final callback
     */
    const group = (prefix, ...args) => {
      let callback;
      let middleware = [];

      if (typeof args[0] === 'function') {
        callback = args[0];
      } else {
        middleware = args.slice(0, -1);
        callback = args[args.length - 1];
      }

      /**
       * Prefixes a route path.
       * @param {string} path
       * @returns {string}
       */
      const prefixed = (path) => {
        if (!path) return prefix;
        return `${prefix}${path}`.replace(/\/+/g, '/');
      };

      // Register group-level middleware
      middleware.forEach((mw) => {
        stack.push({ method: null, path: prefix, handler: mw });
      });

      /**
       * Router scoped to this group.
       */
      const groupRouter = {
        /**
         * @param {string} path
         * @param {...Function} handlers
         */
        get: (path, ...handlers) =>
          register('GET', prefixed(path), ...handlers),

        /**
         * @param {string} path
         * @param {...Function} handlers
         */
        post: (path, ...handlers) =>
          register('POST', prefixed(path), ...handlers),

        /**
         * Adds middleware scoped to this group prefix.
         * @param {Function} handler
         */
        use: (handler) => stack.push({ method: null, path: prefix, handler }),

        /**
         * Creates a nested group.
         * @param {string} subPrefix
         * @param {...any} subArgs
         */
        group: (subPrefix, ...subArgs) =>
          group(prefixed(subPrefix), ...subArgs),
      };

      callback(groupRouter);
    };

    return { get, post, use, handle, group };
  };

  return {
    create,
  };
})();
