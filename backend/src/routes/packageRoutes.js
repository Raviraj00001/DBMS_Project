// backend/src/routes/packageRoutes.js
const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const { verifyToken, requireRole } = require('../middlewares/auth');

router.get('/', packageController.getAllPackages);
router.get('/:id', packageController.getPackageById);

// Admin-only package creation
router.post('/', verifyToken, requireRole('admin'), packageController.createPackage);

module.exports = router;

