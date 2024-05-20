const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const queryDatabase = async (query, params) => {
  const client = await pool.connect();
  try {
    const res = await client.query(query, params);
    return res.rows;
  } catch (err) {
    console.error('Database query error:', err.stack);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = queryDatabase;
