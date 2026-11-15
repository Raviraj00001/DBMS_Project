// backend/src/controllers/vendorController.js
const db = require('../config/db');

/**
 * Get all vendors with filters
 */
const getAllVendors = async (req, res, next) => {
  try {
    const { category, city, search, is_verified, sort_by = 'rating' } = req.query;

    let queryText = `
      SELECT 
        vn.id,
        vn.user_id,
        vn.business_name,
        vn.category,
        vn.description,
        vn.experience_years,
        vn.address,
        vn.city,
        vn.rating,
        vn.starting_price,
        vn.is_verified,
        vn.portfolio_images,
        u.full_name AS contact_person,
        u.email,
        u.phone,
        u.avatar_url,
        COUNT(r.id) AS review_count
      FROM vendors vn
      JOIN users u ON vn.user_id = u.id
      LEFT JOIN reviews r ON vn.id = r.vendor_id
      WHERE u.is_active = TRUE
    `;

    const params = [];
    let paramIndex = 1;

    if (category) {
      queryText += ` AND vn.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (city) {
      queryText += ` AND vn.city ILIKE $${paramIndex}`;
      params.push(city.trim());
      paramIndex++;
    }

    if (is_verified !== undefined) {
      queryText += ` AND vn.is_verified = $${paramIndex}`;
      params.push(is_verified === 'true');
      paramIndex++;
    }

    if (search) {
      queryText += ` AND (vn.business_name ILIKE $${paramIndex} OR vn.description ILIKE $${paramIndex})`;
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    queryText += ` GROUP BY vn.id, u.id`;

    const validSorts = {
      rating: 'vn.rating DESC',
      price_asc: 'vn.starting_price ASC',
      price_desc: 'vn.starting_price DESC',
      experience: 'vn.experience_years DESC',
    };
    queryText += ` ORDER BY ${validSorts[sort_by] || 'vn.rating DESC'}`;

    const result = await db.query(queryText, params);

    res.json({
      success: true,
      count: result.rowCount,
      vendors: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get vendor details by ID
 */
const getVendorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const vendorRes = await db.query(
      `SELECT 
        vn.*,
        u.full_name AS contact_person,
        u.email,
        u.phone,
        u.avatar_url
       FROM vendors vn
       JOIN users u ON vn.user_id = u.id
       WHERE vn.id = $1 AND u.is_active = TRUE`,
      [id]
    );

    if (vendorRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Vendor not found.' });
    }

    const vendor = vendorRes.rows[0];

    // Fetch vendor services
    const servicesRes = await db.query(
      `SELECT 
        vs.id AS vendor_service_id,
        vs.custom_title,
        vs.custom_description,
        vs.price,
        vs.duration_hours,
        vs.is_active,
        s.id AS service_id,
        s.name AS service_name,
        s.category
       FROM vendor_services vs
       JOIN services s ON vs.service_id = s.id
       WHERE vs.vendor_id = $1 AND vs.is_active = TRUE
       ORDER BY vs.price ASC`,
      [id]
    );

    // Fetch reviews
    const reviewsRes = await db.query(
      `SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        u.full_name AS user_name,
        u.avatar_url
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.vendor_id = $1
       ORDER BY r.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      vendor: {
        ...vendor,
        services: servicesRes.rows,
        reviews: reviewsRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a service offering for the authenticated vendor
 */
const addVendorService = async (req, res, next) => {
  try {
    // Find vendor ID for current user
    const vRes = await db.query('SELECT id FROM vendors WHERE user_id = $1', [req.user.id]);
    if (vRes.rowCount === 0) {
      return res.status(403).json({ success: false, message: 'No vendor profile associated with this account.' });
    }

    const vendorId = vRes.rows[0].id;
    const { service_id, custom_title, custom_description, price, duration_hours } = req.body;

    const insertRes = await db.query(
      `INSERT INTO vendor_services (vendor_id, service_id, custom_title, custom_description, price, duration_hours)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (vendor_id, service_id)
       DO UPDATE SET 
         custom_title = EXCLUDED.custom_title,
         custom_description = EXCLUDED.custom_description,
         price = EXCLUDED.price,
         duration_hours = EXCLUDED.duration_hours,
         is_active = TRUE
       RETURNING *`,
      [vendorId, service_id, custom_title, custom_description, price, duration_hours || 4]
    );

    res.status(201).json({
      success: true,
      message: 'Service added to your vendor profile!',
      service: insertRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update vendor profile
 */
const updateVendorProfile = async (req, res, next) => {
  try {
    const vRes = await db.query('SELECT id FROM vendors WHERE user_id = $1', [req.user.id]);
    if (vRes.rowCount === 0) {
      return res.status(403).json({ success: false, message: 'Vendor profile not found.' });
    }

    const vendorId = vRes.rows[0].id;
    const { business_name, description, experience_years, address, city, starting_price, portfolio_images } = req.body;

    const updateRes = await db.query(
      `UPDATE vendors
       SET business_name = COALESCE($1, business_name),
           description = COALESCE($2, description),
           experience_years = COALESCE($3, experience_years),
           address = COALESCE($4, address),
           city = COALESCE($5, city),
           starting_price = COALESCE($6, starting_price),
           portfolio_images = COALESCE($7, portfolio_images),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [business_name, description, experience_years, address, city, starting_price, portfolio_images, vendorId]
    );

    res.json({
      success: true,
      message: 'Vendor profile updated successfully!',
      vendor: updateRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify a vendor (Admin only)
 */
const verifyVendor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_verified } = req.body;

    const result = await db.query(
      `UPDATE vendors SET is_verified = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [is_verified !== undefined ? is_verified : true, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Vendor not found.' });
    }

    res.json({
      success: true,
      message: `Vendor verified status updated to ${result.rows[0].is_verified}`,
      vendor: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/** Remove a vendor from the marketplace without deleting booking or payment history. */
const removeVendor = async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE users
       SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
       WHERE id = (SELECT user_id FROM vendors WHERE id = $1) AND role = 'vendor'
       RETURNING id`,
      [req.params.id]
    );
    if (!result.rowCount) {
      return res.status(404).json({ success: false, message: 'Vendor not found.' });
    }
    res.json({ success: true, message: 'Vendor removed from the marketplace. Booking and payment history has been retained.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllVendors,
  getVendorById,
  addVendorService,
  updateVendorProfile,
  verifyVendor,
  removeVendor,
};

