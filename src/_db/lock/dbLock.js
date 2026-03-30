/**
 * Concurrency control layer using Apps Script LockService.
 *
 * Ensures that write operations (insert/update/delete) are executed safely
 * without race conditions when multiple executions run in parallel.
 */
const DbLock = (() => {
  /**
   * Executes a function within a script-level lock.
   *
   * If the lock cannot be acquired within the given timeout,
   * an error is thrown to prevent concurrent writes.
   *
   * @template T
   * @param {() => T} fn - Function to execute within the lock
   * @param {number} [timeout=5000] - Time (ms) to wait for the lock
   *
   * @throws {Error} If lock cannot be acquired
   *
   * @returns {T} Result of the executed function
   */
  const withLock = (fn, timeout = 5000) => {
    /** @type {GoogleAppsScript.Lock.Lock} */
    const lock = LockService.getScriptLock();

    if (!lock.tryLock(timeout)) {
      throw HttpError.conflict('Database is busy');
    }

    try {
      return fn();
    } finally {
      lock.releaseLock();
    }
  };

  return { withLock };
})();
