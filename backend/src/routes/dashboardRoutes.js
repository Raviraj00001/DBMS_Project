// backend/src/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, requireRole } = require('../middlewares/auth');

router.get('/customer', verifyToken, requireRole('customer'), dashboardController.getCustomerDashboard);
router.get('/vendor', verifyToken, requireRole('vendor'), dashboardController.getVendorDashboard);
router.get('/admin', verifyToken, requireRole('admin'), dashboardController.getAdminDashboard);

module.exports = router;

