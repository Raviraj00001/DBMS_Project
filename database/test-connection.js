// database/test-connection.js
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'wedding_db',
  connectionTimeoutMillis: 3000,
});

async function testConnection() {
  console.log('Testing PostgreSQL connection...');
  try {
    const res = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('Connection successful!');
    console.log('Current Database Time:', res.rows[0].current_time);
    console.log('PostgreSQL Version:', res.rows[0].pg_version);
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();

