// FIXME:
// Example

/**
 * TODO: add to package.json
 * "scripts": {
 *   "migrate": "node scripts/migrate.js",
 *   "start": "node server.js"
 * }
 */

import pg from './shared/db/postgres.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const run = async () => {
  const migrationsDir = path.join(__dirname, '../migrations');

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort(); // alphabetical = chronological with numeric prefixes

  // Create a tracking table if it doesn't exist
  await pg.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      filename   TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  for (const file of files) {
    const { rows } = await pg.query(
      'SELECT 1 FROM _migrations WHERE filename = $1',
      [file],
    );

    if (rows.length > 0) {
      console.log(`[migrate] skipping ${file} (already applied)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    await pg.query(sql);
    await pg.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);

    console.log(`[migrate] applied ${file}`);
  }

  await pg.end();
};

run().catch((err) => {
  console.error('[migrate] failed:', err);
  process.exit(1);
});
