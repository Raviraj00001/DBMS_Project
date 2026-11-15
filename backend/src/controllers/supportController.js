const db = require('../config/db');

const createRequest = async (req, res, next) => {
  try {
    const { subject, category, message } = req.body;
    const allowedCategories = ['general', 'booking', 'payment', 'venue', 'vendor', 'complaint'];
    if (!subject?.trim() || subject.trim().length > 160 || !message?.trim() || message.trim().length > 5000) {
      return res.status(400).json({ success: false, message: 'Enter a subject (up to 160 characters) and a message (up to 5,000 characters).' });
    }
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ success: false, message: 'Choose a valid request category.' });
    }

    const result = await db.query(
      `INSERT INTO customer_support_requests (user_id, subject, category, message)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, subject.trim(), category, message.trim()]
    );
    res.status(201).json({ success: true, request: result.rows[0], message: 'Your request has been sent to our support team.' });
  } catch (error) {
    next(error);
  }
};

const getMyRequests = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, subject, category, message, status, admin_response, created_at, updated_at
       FROM customer_support_requests WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, requests: result.rows });
  } catch (error) {
    next(error);
  }
};

const getAllRequests = async (_req, res, next) => {
  try {
    const result = await db.query(
      `SELECT r.*, u.full_name AS customer_name, u.email AS customer_email
       FROM customer_support_requests r JOIN users u ON u.id = r.user_id
       ORDER BY CASE r.status WHEN 'open' THEN 0 WHEN 'in_review' THEN 1 ELSE 2 END, r.created_at DESC`
    );
    res.json({ success: true, requests: result.rows });
  } catch (error) {
    next(error);
  }
};

const updateRequest = async (req, res, next) => {
  try {
    const { status, admin_response } = req.body;
    if (!['open', 'in_review', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Choose a valid request status.' });
    }
    const result = await db.query(
      `UPDATE customer_support_requests
       SET status = $1, admin_response = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 RETURNING *`,
      [status, typeof admin_response === 'string' ? admin_response.trim() : null, req.params.id]
    );
    if (!result.rowCount) return res.status(404).json({ success: false, message: 'Customer request not found.' });
    res.json({ success: true, request: result.rows[0], message: 'Customer request updated.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRequest, getMyRequests, getAllRequests, updateRequest };
