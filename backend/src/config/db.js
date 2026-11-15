// backend/src/config/db.js
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'wedding_db',
  max: 20, // Max clients in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

// Support connection string if provided
if (process.env.DATABASE_URL) {
  poolConfig.connectionString = process.env.DATABASE_URL;
  if (process.env.DATABASE_URL.includes('render') || process.env.DATABASE_URL.includes('neon') || process.env.DATABASE_URL.includes('supabase')) {
    poolConfig.ssl = { rejectUnauthorized: false };
  }
}

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  // Client connected successfully
});

pool.on('error', (err) => {
  console.error('[POSTGRES POOL ERROR]', err.message);
});

/**
 * Standard query wrapper with logging and execution timer
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      // console.log(`[SQL EXEC] ${duration}ms | rows: ${res.rowCount} | query: ${text.substring(0, 80).replace(/\s+/g, ' ')}...`);
    }
    return res;
  } catch (error) {
    console.error(`[SQL ERROR] in query: ${text.substring(0, 100)}...`);
    console.error(`[SQL ERROR MSG] ${error.message}`);
    throw error;
  }
};

/**
 * Transaction helper for atomic operations (ACID)
 */
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Check active database connectivity
 */
const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW() as now, current_database() as db_name, version() as version');
    return {
      connected: true,
      time: res.rows[0].now,
      database: res.rows[0].db_name,
      version: res.rows[0].version,
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
    };
  }
};

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
};

