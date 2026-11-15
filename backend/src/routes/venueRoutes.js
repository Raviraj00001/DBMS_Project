// backend/src/routes/venueRoutes.js
const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController');
const { verifyToken, requireRole } = require('../middlewares/auth');

router.get('/', venueController.getAllVenues);
router.get('/:id', venueController.getVenueById);
router.get('/:id/availability', venueController.checkVenueAvailability);

// Admin-only endpoints
router.post('/', verifyToken, requireRole('admin'), venueController.createVenue);
router.put('/:id', verifyToken, requireRole('admin'), venueController.updateVenue);
router.delete('/:id', verifyToken, requireRole('admin'), venueController.deleteVenue);

module.exports = router;

