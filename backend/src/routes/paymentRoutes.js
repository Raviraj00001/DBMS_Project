// backend/src/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middlewares/auth');

router.post('/', verifyToken, paymentController.recordPayment);
router.get('/booking/:bookingId', verifyToken, paymentController.getBookingPayments);

module.exports = router;

