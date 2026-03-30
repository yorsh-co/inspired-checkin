/**
 * Query builder and data access layer for a single table.
 *
 * Supports:
 * - filtering (where)
 * - sorting (orderBy)
 * - limiting (limit)
 * - projection (select)
 * - CRUD operations
 */
const DbTable = (() => {
  class DbTable {
    /**
     * @param {string} name - Table (sheet) name
     * @param {TransactionContext|null} [context=null] - Transaction context
     */
    constructor(name, context = null) {
      this.name = name;
      this._context = context;

      this._where = [];
      this._limit = null;
      this._order = null;
      this._select = null;

      this._timestamps = true;
    }

    // ---------- QUERY ----------

    /**
     * Adds a where condition.
     *
     * @param {string} field
     * @param {string|any} op - Operator or value (defaults to '=')
     * @param {any} [value]
     * @returns {DbTable}
     */
    where(field, op, value) {
      if (arguments.length === 2) {
        value = op;
        op = '=';
      }

      this._where.push({ field, op, value });
      return this;
    }

    /**
     * Limits number of returned rows.
     *
     * @param {number} n
     * @returns {DbTable}
     */
    limit(n) {
      this._limit = n;
      return this;
    }

    /**
     * Orders results by field.
     *
     * @param {string} field
     * @param {'asc'|'desc'} [direction='asc']
     * @returns {DbTable}
     */
    orderBy(field, direction = 'asc') {
      this._order = { field, direction };
      return this;
    }
    /**
     * Selects specific fields.
     *
     * @param {string[]} fields
     * @returns {DbTable}
     */
    select(fields) {
      this._select = fields;
      return this;
    }

    /**
     * Enables/disables automatic timestamps.
     *
     * @param {boolean} [enabled=true]
     * @returns {DbTable}
     */
    timestamps(enabled = true) {
      this._timestamps = enabled;
      return this;
    }

    // ---------- READ ----------

    /**
     * Executes the query and returns matching rows.
     *
     * Applies cache and indexing when not in a transaction.
     *
     * @returns {Object[]}
     */
    get() {
      const sig = this._signature();

      if (!this._context) {
        const cached = DbCache.get(this.name, sig);
        if (cached) return cached;
      }

      let rows = this._readAll();

      // ❗ NO INDEX inside transaction
      if (
        !this._context &&
        this._where.length === 1 &&
        this._where[0].op === '='
      ) {
        const { field, value } = this._where[0];
        const index = DbIndex.ensure(this.name, rows);

        rows = index[field]?.[value] || [];
      } else {
        rows = this._applyWhere(rows);
      }

      rows = this._applyOrder(rows);
      rows = this._applyLimit(rows);
      rows = this._applySelect(rows);

      if (!this._context) {
        DbCache.set(this.name, sig, rows);
      }

      return rows;
    }

    /**
     * Returns the first matching row or null.
     *
     * @returns {Object|null}
     */
    first() {
      return this.limit(1).get()[0] || null;
    }

    // ---------- WRITE ----------

    /**
     * Inserts a new row.
     *
     * @param {Object} data
     * @returns {Object} Inserted row
     */
    insert(data) {
      if (this._context) {
        const raw = this._readRaw();
        const headers = raw[0];

        if (!data.id) data.id = Utilities.getUuid();

        this._applyTimestamps(data, headers, 'insert');

        raw.push(headers.map((h) => data[h] ?? ''));

        this._context._markDirty(this.name);
        return data;
      }

      return DbLock.withLock(() => {
        const sheet = this._getSheet();
        const headers = this._getHeaders();

        if (!data.id) data.id = Utilities.getUuid();

        this._applyTimestamps(data, headers, 'insert');

        sheet.appendRow(headers.map((h) => data[h] ?? ''));

        this._invalidate();
        return data;
      });
    }

    /**
     * Updates rows matching current query.
     *
     * @param {Object} data
     * @returns {Object[]} Updated rows
     */
    update(data) {
      const raw = this._readRaw();
      const headers = raw[0];
      const body = raw.slice(1);

      const updated = [];

      body.forEach((row, i) => {
        const obj = this._rowToObject(headers, row);

        if (this._matchesWhere(obj)) {
          Object.assign(obj, data);
          this._applyTimestamps(obj, headers, 'update');
          body[i] = headers.map((h) => obj[h] ?? '');
          updated.push(obj);
        }
      });

      this._writeAll([headers, ...body]);

      return updated;
    }

    /**
     * Deletes rows matching current query.
     *
     * @returns {boolean}
     */
    delete() {
      const raw = this._readRaw();
      const headers = raw[0];

      const remaining = raw.slice(1).filter((row) => {
        const obj = this._rowToObject(headers, row);
        return !this._matchesWhere(obj);
      });

      this._writeAll([headers, ...remaining]);

      return true;
    }

    // ---------- INTERNAL ----------

    /**
     * Applies automatic timestamps to data.
     *
     * @param {Object} data
     * @param {string[]} headers
     * @param {'insert'|'update'} mode
     * @private
     */
    _applyTimestamps(data, headers, mode) {
      if (!this._timestamps) return;

      const now = new Date().toISOString();

      if (headers.includes('created_at') && mode === 'insert') {
        if (!data.created_at) {
          data.created_at = now;
        }
      }

      if (headers.includes('updated_at')) {
        data.updated_at = now;
      }
    }

    /**
     * Invalidates cache and index for this table.
     * Delegates to transaction if active.
     * @private
     */
    _invalidate() {
      if (this._context) {
        this._context._markDirty(this.name);
        return;
      }

      DbCache.bumpVersion(this.name);
      DbIndex.invalidate(this.name);
    }

    /** @private */
    _getSheet() {
      return SpreadsheetApp.getActive().getSheetByName(this.name);
    }

    /** @private */
    _readRaw() {
      if (this._context) {
        return this._context._load(this.name);
      }
      return this._getSheet().getDataRange().getValues();
    }

    /**
     * Writes full table data.
     *
     * @param {any[][]} values
     * @private
     */
    _writeAll(values) {
      if (this._context) {
        this._context._set(this.name, values);
        return;
      }

      const sheet = this._getSheet();
      sheet.clear();
      sheet.getRange(1, 1, values.length, values[0].length).setValues(values);

      this._invalidate();
    }

    /** @private */
    _getHeaders() {
      return this._readRaw()[0];
    }

    /**
     * Reads all rows as objects.
     *
     * @returns {Object[]}
     * @private
     */
    _readAll() {
      const rows = this._readRaw();
      const headers = rows[0];

      return rows.slice(1).map((r) => this._rowToObject(headers, r));
    }

    /**
     * Converts a row array into an object.
     *
     * @param {string[]} headers
     * @param {any[]} row
     * @returns {Object}
     * @private
     */
    _rowToObject(headers, row) {
      const obj = {};
      headers.forEach((h, i) => (obj[h] = row[i]));
      return obj;
    }

    /**
     * Applies where filters.
     *
     * @param {Object[]} rows
     * @returns {Object[]}
     * @private
     */
    _applyWhere(rows) {
      if (!this._where.length) return rows;
      return rows.filter((r) => this._matchesWhere(r));
    }

    /**
     * Checks if a row matches all conditions.
     *
     * @param {Object} row
     * @returns {boolean}
     * @private
     */
    _matchesWhere(row) {
      return this._where.every(({ field, op, value }) => {
        const v = row[field];

        switch (op) {
          case '=':
            return v == value;
          case '>':
            return v > value;
          case '<':
            return v < value;
          case '>=':
            return v >= value;
          case '<=':
            return v <= value;
          case '!=':
            return v != value;
          default:
            return false;
        }
      });
    }

    /**
     * Applies ordering.
     *
     * @param {Object[]} rows
     * @returns {Object[]}
     * @private
     */
    _applyOrder(rows) {
      if (!this._order) return rows;

      const { field, direction } = this._order;

      return rows.sort((a, b) => {
        if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
        if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
        return 0;
      });
    }

    /**
     * Applies limit.
     *
     * @param {Object[]} rows
     * @returns {Object[]}
     * @private
     */
    _applyLimit(rows) {
      return this._limit ? rows.slice(0, this._limit) : rows;
    }

    /**
     * Applies field selection.
     *
     * @param {Object[]} rows
     * @returns {Object[]}
     * @private
     */
    _applySelect(rows) {
      if (!this._select) return rows;

      return rows.map((row) => {
        const obj = {};
        this._select.forEach((f) => (obj[f] = row[f]));
        return obj;
      });
    }

    /**
     * Generates query signature for caching.
     *
     * @returns {Object}
     * @private
     */
    _signature() {
      return {
        where: this._where,
        limit: this._limit,
        order: this._order,
        select: this._select,
      };
    }
  }

  return DbTable;
})();
