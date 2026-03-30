/**
 * HTML rendering engine for Apps Script WebApps.
 * Provides layout support, partials, components, and safe templating helpers.
 */
const HtmlResponse = (() => {
  /** @type {Object|null} */
  let config = null;

  /**
   * Sets global configuration for HTML rendering.
   *
   * Expected shape:
   * {
   *   html: {
   *     basePaths: {
   *       views: string,
   *       layouts: string,
   *       partials: string,
   *       components: string,
   *       assets: string,
   *       css: string,
   *       js: string
   *     },
   *     defaultLayout: string
   *   },
   *   appName?: string
   * }
   *
   * @param {Object} cfg
   */
  const setConfig = (cfg) => {
    config = cfg;
  };

  /**
   * Returns configured base paths.
   *
   * @returns {Object}
   */
  const getBasePaths = () => config.html.basePaths;

  /**
   * Resolves a view path.
   *
   * @param {string} view
   * @returns {string}
   */
  const resolveView = (view) => {
    if (view.startsWith('webapp/')) return view;

    const basePaths = getBasePaths();
    if (!view.endsWith('.html')) {
      return `${basePaths.views}/${view}.html`;
    }

    return `${basePaths.views}/${view}`;
  };

  /**
   * Resolves a layout path.
   *
   * @param {string|false} layout
   * @returns {string|null}
   */
  const resolveLayout = (layout) => {
    if (layout === false) return null;

    const basePaths = getBasePaths();
    if (!layout)
      return `${basePaths.layouts}/${config.html.defaultLayout}.html`;

    if (layout.startsWith('webapp/')) return layout;

    if (!layout.endsWith('.html')) {
      return `${basePaths.layouts}/${layout}.html`;
    }

    return `${basePaths.layouts}/${layout}`;
  };

  /**
   * Renders an HTML response using a view and optional layout.
   *
   * Supports:
   * - layouts
   * - partials
   * - components
   * - asset includes (css/js)
   * - safe HTML escaping helpers
   *
   * @param {string} view - View name or path
   * @param {Object} [locals={}] - Data passed to templates
   * @param {{
   *   layout?: string|false,
   *   title?: string,
   *   favicon?: string,
   *   status?: number
   * }} [options={}]
   *
   * @returns {GoogleAppsScript.HTML.HtmlOutput}
   */
  const render = (view, locals = {}, options = {}) => {
    /**
     * Tracks already included files to avoid duplicates.
     * @type {Set<string>}
     */
    const included = new Set();

    /**
     * Includes a file only once.
     *
     * @param {string} path
     * @returns {string}
     */
    const includeOnce = (path) => {
      if (included.has(path)) return '';
      included.add(path);
      return HtmlService.createHtmlOutputFromFile(path).getContent();
    };

    /**
     * Escapes HTML to prevent XSS.
     *
     * @param {any} str
     * @returns {string}
     */
    const escapeHtml = (str) => {
      if (str === null || str === undefined) return '';

      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    /**
     * Safe template helpers.
     */
    const safeHelpers = {
      /** Force HTML escaping */
      $e: (value) => escapeHtml(value),

      /** Explicitly allow raw (unsafe) output */
      $raw: (value) => value ?? '',
    };

    const basePaths = getBasePaths();

    /**
     * Include helpers available inside templates.
     */
    const include = {
      /**
       * Includes a raw file.
       * @param {string} path
       */
      raw: (path) => includeOnce(path),

      /**
       * Includes an asset by type (css/js/etc).
       * @param {string} type
       * @param {string} name
       */
      asset: (type, name) =>
        includeOnce(
          `${basePaths.assets}/${type}/${name.replace(/^\//, '')}.${type}.html`,
        ),

      /**
       * Includes a CSS file.
       * @param {string} name
       */
      css: (name) =>
        includeOnce(`${basePaths.css}/${name.replace(/^\//, '')}.css.html`),

      /**
       * Includes a JS file.
       * @param {string} name
       */
      js: (name) =>
        includeOnce(`${basePaths.js}/${name.replace(/^\//, '')}.js.html`),

      /**
       * Renders a partial template.
       *
       * @param {string} name
       * @param {Object} [data]
       * @param {Object} [parentLocals]
       * @returns {string}
       */
      partial: (name, data = {}, parentLocals = {}) => {
        const template = HtmlService.createTemplateFromFile(
          `${basePaths.partials}/${name.replace(/^\//, '')}.html`,
        );

        Object.assign(template, {
          locals: {
            ...parentLocals,
            ...data,
          },
          ...parentLocals,
          ...data,
          include,
          ...safeHelpers,
        });

        return template.evaluate().getContent();
      },

      /**
       * Renders a component with props and slots.
       *
       * @param {string} name
       * @param {{ children?: any, slots?: Object }} [props]
       * @param {Object} [parentLocals]
       * @returns {string}
       */
      component: (name, props = {}, parentLocals = {}) => {
        const template = HtmlService.createTemplateFromFile(
          `${basePaths.components}/${name.replace(/^\//, '')}`,
        );

        const { children, slots = {}, ...rest } = props;

        Object.assign(template, {
          locals: {
            ...parentLocals,
            ...rest,
            children,
            slots,
          },
          ...parentLocals,
          ...rest,
          children,
          slots,
          include,
          ...safeHelpers,
        });

        return template.evaluate().getContent();
      },
    };

    // ---------- VIEW ----------

    const viewPath = resolveView(view);
    const viewTemplate = HtmlService.createTemplateFromFile(viewPath);

    Object.assign(viewTemplate, {
      ...locals,
      include: {
        ...include,
        partial: (name, data = {}) => include.partial(name, data, locals),
        component: (name, props = {}) => include.component(name, props, locals),
      },

      // Shortcuts
      $partial: (name, data = {}) => include.partial(name, data, locals),
      $component: (name, props = {}) =>
        include.component(name, props, locals),
      $css: include.css,
      $js: include.js,

      // Safety
      ...safeHelpers,
    });

    const body = viewTemplate.evaluate().getContent();

    // ---------- LAYOUT ----------

    const layoutPath = resolveLayout(options.layout || locals.layout);
    if (!layoutPath) return HtmlService.createHtmlOutput(body);

    const layoutTemplate = HtmlService.createTemplateFromFile(layoutPath);

    Object.assign(layoutTemplate, {
      ...locals,
      body,
      include: {
        ...include,
        partial: (name, data = {}) => include.partial(name, data, locals),
        component: (name, props = {}) =>
          include.component(name, props, locals),
      },

      // Shortcuts
      $partial: (name, data = {}) => include.partial(name, data, locals),
      $component: (name, props = {}) =>
        include.component(name, props, locals),
      $css: include.css,
      $js: include.js,

      // Safety
      ...safeHelpers,
    });

    const output = layoutTemplate.evaluate();

    // ---------- META ----------

    const title = options.title || locals.pageTitle || config.appName;
    if (title) output.setTitle(title);

    const favicon = options.favicon || config.favicon;
    if (favicon) output.setFaviconUrl(favicon);

    return output
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('apple-mobile-web-app-capable', 'no')
      .addMetaTag('mobile-web-app-capable', 'no')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  };

  return {
    render,
    setConfig,
  };
})();
