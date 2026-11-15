// backend/src/routes/vendorRoutes.js
const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { verifyToken, requireRole } = require('../middlewares/auth');

router.get('/', vendorController.getAllVendors);
router.get('/:id', vendorController.getVendorById);

// Vendor-protected routes
router.put('/profile', verifyToken, requireRole('vendor'), vendorController.updateVendorProfile);
router.post('/services', verifyToken, requireRole('vendor'), vendorController.addVendorService);

// Admin-only vendor verification
router.patch('/:id/verify', verifyToken, requireRole('admin'), vendorController.verifyVendor);
router.delete('/:id', verifyToken, requireRole('admin'), vendorController.removeVendor);

module.exports = router;

