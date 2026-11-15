// backend/src/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, requireRole } = require('../middlewares/auth');

// Protected: Only authenticated Administrators / Faculty can run DBMS reports & live queries
router.get('/queries', verifyToken, requireRole('admin'), reportController.getAvailableQueries);
router.post('/run-query', verifyToken, requireRole('admin'), reportController.executeQuery);
router.get('/schema-stats', verifyToken, requireRole('admin'), reportController.getSchemaStats);

module.exports = router;

