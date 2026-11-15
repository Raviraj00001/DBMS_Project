// backend/src/controllers/reviewController.js
const db = require('../config/db');

/**
 * Submit a review for a Venue or Vendor
 */
const createReview = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { booking_id, venue_id, vendor_id, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
    }

    if (!comment || comment.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Please provide a meaningful review comment (min 5 characters).' });
    }

    if ((!venue_id && !vendor_id) || (venue_id && vendor_id)) {
      return res.status(400).json({ success: false, message: 'Review must target either a venue or a vendor, not both or neither.' });
    }

    // Insert review
    const result = await db.transaction(async (client) => {
      const reviewInsert = await client.query(
        `INSERT INTO reviews (booking_id, user_id, venue_id, vendor_id, rating, comment)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [booking_id || null, user_id, venue_id || null, vendor_id || null, rating, comment.trim()]
      );

      // Recalculate average rating
      if (venue_id) {
        const avgRes = await client.query(
          `SELECT ROUND(AVG(rating), 2) AS new_avg FROM reviews WHERE venue_id = $1`,
          [venue_id]
        );
        if (avgRes.rows[0].new_avg) {
          await client.query(`UPDATE venues SET rating = $1 WHERE id = $2`, [avgRes.rows[0].new_avg, venue_id]);
        }
      } else if (vendor_id) {
        const avgRes = await client.query(
          `SELECT ROUND(AVG(rating), 2) AS new_avg FROM reviews WHERE vendor_id = $1`,
          [vendor_id]
        );
        if (avgRes.rows[0].new_avg) {
          await client.query(`UPDATE vendors SET rating = $1 WHERE id = $2`, [avgRes.rows[0].new_avg, vendor_id]);
        }
      }

      return reviewInsert.rows[0];
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been published.',
      review: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get venue reviews
 */
const getVenueReviews = async (req, res, next) => {
  try {
    const { venueId } = req.params;
    const result = await db.query(
      `SELECT r.*, u.full_name AS reviewer_name, u.avatar_url AS reviewer_avatar
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.venue_id = $1
       ORDER BY r.created_at DESC`,
      [venueId]
    );

    res.json({ success: true, count: result.rowCount, reviews: result.rows });
  } catch (error) {
    next(error);
  }
};

/**
 * Get vendor reviews
 */
const getVendorReviews = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const result = await db.query(
      `SELECT r.*, u.full_name AS reviewer_name, u.avatar_url AS reviewer_avatar
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.vendor_id = $1
       ORDER BY r.created_at DESC`,
      [vendorId]
    );

    res.json({ success: true, count: result.rowCount, reviews: result.rows });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getVenueReviews,
  getVendorReviews,
};

