/**
 * Main database facade.
 *
 * Provides entry points for:
 * - accessing tables
 * - running transactions
 *
 * Usage:
 *   DB.table('users').where('id', 1).first();
 *   DB.transaction(trx => { ... });
 */
const DB = (() => {
  /**
   * Returns a query builder instance for a table.
   *
   * @param {string} name - Table (sheet) name
   * @returns {InstanceType<typeof DbTable>}
   */
  const table = name => new DbTable(name);

  /**
   * Executes a transactional function.
   *
   * @template T
   * @param {(trx: TransactionContext) => T} fn
   * @returns {T}
   */
  const transaction = fn => DbTransaction.run(fn);

  return {
    table,
    transaction
  };
})();
