const { Pool } = require('pg');
const connectionString = process.env.DATABASE_URL;


const pool = new Pool({
connectionString,
// Optional ssl for production behind managed DBs:
// ssl: { rejectUnauthorized: false }
});


module.exports = {
query: (text, params) => pool.query(text, params),
pool,
};