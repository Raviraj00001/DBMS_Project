// backend/src/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken, requireRole } = require('../middlewares/auth');

router.post('/', verifyToken, requireRole('customer'), reviewController.createReview);
router.get('/venue/:venueId', reviewController.getVenueReviews);
router.get('/vendor/:vendorId', reviewController.getVendorReviews);

module.exports = router;

