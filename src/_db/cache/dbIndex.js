/**
 * Simple in-memory + CacheService indexing layer.
 * Provides fast lookup for equality-based queries.
 *
 * Index structure:
 * {
 *   fieldName: {
 *     fieldValue: [row, row, ...]
 *   }
 * }
 */
const DbIndex = (() => {
  /** @type {GoogleAppsScript.Cache.Cache} */
  const cache = CacheService.getScriptCache();

  /**
   * Generates cache key for a table index.
   *
   * @param {string} table
   * @returns {string}
   */
  const key = (table) => `idx:${table}`;

  /**
   * Builds an index for a table from rows.
   *
   * @param {string} table
   * @param {Object[]} rows
   *
   * @returns {{
   *   [field: string]: {
   *     [value: string]: Object[]
   *   }
   * }}
   */
  const build = (table, rows) => {
    /** @type {{
     *   [field: string]: {
     *     [value: string]: Object[]
     *   }
     * }}
     */
    const index = {};

    rows.forEach((row) => {
      Object.keys(row).forEach((field) => {
        index[field] = index[field] || {};

        const value = row[field];

        if (!index[field][value]) {
          index[field][value] = [];
        }

        index[field][value].push(row);
      });
    });

    cache.put(key(table), JSON.stringify(index), 21600);

    return index;
  };

  /**
   * Retrieves an index from cache.
   *
   * @param {string} table
   * @returns {{
   *   [field: string]: {
   *     [value: string]: Object[]
   *   }
   * } | null}
   */
  const get = (table) => {
    const raw = cache.get(key(table));
    return raw ? JSON.parse(raw) : null;
  };

  /**
   * Ensures an index exists (fetch or build).
   *
   * @param {string} table
   * @param {Object[]} rows
   *
   * @returns {{
   *   [field: string]: {
   *     [value: string]: Object[]
   *   }
   * }}
   */
  const ensure = (table, rows) => {
    return get(table) || build(table, rows);
  };

  /**
   * Invalidates (removes) cached index for a table.
   *
   * @param {string} table
   */
  const invalidate = (table) => {
    cache.remove(key(table));
  };

  return { ensure, invalidate };
})();
