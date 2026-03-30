/**
 * @typedef {Object} Migration
 * @property {string} name
 * @property {(db: typeof DB, schema: typeof Schema) => void} [up]
 * @property {(db: typeof DB) => void} [seed]
 * @property {Function} [down]
 */

/**
 * @typedef {Object} TransactionContext
 * @property {(name: string) => InstanceType<typeof DbTable>} table
 */

/**
 * @typedef {Object} WhereCondition
 * @property {string} field
 * @property {'='|'!='|'>'|'<'|'>='|'<='} op
 * @property {any} value
 */

/**
 * @typedef {Object} OrderBy
 * @property {string} field
 * @property {'asc'|'desc'} direction
 */

/**
 * @typedef {Object} QuerySignature
 * @property {WhereCondition[]} where
 * @property {number|null} limit
 * @property {OrderBy|null} order
 * @property {string[]|null} select
 */

/**
 * @typedef {Object.<string, any>} DbRow
 */

/**
 * @typedef {any[][]} SheetData
 */

/**
 * @typedef {Object.<string, Object.<string, DbRow[]>>} DbIndexMap
 */

/**
 * @typedef {Object} DbCacheInterface
 * @property {(table: string, query: QuerySignature) => any[]|null} get
 * @property {(table: string, query: QuerySignature, value: any[]) => void} set
 * @property {(table: string) => void} bumpVersion
 */

/**
 * @typedef {Object} TableBuilder
 * @property {(name: string) => void} string
 * @property {(name: string) => void} number
 * @property {(name: string) => void} boolean
 * @property {(name: string) => void} timestamp
 * @property {string[]} _columns
 */

/**
 * @typedef {Object} TimestampedRow
 * @property {string} [created_at]
 * @property {string} [updated_at]
 */
