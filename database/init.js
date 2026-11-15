// database/init.js
const fs = require('fs');
const path = require('path');
const { Pool, Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const config = {
  host: process.env.DB_HOST || process.env.PGHOST || 'localhost',
  port: parseInt(process.env.DB_PORT || process.env.PGPORT || '5432', 10),
  user: process.env.DB_USER || process.env.PGUSER || 'postgres',
  password: process.env.DB_PASSWORD || process.env.PGPASSWORD || 'postgres',
  database: process.env.DB_NAME || process.env.PGDATABASE || 'wedding_db',
};

async function ensureDatabaseExists() {
  // Connect to default 'postgres' database to check/create the target DB
  const client = new Client({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: 'postgres',
  });

  try {
    await client.connect();
    console.log(`[DB INIT] Connected to PostgreSQL server on ${config.host}:${config.port}`);
    
    const checkRes = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [config.database]
    );

    if (checkRes.rowCount === 0) {
      console.log(`[DB INIT] Database '${config.database}' does not exist. Creating now...`);
      await client.query(`CREATE DATABASE "${config.database}"`);
      console.log(`[DB INIT] Database '${config.database}' created successfully.`);
    } else {
      console.log(`[DB INIT] Database '${config.database}' already exists.`);
    }
  } catch (err) {
    throw new Error(`Failed to check or create database: ${err.message}`);
  } finally {
    await client.end();
  }
}

async function runSchemaAndSeed() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const seedPath = path.join(__dirname, 'seed.sql');

  if (!fs.existsSync(schemaPath) || !fs.existsSync(seedPath)) {
    throw new Error(`Missing schema.sql or seed.sql in ${__dirname}`);
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const seedSql = fs.readFileSync(seedPath, 'utf8');

  const pool = new Pool(config);

  try {
    const client = await pool.connect();
    console.log(`[DB INIT] Connected to target database '${config.database}'. Executing schema...`);
    
    // Execute schema DDL
    await client.query(schemaSql);
    console.log('[DB INIT] Schema DDL executed successfully! (Tables, Views, Functions, Triggers created)');

    // Execute seed DML
    console.log('[DB INIT] Executing seed data...');
    await client.query(seedSql);
    console.log('[DB INIT] Seed data inserted successfully!');

    // Check table row counts
    const tables = ['users', 'venues', 'vendors', 'services', 'packages', 'bookings', 'payments', 'reviews'];
    console.log('\n--- VERIFICATION OF SEED DATA ---');
    for (const table of tables) {
      const res = await client.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`Table '${table}': ${res.rows[0].count} records`);
    }

    client.release();
    console.log('\n[DB INIT] PostgreSQL database setup completed with zero errors!\n');
  } catch (err) {
    throw new Error(`Execution error: ${err.message}`);
  } finally {
    await pool.end();
  }
}

async function main() {
  console.log('================================================================');
  console.log(' WEDDING PLANNING & BOOKING MANAGEMENT SYSTEM - DATABASE SETUP');
  console.log(' College DBMS Project | Team: Ravi Raj, Manpreet, Perirt, Raj Tripathi');
  console.log('================================================================');
  console.log(`Target: ${config.user}@${config.host}:${config.port}/${config.database}`);

  try {
    await ensureDatabaseExists();
    await runSchemaAndSeed();
  } catch (err) {
    console.error('\n[POSTGRES CONNECTION NOTICE]');
    console.error(`Could not connect to PostgreSQL server: ${err.message}`);
    console.log('\n----------------------------------------------------------------');
    console.log('PostgreSQL Quick Setup Guide:');
    console.log('1. Ensure PostgreSQL is installed and running on your system.');
    console.log('   Windows: Start "services.msc" and start "postgresql-x64-XX" service.');
    console.log('   Or Docker: docker run --name postgres-wedding -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=wedding_db -p 5432:5432 -d postgres:16');
    console.log('2. Update credentials in `backend/.env` (DB_USER, DB_PASSWORD, DB_NAME, DB_PORT).');
    console.log('3. Re-run: node database/init.js (or npm run db:init from backend).');
    console.log('----------------------------------------------------------------\n');
  }
}

main();

