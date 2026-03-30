const { Pool } = require('pg');

const pg = new Pool({
  connectionString: 'postgres://user:password@localhost:5432/db'
});

module.exports = pg;
