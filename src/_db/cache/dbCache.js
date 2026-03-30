/**
 * Query result caching layer using Apps Script CacheService.
 *
 * Implements:
 * - short-lived query caching
 * - table-level versioning for invalidation
 *
 * Cache key format:
 *   `${table}:${version}:${querySignature}`
 */
const DbCache = (() => {
  /** @type {GoogleAppsScript.Cache.Cache} */
  const cache = CacheService.getScriptCache();

  /**
   * Retrieves current cache version for a table.
   * Used to invalidate all cached queries when data changes.
   *
   * @param {string} table
   * @returns {string} Version string
   */
  const getVersion = (table) => cache.get(`v:${table}`) || '0';

  /**
   * Bumps (updates) the cache version for a table.
   * Effectively invalidates all previous cached queries.
   *
   * @param {string} table
   */
  const bumpVersion = (table) =>
    cache.put(`v:${table}`, Date.now().toString(), 21600);

  /**
   * Generates a cache key for a given query.
   *
   * @param {string} table
   * @param {Object} query - Query signature (from QueryBuilder)
   * @returns {string}
   */
  const makeKey = (table, query) =>
    `${table}:${getVersion(table)}:${JSON.stringify(query)}`;

  /**
   * Retrieves cached query result.
   *
   * @param {string} table
   * @param {Object} query
   * @returns {any[]|null} Cached result or null if not found
   */
  const get = (table, query) => {
    const data = cache.get(makeKey(table, query));
    return data ? JSON.parse(data) : null;
  };

  /**
   * Stores query result in cache.
   *
   * Uses a short TTL (60s) to balance freshness and performance.
   *
   * @param {string} table
   * @param {Object} query
   * @param {any[]} value - Query result
   */
  const set = (table, query, value) => {
    cache.put(makeKey(table, query), JSON.stringify(value), 60);
  };

  return { get, set, bumpVersion };
})();