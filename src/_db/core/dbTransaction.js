/**
 * Simulated transaction manager.
 * Provides atomic-like operations using LockService and in-memory buffering.
 */
const DbTransaction = (() => {
  /**
   * Runs a transaction.
   *
   * @template T
   * @param {(trx: TransactionContext) => T} fn
   * @returns {T}
   */
  const run = fn => {
    return DbLock.withLock(() => {
      const context = createContext();

      try {
        const result = fn(context);

        context._commit();

        return result;
      } catch (err) {
        context._rollback();
        throw err;
      }
    });
  };

  /**
   * Creates a transaction context.
   *
   * @returns {TransactionContext}
   */
  const createContext = () => {
    /** @type {Object.<string, any[][]>} */
    const tables = {};

    /** @type {Set<string>} */
    const dirty = new Set();

    /**
     * Loads table into memory.
     * @param {string} name
     * @returns {any[][]}
     */
    const load = name => {
      if (!tables[name]) {
        const sheet = SpreadsheetApp.getActive().getSheetByName(name);
        tables[name] = sheet.getDataRange().getValues();
      }
      return tables[name];
    };

    /**
     * Overrides table data.
     * @param {string} name
     * @param {any[][]} values
     */
    const set = (name, values) => {
      tables[name] = values;
      dirty.add(name);
    };

    /**
     * Marks table as modified.
     * @param {string} name
     */
    const markDirty = name => {
      dirty.add(name);
    };

    /**
     * Commit changes to sheets.
     */
    const commit = () => {
      dirty.forEach(name => {
        const sheet = SpreadsheetApp.getActive().getSheetByName(name);
        const data = tables[name];

        sheet.clear();
        sheet.getRange(1, 1, data.length, data[0].length).setValues(data);

        DbCache.bumpVersion(name);
        DbIndex.invalidate(name);
      });
    };

    const rollback = () => {};

    /**
     * Transaction-aware table
     * @param {string} name
     */
    const table = name => new DbTable(name, context);

    const context = {
      table,

      _load: load,
      _set: set,
      _markDirty: markDirty,

      _commit: commit,
      _rollback: rollback
    };

    return context;
  };

  return { run };
})();
