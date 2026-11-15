// backend/src/controllers/venueController.js
const db = require('../config/db');

/**
 * Get all venues with filtering, search, and sorting
 */
const getAllVenues = async (req, res, next) => {
  try {
    const {
      search,
      city,
      venue_type,
      min_capacity,
      max_price,
      sort_by = 'rating',
      order = 'DESC',
      limit = 20,
      offset = 0,
    } = req.query;

    let queryText = `
      SELECT 
        v.id,
        v.name,
        v.description,
        v.address,
        v.city,
        v.state,
        v.capacity_min,
        v.capacity_max,
        v.price_per_day,
        v.venue_type,
        v.rating,
        v.image_urls,
        v.amenities,
        v.is_available,
        COUNT(r.id) AS review_count
      FROM venues v
      LEFT JOIN reviews r ON v.id = r.venue_id
      WHERE v.is_available = TRUE
    `;

    const params = [];
    let paramIndex = 1;

    if (search) {
      queryText += ` AND (v.name ILIKE $${paramIndex} OR v.description ILIKE $${paramIndex} OR v.city ILIKE $${paramIndex})`;
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    if (city) {
      queryText += ` AND v.city ILIKE $${paramIndex}`;
      params.push(city.trim());
      paramIndex++;
    }

    if (venue_type) {
      queryText += ` AND v.venue_type = $${paramIndex}`;
      params.push(venue_type);
      paramIndex++;
    }

    if (min_capacity) {
      queryText += ` AND v.capacity_max >= $${paramIndex}`;
      params.push(parseInt(min_capacity, 10));
      paramIndex++;
    }

    if (max_price) {
      queryText += ` AND v.price_per_day <= $${paramIndex}`;
      params.push(parseFloat(max_price));
      paramIndex++;
    }

    queryText += ` GROUP BY v.id`;

    // Sorting safe list
    const validSortFields = {
      price: 'v.price_per_day',
      rating: 'v.rating',
      name: 'v.name',
      capacity: 'v.capacity_max',
    };
    const sortField = validSortFields[sort_by] || 'v.rating';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    queryText += ` ORDER BY ${sortField} ${sortOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const result = await db.query(queryText, params);

    // Get unique cities for filter dropdowns
    const citiesRes = await db.query('SELECT DISTINCT city FROM venues ORDER BY city ASC');
    const cities = citiesRes.rows.map(r => r.city);

    res.json({
      success: true,
      count: result.rowCount,
      venues: result.rows,
      available_cities: cities,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get venue details by ID with booked dates and reviews
 */
const getVenueById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const venueRes = await db.query(
      `SELECT * FROM venues WHERE id = $1`,
      [id]
    );

    if (venueRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Venue not found.' });
    }

    const venue = venueRes.rows[0];

    // Fetch booked dates for availability calendar
    const availabilityRes = await db.query(
      `SELECT available_date, status, notes 
       FROM venue_availability 
       WHERE venue_id = $1 AND available_date >= CURRENT_DATE 
       ORDER BY available_date ASC`,
      [id]
    );

    // Fetch reviews
    const reviewsRes = await db.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.full_name AS user_name, u.avatar_url
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.venue_id = $1
       ORDER BY r.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      venue: {
        ...venue,
        booked_dates: availabilityRes.rows,
        reviews: reviewsRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if a venue is available on a given date using stored function
 */
const checkVenueAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date parameter is required (YYYY-MM-DD).' });
    }

    // Call PostgreSQL stored function fn_check_venue_availability
    const result = await db.query(
      `SELECT fn_check_venue_availability($1, $2::DATE) AS is_available`,
      [id, date]
    );

    const isAvailable = result.rows[0].is_available;

    res.json({
      success: true,
      venue_id: parseInt(id, 10),
      date,
      is_available: isAvailable,
      message: isAvailable 
        ? 'Venue is open and available for booking on this date.' 
        : 'Venue is currently booked or unavailable on this date.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new venue (Admin only)
 */
const createVenue = async (req, res, next) => {
  try {
    const {
      name,
      description,
      address,
      city,
      state,
      capacity_min,
      capacity_max,
      price_per_day,
      venue_type,
      image_urls,
      amenities,
    } = req.body;

    const result = await db.query(
      `INSERT INTO venues (
        name, description, address, city, state, capacity_min, capacity_max, 
        price_per_day, venue_type, image_urls, amenities
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        name,
        description,
        address,
        city,
        state,
        capacity_min,
        capacity_max,
        price_per_day,
        venue_type,
        image_urls || ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200'],
        amenities || ['Valet Parking', 'Bridal Dressing Room', 'Power Backup'],
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Venue created successfully!',
      venue: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing venue (Admin only)
 */
const updateVenue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      address,
      city,
      state,
      capacity_min,
      capacity_max,
      price_per_day,
      venue_type,
      is_available,
      amenities,
    } = req.body;

    const result = await db.query(
      `UPDATE venues 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           address = COALESCE($3, address),
           city = COALESCE($4, city),
           state = COALESCE($5, state),
           capacity_min = COALESCE($6, capacity_min),
           capacity_max = COALESCE($7, capacity_max),
           price_per_day = COALESCE($8, price_per_day),
           venue_type = COALESCE($9, venue_type),
           is_available = COALESCE($10, is_available),
           amenities = COALESCE($11, amenities),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING *`,
      [
        name,
        description,
        address,
        city,
        state,
        capacity_min,
        capacity_max,
        price_per_day,
        venue_type,
        is_available,
        amenities,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Venue not found.' });
    }

    res.json({
      success: true,
      message: 'Venue updated successfully!',
      venue: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a venue (Admin only)
 */
const deleteVenue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM venues WHERE id = $1 RETURNING id, name', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Venue not found.' });
    }
    res.json({ success: true, message: `Venue '${result.rows[0].name}' deleted successfully.` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllVenues,
  getVenueById,
  checkVenueAvailability,
  createVenue,
  updateVenue,
  deleteVenue,
};

