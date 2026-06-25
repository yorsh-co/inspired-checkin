import pkg from 'pg';
import { env } from '../../config/env.js';

const { Pool } = pkg;

const pg = new Pool(env.postgresConfig);

pg.on('error', (err) => {
  console.error('Unexpected Postgres pool error:', err);
});

export default pg;
