// backend/src/controllers/bookingController.js
const db = require('../config/db');

/**
 * Generate a unique booking reference code
 */
const generateReference = () => {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `WB-${year}-${randomSuffix}`;
};

/**
 * Create a new wedding booking (ACID Transaction)
 */
const createBooking = async (req, res, next) => {
  try {
    const customer_id = req.user.id;
    const {
      venue_id,
      package_id,
      wedding_date,
      guest_count,
      special_requests,
      custom_services = [], // Array of { vendor_service_id, quantity, service_date }
      advance_payment_amount = 0,
      payment_method = 'upi',
    } = req.body;

    const result = await db.transaction(async (client) => {
      // 1. Verify venue availability if venue is chosen
      let venuePrice = 0;
      let venueName = null;

      if (venue_id) {
        const availCheck = await client.query(
          `SELECT fn_check_venue_availability($1, $2::DATE) AS is_available`,
          [venue_id, wedding_date]
        );

        if (!availCheck.rows[0].is_available) {
          throw new Error(`The selected venue is already booked or unavailable on ${wedding_date}. Please choose another date or venue.`);
        }

        const venueRes = await client.query(
          `SELECT name, price_per_day, capacity_min, capacity_max FROM venues WHERE id = $1`,
          [venue_id]
        );

        if (venueRes.rowCount === 0) {
          throw new Error('Venue not found.');
        }

        venuePrice = parseFloat(venueRes.rows[0].price_per_day);
        venueName = venueRes.rows[0].name;

        if (guest_count > venueRes.rows[0].capacity_max) {
          throw new Error(`Guest count exceeds venue maximum capacity (${venueRes.rows[0].capacity_max}).`);
        }
      }

      // 2. Fetch package pricing if package is chosen
      let packagePrice = 0;
      if (package_id) {
        const pkgRes = await client.query(
          `SELECT base_price, discount_percent FROM packages WHERE id = $1`,
          [package_id]
        );
        if (pkgRes.rowCount > 0) {
          const bp = parseFloat(pkgRes.rows[0].base_price);
          const disc = parseFloat(pkgRes.rows[0].discount_percent);
          packagePrice = bp * (1 - disc / 100.0);
        }
      }

      // 3. Compute custom services cost
      let customServicesTotal = 0;
      const verifiedServices = [];

      for (const cs of custom_services) {
        const vsRes = await client.query(
          `SELECT id, price, custom_title FROM vendor_services WHERE id = $1 AND is_active = TRUE`,
          [cs.vendor_service_id]
        );
        if (vsRes.rowCount > 0) {
          const price = parseFloat(vsRes.rows[0].price);
          const qty = parseInt(cs.quantity || 1, 10);
          customServicesTotal += (price * qty);
          verifiedServices.push({
            vendor_service_id: cs.vendor_service_id,
            price_at_booking: price,
            quantity: qty,
            service_date: cs.service_date || wedding_date,
            notes: cs.notes || '',
          });
        }
      }

      // Total calculated amount
      const grandTotal = venuePrice + packagePrice + customServicesTotal;
      const bookingReference = generateReference();

      // 4. Insert into bookings
      const bookingInsert = await client.query(
        `INSERT INTO bookings (
          booking_reference, customer_id, venue_id, package_id, 
          wedding_date, guest_count, total_amount, paid_amount, 
          status, special_requests
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          bookingReference,
          customer_id,
          venue_id || null,
          package_id || null,
          wedding_date,
          guest_count,
          grandTotal,
          0.00,
          'pending',
          special_requests || '',
        ]
      );

      const booking = bookingInsert.rows[0];

      // 5. Reserve venue date in venue_availability
      if (venue_id) {
        await client.query(
          `INSERT INTO venue_availability (venue_id, available_date, status, booking_id, notes)
           VALUES ($1, $2, 'booked', $3, $4)
           ON CONFLICT (venue_id, available_date) 
           DO UPDATE SET status = 'booked', booking_id = $3`,
          [venue_id, wedding_date, booking.id, `Reserved for booking ${bookingReference}`]
        );
      }

      // 6. Insert booking services
      for (const service of verifiedServices) {
        await client.query(
          `INSERT INTO booking_services (booking_id, vendor_service_id, price_at_booking, quantity, service_date, notes)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [booking.id, service.vendor_service_id, service.price_at_booking, service.quantity, service.service_date, service.notes]
        );
      }

      // 7. Process advance payment if provided
      let paymentRecord = null;
      if (parseFloat(advance_payment_amount) > 0) {
        const txnRef = `TXN-${payment_method.toUpperCase()}-${Date.now()}`;
        const payInsert = await client.query(
          `INSERT INTO payments (booking_id, transaction_reference, amount, payment_method, payment_status, notes)
           VALUES ($1, $2, $3, $4, 'completed', $5)
           RETURNING *`,
          [booking.id, txnRef, advance_payment_amount, payment_method, 'Booking Confirmation Advance']
        );
        paymentRecord = payInsert.rows[0];
      }

      // Fetch fresh updated booking record (triggers may have fired)
      const freshBookingRes = await client.query(
        `SELECT * FROM bookings WHERE id = $1`,
        [booking.id]
      );

      return {
        booking: freshBookingRes.rows[0],
        venue_name: venueName,
        payment: paymentRecord,
        services_booked_count: verifiedServices.length,
      };
    });

    res.status(201).json({
      success: true,
      message: 'Wedding booking created successfully!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current customer's bookings
 */
const getCustomerBookings = async (req, res, next) => {
  try {
    const customer_id = req.user.id;

    const result = await db.query(
      `SELECT 
        b.id,
        b.booking_reference,
        b.wedding_date,
        b.guest_count,
        b.total_amount,
        b.paid_amount,
        (b.total_amount - b.paid_amount) AS balance_amount,
        b.status,
        b.special_requests,
        b.created_at,
        v.id AS venue_id,
        v.name AS venue_name,
        v.city AS venue_city,
        v.image_urls AS venue_images,
        p.id AS package_id,
        p.name AS package_name,
        p.tier AS package_tier,
        COUNT(bs.id) AS custom_service_count
       FROM bookings b
       LEFT JOIN venues v ON b.venue_id = v.id
       LEFT JOIN packages p ON b.package_id = p.id
       LEFT JOIN booking_services bs ON b.id = bs.booking_id
       WHERE b.customer_id = $1
       GROUP BY b.id, v.id, p.id
       ORDER BY b.wedding_date DESC`,
      [customer_id]
    );

    res.json({
      success: true,
      count: result.rowCount,
      bookings: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get vendor's assigned bookings
 */
const getVendorBookings = async (req, res, next) => {
  try {
    // Find vendor ID for current user
    const vRes = await db.query('SELECT id FROM vendors WHERE user_id = $1', [req.user.id]);
    if (vRes.rowCount === 0) {
      return res.status(403).json({ success: false, message: 'Vendor profile not found.' });
    }

    const vendorId = vRes.rows[0].id;

    const result = await db.query(
      `SELECT 
        bs.id AS booking_service_id,
        bs.price_at_booking,
        bs.quantity,
        (bs.price_at_booking * bs.quantity) AS service_subtotal,
        bs.service_date,
        bs.status AS service_status,
        bs.notes AS service_notes,
        vs.custom_title,
        b.id AS booking_id,
        b.booking_reference,
        b.wedding_date,
        b.guest_count,
        b.status AS booking_status,
        u.full_name AS customer_name,
        u.phone AS customer_phone,
        u.email AS customer_email,
        v.name AS venue_name,
        v.city AS venue_city
       FROM booking_services bs
       JOIN vendor_services vs ON bs.vendor_service_id = vs.id
       JOIN bookings b ON bs.booking_id = b.id
       JOIN users u ON b.customer_id = u.id
       LEFT JOIN venues v ON b.venue_id = v.id
       WHERE vs.vendor_id = $1
       ORDER BY bs.service_date ASC`,
      [vendorId]
    );

    res.json({
      success: true,
      count: result.rowCount,
      orders: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all bookings across the platform (Admin only)
 */
const getAllBookingsAdmin = async (req, res, next) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let queryText = `SELECT * FROM view_booking_details`;
    const params = [];

    if (status) {
      queryText += ` WHERE booking_status = $1`;
      params.push(status);
    }

    queryText += ` ORDER BY booked_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const result = await db.query(queryText, params);

    res.json({
      success: true,
      count: result.rowCount,
      bookings: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get booking details by ID
 */
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const bookingRes = await db.query(
      `SELECT 
        b.*,
        u.full_name AS customer_name,
        u.email AS customer_email,
        u.phone AS customer_phone,
        v.name AS venue_name,
        v.address AS venue_address,
        v.city AS venue_city,
        v.price_per_day AS venue_price,
        p.name AS package_name,
        p.tier AS package_tier,
        p.base_price AS package_base_price
       FROM bookings b
       JOIN users u ON b.customer_id = u.id
       LEFT JOIN venues v ON b.venue_id = v.id
       LEFT JOIN packages p ON b.package_id = p.id
       WHERE b.id = $1`,
      [id]
    );

    if (bookingRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = bookingRes.rows[0];

    // Authorization guard: Customers can only see their own bookings unless admin
    if (req.user.role === 'customer' && booking.customer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this booking.' });
    }

    // Fetch booking services
    const servicesRes = await db.query(
      `SELECT 
        bs.*,
        vs.custom_title,
        vn.business_name AS vendor_name,
        vn.category AS vendor_category
       FROM booking_services bs
       JOIN vendor_services vs ON bs.vendor_service_id = vs.id
       JOIN vendors vn ON vs.vendor_id = vn.id
       WHERE bs.booking_id = $1`,
      [id]
    );

    // Fetch payment history
    const paymentsRes = await db.query(
      `SELECT * FROM payments WHERE booking_id = $1 ORDER BY payment_date DESC`,
      [id]
    );

    res.json({
      success: true,
      booking: {
        ...booking,
        services: servicesRes.rows,
        payments: paymentsRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update booking status
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const result = await db.query(
      `UPDATE bookings 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // If cancelled, free up venue availability
    if (status === 'cancelled') {
      await db.query(`DELETE FROM venue_availability WHERE booking_id = $1`, [id]);
    }

    res.json({
      success: true,
      message: `Booking status updated to '${status}'.`,
      booking: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel booking (Customer or Admin)
 */
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const bookingRes = await db.query('SELECT customer_id FROM bookings WHERE id = $1', [id]);
    if (bookingRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (req.user.role === 'customer' && bookingRes.rows[0].customer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this booking.' });
    }

    await db.transaction(async (client) => {
      await client.query(`UPDATE bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [id]);
      await client.query(`DELETE FROM venue_availability WHERE booking_id = $1`, [id]);
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully. Venue reservation released.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getCustomerBookings,
  getVendorBookings,
  getAllBookingsAdmin,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
};

