/**
 * Migration runner.
 *
 * Tracks executed migrations in a dedicated sheet
 * and ensures each migration runs only once.
 */
const DbMigrations = (() => {
  const TABLE = '_migrations';

  /**
   * Ensures the migrations tracking table exists.
   *
   * @returns {GoogleAppsScript.Spreadsheet.Sheet}
   */
  const ensureTable = () => {
    const ss = SpreadsheetApp.getActive();
    let sheet = ss.getSheetByName(TABLE);

    if (!sheet) {
      sheet = ss.insertSheet(TABLE);
      sheet.appendRow(['id', 'name', 'run_at']);
    }

    return sheet;
  };

  /**
   * Retrieves executed migration names.
   *
   * @returns {Set<string>}
   */
  const getExecuted = () => {
    const sheet = ensureTable();
    const data = sheet.getDataRange().getValues();

    return new Set(data.slice(1).map((r) => r[1]));
  };

  /**
   * Marks a migration as executed.
   *
   * @param {string} name
   */
  const markExecuted = (name) => {
    const sheet = ensureTable();

    sheet.appendRow([Utilities.getUuid(), name, new Date().toISOString()]);
  };

  /**
   * Runs migrations + optional seeds
   *
   * @param {Migration[]} migrations
   */
  const run = (migrations) => {
    const executed = getExecuted();

    migrations.forEach((m) => {
      if (executed.has(m.name)) return;

      console.log('Running migration:', m.name);

      DB.transaction(() => {
        // schema changes
        if (m.up) m.up(DB, Schema);

        // 🌱 seed data
        if (m.seed) m.seed(DB);
      });

      markExecuted(m.name);
    });
  };

  return { run };
})();
