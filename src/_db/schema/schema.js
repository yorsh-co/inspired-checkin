/**
 * Schema builder for managing spreadsheet-backed tables.
 *
 * Supports:
 * - table creation
 * - non-destructive schema updates
 */
const Schema = (() => {
  /**
   * Gets or creates a sheet
   * @param {string} name
   * @returns {GoogleAppsScript.Spreadsheet.Sheet}
   */
  const getOrCreateSheet = name => {
    const ss = SpreadsheetApp.getActive();
    return ss.getSheetByName(name) || ss.insertSheet(name);
  };

  /**
   * Builds a table definition
   * @returns {TableBuilder}
   */
  const createBuilder = () => {
    const _columns = [];

    return {
      string: name => _columns.push(name),
      number: name => _columns.push(name),
      boolean: name => _columns.push(name),
      timestamp: name => _columns.push(name),

      _columns
    };
  };

  /**
   * Creates a new table (overwrites existing structure)
   *
   * @param {string} name
   * @param {(t: TableBuilder) => void} callback
   */
  const createTable = (name, callback) => {
    const sheet = getOrCreateSheet(name);

    const builder = createBuilder();
    callback(builder);

    let columns = builder._columns;

    if (!columns.includes('id')) {
      columns.unshift('id');
    }

    sheet.clear();
    sheet.appendRow(columns);
  };

  /**
   * Alters an existing table (adds missing columns only)
   * Does NOT remove or reorder existing columns.
   *
   * @param {string} name
   * @param {(t: TableBuilder) => void} callback
   */
  const alterTable = (name, callback) => {
    const sheet = getOrCreateSheet(name);

    const data = sheet.getDataRange().getValues();
    const existing = data.length ? data[0] : [];

    const builder = createBuilder();
    callback(builder);

    let newCols = builder._columns;

    if (!existing.includes('id')) {
      existing.unshift('id');
    }

    // Only add missing columns
    const merged = [...existing];

    newCols.forEach(col => {
      if (!merged.includes(col)) {
        merged.push(col);
      }
    });

    // If nothing changed → exit early
    if (merged.length === existing.length) return;

    const rows = data.slice(1);

    const updatedRows = rows.map(row => {
      const obj = {};
      existing.forEach((h, i) => (obj[h] = row[i]));

      return merged.map(h => obj[h] ?? '');
    });

    sheet.clear();
    sheet.getRange(1, 1, 1, merged.length).setValues([merged]);

    if (updatedRows.length) {
      sheet
        .getRange(2, 1, updatedRows.length, merged.length)
        .setValues(updatedRows);
    }
  };

  return {
    createTable,
    alterTable
  };
})();
