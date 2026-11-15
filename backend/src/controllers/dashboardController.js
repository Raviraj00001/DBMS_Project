// backend/src/controllers/dashboardController.js
const db = require('../config/db');

/**
 * Customer Dashboard Analytics (Live SQL aggregation)
 */
const getCustomerDashboard = async (req, res, next) => {
  try {
    const customerId = req.user.id;

    // 1. Financial and booking metrics
    const statsRes = await db.query(
      `SELECT 
        COUNT(b.id) AS total_bookings,
        COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) AS confirmed_bookings,
        COUNT(CASE WHEN b.status = 'pending' THEN 1 END) AS pending_bookings,
        COALESCE(SUM(b.total_amount), 0) AS total_committed_amount,
        COALESCE(SUM(b.paid_amount), 0) AS total_paid_amount,
        COALESCE(SUM(b.total_amount - b.paid_amount), 0) AS total_balance_due
       FROM bookings b
       WHERE b.customer_id = $1`,
      [customerId]
    );

    // 2. Upcoming events
    const upcomingRes = await db.query(
      `SELECT 
        b.id,
        b.booking_reference,
        b.wedding_date,
        (b.wedding_date - CURRENT_DATE) AS days_left,
        b.guest_count,
        b.total_amount,
        b.paid_amount,
        b.status,
        v.name AS venue_name,
        v.city AS venue_city,
        v.image_urls AS venue_images,
        p.name AS package_name
       FROM bookings b
       LEFT JOIN venues v ON b.venue_id = v.id
       LEFT JOIN packages p ON b.package_id = p.id
       WHERE b.customer_id = $1 AND b.wedding_date >= CURRENT_DATE
       ORDER BY b.wedding_date ASC`,
      [customerId]
    );

    // 3. Recent payments
    const paymentsRes = await db.query(
      `SELECT 
        p.id,
        p.transaction_reference,
        p.amount,
        p.payment_method,
        p.payment_date,
        b.booking_reference
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       WHERE b.customer_id = $1
       ORDER BY p.payment_date DESC
       LIMIT 5`,
      [customerId]
    );

    res.json({
      success: true,
      stats: statsRes.rows[0],
      upcoming_events: upcomingRes.rows,
      recent_payments: paymentsRes.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Vendor Dashboard Analytics (Live SQL aggregation)
 */
const getVendorDashboard = async (req, res, next) => {
  try {
    const vRes = await db.query('SELECT * FROM vendors WHERE user_id = $1', [req.user.id]);
    if (vRes.rowCount === 0) {
      return res.status(403).json({ success: false, message: 'Vendor profile not found.' });
    }

    const vendor = vRes.rows[0];

    // 1. Vendor performance metrics
    const statsRes = await db.query(
      `SELECT 
        COUNT(DISTINCT bs.id) AS total_orders,
        COUNT(DISTINCT CASE WHEN bs.status = 'confirmed' THEN bs.id END) AS active_orders,
        COUNT(DISTINCT CASE WHEN bs.status = 'completed' THEN bs.id END) AS completed_orders,
        COALESCE(SUM(bs.price_at_booking * bs.quantity), 0) AS total_revenue,
        COUNT(DISTINCT vs.id) AS active_services_count
       FROM vendors vn
       LEFT JOIN vendor_services vs ON vn.id = vs.vendor_id
       LEFT JOIN booking_services bs ON vs.id = bs.vendor_service_id
       WHERE vn.id = $1`,
      [vendor.id]
    );

    // 2. Assigned service orders
    const ordersRes = await db.query(
      `SELECT 
        bs.id AS booking_service_id,
        bs.service_date,
        bs.price_at_booking,
        bs.quantity,
        (bs.price_at_booking * bs.quantity) AS subtotal,
        bs.status,
        vs.custom_title,
        b.booking_reference,
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
      [vendor.id]
    );

    // 3. Listed services
    const servicesRes = await db.query(
      `SELECT vs.*, s.name AS base_service_name, s.category 
       FROM vendor_services vs
       JOIN services s ON vs.service_id = s.id
       WHERE vs.vendor_id = $1`,
      [vendor.id]
    );

    // 4. Recent reviews
    const reviewsRes = await db.query(
      `SELECT r.*, u.full_name AS customer_name, u.avatar_url
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.vendor_id = $1
       ORDER BY r.created_at DESC LIMIT 5`,
      [vendor.id]
    );

    res.json({
      success: true,
      profile: vendor,
      stats: statsRes.rows[0],
      orders: ordersRes.rows,
      services: servicesRes.rows,
      recent_reviews: reviewsRes.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Dashboard System Overview & DBMS Analytics
 */
const getAdminDashboard = async (req, res, next) => {
  try {
    // 1. System High-level KPIs
    const kpiRes = await db.query(
      `SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'customer') AS total_customers,
        (SELECT COUNT(*) FROM users WHERE role = 'vendor' AND is_active = TRUE) AS total_vendors,
        (SELECT COUNT(*) FROM venues) AS total_venues,
        (SELECT COUNT(*) FROM bookings) AS total_bookings,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'completed') AS total_platform_revenue,
        (SELECT COUNT(*) FROM vendors v JOIN users u ON u.id = v.user_id WHERE v.is_verified = FALSE AND u.is_active = TRUE) AS pending_vendor_verifications`
    );

    // 2. Booking status distribution
    const statusRes = await db.query(
      `SELECT status, COUNT(*) AS count, COALESCE(SUM(total_amount), 0) AS total_value
       FROM bookings
       GROUP BY status`
    );

    // 3. Monthly revenue trend using database view
    const monthlyTrendRes = await db.query(
      `SELECT 
        payment_month, 
        SUM(total_revenue) AS monthly_revenue,
        SUM(transaction_count) AS total_transactions
       FROM view_monthly_revenue
       GROUP BY payment_month
       ORDER BY payment_month ASC
       LIMIT 12`
    );

    // 4. Top performing venues from view
    const topVenuesRes = await db.query(
      `SELECT * FROM view_venue_performance ORDER BY gross_revenue_generated DESC LIMIT 5`
    );

    // 5. Top vendors from view
    const topVendorsRes = await db.query(
      `SELECT analytics.*, vendors.is_verified
       FROM view_vendor_analytics AS analytics
       JOIN vendors ON vendors.id = analytics.vendor_id
       JOIN users ON users.id = vendors.user_id AND users.is_active = TRUE
       ORDER BY analytics.total_vendor_earnings DESC`
    );

    // 6. Recent 10 bookings with join details
    const recentBookingsRes = await db.query(
      `SELECT * FROM view_booking_details ORDER BY booked_at DESC LIMIT 10`
    );

    res.json({
      success: true,
      kpi: kpiRes.rows[0],
      booking_status_distribution: statusRes.rows,
      monthly_revenue_trend: monthlyTrendRes.rows,
      top_venues: topVenuesRes.rows,
      top_vendors: topVendorsRes.rows,
      recent_bookings: recentBookingsRes.rows,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomerDashboard,
  getVendorDashboard,
  getAdminDashboard,
};

