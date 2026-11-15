// backend/src/server.js
const app = require('./app');
const db = require('./config/db');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log('================================================================');
  console.log('  WEDDING PLANNING & BOOKING MANAGEMENT SYSTEM - BACKEND API');
  console.log('  College DBMS Project | Node.js + Express.js + PostgreSQL (pg)');
  console.log('  Authors: Ravi Raj, Manpreet, Perirt, Raj Tripathi');
  console.log('================================================================');
  console.log(`  🚀 Server listening on: http://localhost:${PORT}`);
  console.log(`  🩺 Health check:        http://localhost:${PORT}/api/health`);
  console.log(`  📊 DBMS Queries API:    http://localhost:${PORT}/api/reports/queries`);

  // Test database connection
  const dbStatus = await db.testConnection();
  if (dbStatus.connected) {
    console.log(`  ✅ PostgreSQL Connected: "${dbStatus.database}" on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);
  } else {
    console.log(`  ⚠️  PostgreSQL Notice: Could not connect to database.`);
    console.log(`     Error: ${dbStatus.error}`);
    console.log(`     Tip: Configure your credentials in backend/.env and run: npm run db:init`);
  }
  console.log('================================================================\n');
});

process.on('unhandledRejection', (err) => {
  console.error('[UNHANDLED REJECTION]', err);
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
});

