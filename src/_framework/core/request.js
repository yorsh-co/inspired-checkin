/**
 * Request factory for Apps Script WebApp.
 * Normalizes route, method, query params, and body.
 */
const Request = (() => {
  /**
   * Normalizes a route string.
   * Ensures leading slash and removes trailing slash (except root).
   *
   * @param {string} route
   * @returns {string}
   */
  const normalizeRoute = (route) => {
    if (!route) return '/';
    if (!route.startsWith('/')) route = '/' + route;
    if (route.length > 1 && route.endsWith('/')) {
      route = route.slice(0, -1);
    }
    return route;
  };

  /**
   * Determines the HTTP method.
   * Falls back to POST if not explicitly provided.
   *
   * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e
   * @param {string} method
   * @returns {string}
   */
  const normalizeMethod = (e, method) => {
    if (method === 'GET') return 'GET';
    return (e.parameter.method || method || 'POST').toUpperCase();
  };

  /**
   * Safely parses a JSON string.
   *
   * @param {string} str
   * @returns {Object}
   */
  const safeJsonParse = (str) => {
    try {
      return JSON.parse(str);
    } catch {
      return {};
    }
  };

  /**
   * Parses request body from Apps Script event.
   *
   * @param {GoogleAppsScript.Events.DoPost} e
   * @returns {Object}
   */
  const parseBody = (e) => {
    if (!e.postData || !e.postData.contents) return {};
    return safeJsonParse(e.postData.contents);
  };

  /**
   * Creates a normalized request object.
   *
   * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e
   * @param {string} method
   * @returns {{
   *  route: string,
   *  method: string,
   *  params: Object,
   *  query: Object,
   *  body: Object,
   *  event: GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost,
   *  user: any,
   *  isApi: boolean,
   *  get: (key: string) => any,
   *  has: (key: string) => boolean,
   *  all: () => Object,
   *  header: (name: string) => any
   * }}
   */
  const create = (e, method) => {
    const route = normalizeRoute(e.parameter?.route || '/');
    const finalMethod = normalizeMethod(e, method);

    const params = e.parameter || {};
    const body = parseBody(e);

    return {
      // Core
      route,
      method: finalMethod,

      // Data
      params,
      query: params,
      body,

      // Raw event
      event: e,

      // Auth
      user: null,

      // Meta
      isApi: route.startsWith('/api'),

      _matched: false,

      /**
       * Gets a parameter or query value by key.
       *
       * @param {string} key
       * @returns {any}
       */
      get: (key) => params?.[key] ?? null,

      /**
       * Checks if a parameter exists.
       *
       * @param {string} key
       * @returns {boolean}
       */
      has: (key) => key in params,

      /**
       * Returns all request input (params + body).
       *
       * @returns {Object}
       */
      all: () => ({
        ...params,
        ...body,
      }),

      /**
       * Retrieves a request header (not supported in Apps Script).
       *
       * @param {string} _name
       * @returns {null}
       */
      header: (_name) => {
        return null;
      },
    };
  };

  return {
    create,
  };
})();
