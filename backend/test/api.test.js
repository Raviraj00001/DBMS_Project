// backend/test/api.test.js
const assert = require('assert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

async function runTests() {
  console.log('\n========================================');
  console.log(' RUNNING BACKEND SUITE & SMOKE TESTS');
  console.log('========================================\n');

  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`, err.message);
      failed++;
    }
  }

  // Test 1: Express App instance
  test('Express app should be properly instantiated and have middleware', () => {
    assert.strictEqual(typeof app, 'function');
    assert.ok(app._router, 'Express app should have an active router');
  });

  // Test 2: Bcrypt Password Hashing & Comparison
  test('Bcrypt should reliably hash and verify passwords', () => {
    const rawPassword = 'password123';
    const hash = bcrypt.hashSync(rawPassword, 10);
    assert.ok(hash.startsWith('$2a$') || hash.startsWith('$2b$'));
    assert.strictEqual(bcrypt.compareSync(rawPassword, hash), true);
    assert.strictEqual(bcrypt.compareSync('wrongPassword', hash), false);
  });

  // Test 3: JWT Token Generation & Verification
  test('JWT token generation and verification should preserve payload and expiration', () => {
    const secret = 'test_secret_wedding_2026';
    const payload = { id: 101, email: 'ravi@example.com', role: 'admin' };
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });

    assert.ok(typeof token === 'string' && token.length > 20);

    const decoded = jwt.verify(token, secret);
    assert.strictEqual(decoded.id, 101);
    assert.strictEqual(decoded.email, 'ravi@example.com');
    assert.strictEqual(decoded.role, 'admin');
  });

  // Test 4: Verify DBMS Queries Catalog has 20+ queries
  test('DBMS query catalog should contain at least 20 documented queries', () => {
    const reportController = require('../src/controllers/reportController');
    assert.ok(typeof reportController.getAvailableQueries === 'function');
    
    // Fake request / response object
    let captured = null;
    const req = {};
    const res = {
      json: (data) => { captured = data; },
      status: () => res
    };

    reportController.getAvailableQueries(req, res);
    assert.ok(captured, 'Response should not be null');
    assert.ok(captured.success === true);
    assert.ok(captured.total_queries >= 20, `Expected >= 20 queries, found ${captured.total_queries}`);
  });

  console.log('\n----------------------------------------');
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

