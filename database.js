const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'procuratio_db',
    password: 'Stanley97231!',
    port: 5432
});

module.exports = pool;
