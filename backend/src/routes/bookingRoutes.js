// backend/src/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken, requireRole } = require('../middlewares/auth');
const { validateBooking } = require('../middlewares/validator');

// Create booking (Customer)
router.post('/', verifyToken, requireRole('customer', 'admin'), validateBooking, bookingController.createBooking);

// Customer bookings list
router.get('/my-bookings', verifyToken, requireRole('customer'), bookingController.getCustomerBookings);

// Vendor bookings list
router.get('/vendor-orders', verifyToken, requireRole('vendor'), bookingController.getVendorBookings);

// Admin all bookings list
router.get('/admin/all', verifyToken, requireRole('admin'), bookingController.getAllBookingsAdmin);

// Single booking by ID
router.get('/:id', verifyToken, bookingController.getBookingById);

// Update status (Admin or Vendor)
router.patch('/:id/status', verifyToken, requireRole('admin', 'vendor'), bookingController.updateBookingStatus);

// Cancel booking
router.post('/:id/cancel', verifyToken, bookingController.cancelBooking);

module.exports = router;

