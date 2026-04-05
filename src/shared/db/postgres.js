import pkg from 'pg';
import { env } from '../../config/env.js';

const { Pool } = pkg;

const pg = new Pool({
  connectionString: env.databaseUrl
});

export default pg;
