// backend/src/controllers/paymentController.js
const db = require('../config/db');

/**
 * Record a payment for a wedding booking (Transaction + Trigger auto-updates)
 */
const recordPayment = async (req, res, next) => {
  try {
    const { booking_id, amount, payment_method = 'upi', notes } = req.body;

    if (!booking_id || !amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid booking ID and payment amount are required.' });
    }

    // Check booking existence
    const bookingRes = await db.query(
      `SELECT b.*, u.full_name AS customer_name, u.email AS customer_email 
       FROM bookings b
       JOIN users u ON b.customer_id = u.id
       WHERE b.id = $1`,
      [booking_id]
    );

    if (bookingRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = bookingRes.rows[0];

    // Authorization check
    if (req.user.role === 'customer' && booking.customer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to make payments for this booking.' });
    }

    const balanceRemaining = parseFloat(booking.total_amount) - parseFloat(booking.paid_amount);
    if (parseFloat(amount) > balanceRemaining + 0.01) {
      return res.status(400).json({
        success: false,
        message: `Payment amount (${amount}) exceeds remaining balance (${balanceRemaining.toFixed(2)}).`,
      });
    }

    const txnRef = `TXN-${payment_method.toUpperCase()}-${Date.now()}`;

    // Insert payment record (Trigger will automatically update booking paid_amount and status)
    const paymentInsert = await db.query(
      `INSERT INTO payments (booking_id, transaction_reference, amount, payment_method, payment_status, notes)
       VALUES ($1, $2, $3, $4, 'completed', $5)
       RETURNING *`,
      [booking_id, txnRef, amount, payment_method, notes || 'Booking installment payment']
    );

    // Fetch refreshed booking
    const updatedBookingRes = await db.query(
      `SELECT id, booking_reference, total_amount, paid_amount, status FROM bookings WHERE id = $1`,
      [booking_id]
    );

    res.status(201).json({
      success: true,
      message: 'Payment recorded and verified successfully!',
      payment: paymentInsert.rows[0],
      booking_summary: updatedBookingRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all payments for a booking
 */
const getBookingPayments = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const paymentsRes = await db.query(
      `SELECT * FROM payments WHERE booking_id = $1 ORDER BY payment_date DESC`,
      [bookingId]
    );

    res.json({
      success: true,
      count: paymentsRes.rowCount,
      payments: paymentsRes.rows,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordPayment,
  getBookingPayments,
};

