const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'procuratio-server.postgres.database.azure.com',
    database: 'procuratio_db',
    password: 'Stanley97231!',
    port: 5432,
    ssl: {
        rejectUnauthorized: false,
        require: true
      }
});

module.exports = pool;
