// backend/src/controllers/reportController.js
const db = require('../config/db');

// Catalog of 20+ Curated Demonstration Queries for College DBMS Viva & Lab Evaluation
const DBMS_QUERIES = [
  {
    id: 1,
    title: 'High-Capacity Luxury Venues',
    category: 'Basic SELECT & Filtering',
    description: 'Retrieves all available luxury venues that accommodate 400+ guests, sorted by price.',
    sql: `SELECT id, name, city, venue_type, capacity_min, capacity_max, price_per_day, rating FROM venues WHERE is_available = TRUE AND capacity_max >= 400 ORDER BY price_per_day DESC;`
  },
  {
    id: 2,
    title: 'Verified Catering & Photography Vendors',
    category: 'Filtering with IN & Booleans',
    description: 'Filters approved vendors in high-demand categories.',
    sql: `SELECT id, business_name, category, city, experience_years, starting_price, rating FROM vendors WHERE is_verified = TRUE AND category IN ('catering', 'photography') ORDER BY rating DESC, experience_years DESC;`
  },
  {
    id: 3,
    title: 'Comprehensive Wedding Booking Master Sheet',
    category: 'Multi-table INNER & LEFT JOINs',
    description: 'Joins Bookings, Users (Customer), Venues, and Packages to generate an event manifest.',
    sql: `SELECT b.booking_reference, b.wedding_date, u.full_name AS customer_name, u.phone AS customer_phone, v.name AS venue_name, v.city AS venue_city, COALESCE(p.name, 'Bespoke Services') AS package_name, b.guest_count, b.total_amount, b.paid_amount, b.status FROM bookings b JOIN users u ON b.customer_id = u.id LEFT JOIN venues v ON b.venue_id = v.id LEFT JOIN packages p ON b.package_id = p.id ORDER BY b.wedding_date ASC;`
  },
  {
    id: 4,
    title: '4-Table Vendor Service Assignment Breakdown',
    category: 'Complex 4-Table Joins',
    description: 'Traverses Bookings -> Booking_Services -> Vendor_Services -> Vendors to compute line items.',
    sql: `SELECT b.booking_reference, b.wedding_date, vn.business_name AS vendor_name, vn.category AS vendor_category, vs.custom_title AS service_title, bs.quantity, bs.price_at_booking, (bs.quantity * bs.price_at_booking) AS subtotal FROM bookings b JOIN booking_services bs ON b.id = bs.booking_id JOIN vendor_services vs ON bs.vendor_service_id = vs.id JOIN vendors vn ON vs.vendor_id = vn.id ORDER BY b.booking_reference, subtotal DESC;`
  },
  {
    id: 5,
    title: 'Unused Venue Inventory (Zero Bookings)',
    category: 'LEFT OUTER JOIN with IS NULL',
    description: 'Finds venues currently registered in the database that have never received any wedding bookings.',
    sql: `SELECT v.id, v.name, v.city, v.venue_type, v.price_per_day FROM venues v LEFT JOIN bookings b ON v.id = b.venue_id WHERE b.id IS NULL;`
  },
  {
    id: 6,
    title: 'Gross Revenue & Utilization per Venue',
    category: 'GROUP BY, SUM, HAVING Aggregations',
    description: 'Aggregates revenue and guest counts across all bookings per venue having at least 1 booking.',
    sql: `SELECT v.id AS venue_id, v.name AS venue_name, v.city, COUNT(b.id) AS total_events, SUM(b.total_amount) AS gross_revenue, ROUND(AVG(b.guest_count), 0) AS average_guests FROM venues v JOIN bookings b ON v.id = b.venue_id GROUP BY v.id, v.name, v.city HAVING COUNT(b.id) >= 1 ORDER BY gross_revenue DESC;`
  },
  {
    id: 7,
    title: 'Vendor Earnings & Service Fulfillment',
    category: 'Multi-table Aggregations',
    description: 'Calculates the total revenue earned by each vendor from completed wedding service orders.',
    sql: `SELECT vn.id AS vendor_id, vn.business_name, vn.category, COUNT(bs.id) AS total_services_booked, COALESCE(SUM(bs.quantity * bs.price_at_booking), 0) AS total_revenue FROM vendors vn LEFT JOIN vendor_services vs ON vn.id = vs.vendor_id LEFT JOIN booking_services bs ON vs.id = bs.vendor_service_id GROUP BY vn.id, vn.business_name, vn.category ORDER BY total_revenue DESC;`
  },
  {
    id: 8,
    title: 'Payment Channel Audit & Success Ratio',
    category: 'Conditional Aggregation with CASE WHEN',
    description: 'Evaluates transaction volumes and success percentages across UPI, Net Banking, and Credit Cards.',
    sql: `SELECT payment_method, COUNT(id) AS total_transactions, SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) AS successful_amount, COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) AS successful_count, ROUND((COUNT(CASE WHEN payment_status = 'completed' THEN 1 END)::NUMERIC / COUNT(id)::NUMERIC) * 100, 2) AS success_rate_pct FROM payments GROUP BY payment_method ORDER BY successful_amount DESC;`
  },
  {
    id: 9,
    title: 'VIP Customers Exceeding Average Wedding Spend',
    category: 'Non-correlated Subquery with AVG()',
    description: 'Finds customers who spent more on their wedding than the overall platform average spend.',
    sql: `SELECT u.id, u.full_name, u.email, b.booking_reference, b.total_amount FROM users u JOIN bookings b ON u.id = b.customer_id WHERE b.total_amount > (SELECT AVG(total_amount) FROM bookings) ORDER BY b.total_amount DESC;`
  },
  {
    id: 10,
    title: 'Venues Priced Above State Average',
    category: 'Correlated Subquery',
    description: 'Identifies venues with daily rates exceeding the regional benchmark price of their state.',
    sql: `SELECT v1.id, v1.name, v1.city, v1.state, v1.price_per_day, (SELECT ROUND(AVG(v2.price_per_day), 2) FROM venues v2 WHERE v2.state = v1.state) AS state_avg FROM venues v1 WHERE v1.price_per_day >= (SELECT AVG(v2.price_per_day) FROM venues v2 WHERE v2.state = v1.state);`
  },
  {
    id: 11,
    title: 'Active Customers via EXISTS Operator',
    category: 'EXISTS Correlated Subquery',
    description: 'Selects customer profiles having active (pending or confirmed) wedding reservations.',
    sql: `SELECT u.id, u.full_name, u.email, u.phone FROM users u WHERE EXISTS (SELECT 1 FROM bookings b WHERE b.customer_id = u.id AND b.status IN ('pending', 'confirmed'));`
  },
  {
    id: 12,
    title: 'Rank Venues by Daily Price within Venue Type',
    category: 'Window Functions (DENSE_RANK)',
    description: 'Employs DENSE_RANK() PARTITION BY venue_type to rank properties within Palace, Lawn, Resort categories.',
    sql: `SELECT id, name, venue_type, city, price_per_day, DENSE_RANK() OVER (PARTITION BY venue_type ORDER BY price_per_day DESC) AS rank_within_type FROM venues;`
  },
  {
    id: 13,
    title: 'Running Total of Platform Cash Inflow',
    category: 'Window Functions (SUM OVER Running Total)',
    description: 'Generates cumulative financial balance over time as each payment arrives.',
    sql: `SELECT id AS payment_id, transaction_reference, booking_id, amount, payment_date, SUM(amount) OVER (ORDER BY payment_date ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_revenue FROM payments WHERE payment_status = 'completed';`
  },
  {
    id: 14,
    title: 'Customer Financial Health & Outstanding Balances',
    category: 'Multi-CTE (Common Table Expressions)',
    description: 'Computes total contract values vs settled amounts to highlight pending dues.',
    sql: `WITH BookingTotals AS (SELECT customer_id, COUNT(id) AS total_bookings_count, SUM(total_amount) AS total_contract_value, SUM(paid_amount) AS total_settled_value FROM bookings GROUP BY customer_id), CustomerSummary AS (SELECT u.id AS customer_id, u.full_name, u.email, u.phone, bt.total_bookings_count, bt.total_contract_value, bt.total_settled_value, (bt.total_contract_value - bt.total_settled_value) AS outstanding_due FROM users u JOIN BookingTotals bt ON u.id = bt.customer_id) SELECT * FROM CustomerSummary ORDER BY outstanding_due DESC;`
  },
  {
    id: 15,
    title: 'Package Popularity and Service Attachment Matrix',
    category: 'CTE with Multi-level Aggregation',
    description: 'Analyzes booking frequency and service inclusions across wedding package tiers.',
    sql: `WITH PackageUsage AS (SELECT p.id AS package_id, p.name AS package_name, p.tier, p.base_price, COUNT(b.id) AS bookings_count, COALESCE(SUM(b.total_amount), 0) AS total_revenue FROM packages p LEFT JOIN bookings b ON p.id = b.package_id GROUP BY p.id, p.name, p.tier, p.base_price), ServiceInclusions AS (SELECT package_id, COUNT(service_id) AS included_services_count FROM package_services GROUP BY package_id) SELECT pu.*, COALESCE(si.included_services_count, 0) AS included_services FROM PackageUsage pu LEFT JOIN ServiceInclusions si ON pu.package_id = si.package_id ORDER BY pu.bookings_count DESC, pu.total_revenue DESC;`
  },
  {
    id: 16,
    title: 'Unified Geographical Footprint',
    category: 'SET Operations (UNION)',
    description: 'Combines venue and vendor operational cities into a unified footprint directory.',
    sql: `(SELECT city, 'Venue Location' AS presence_type FROM venues) UNION (SELECT city, 'Vendor Location' AS presence_type FROM vendors) ORDER BY city ASC;`
  },
  {
    id: 17,
    title: 'Cities with Both Active Venues and Verified Vendors',
    category: 'SET Operations (INTERSECT)',
    description: 'Identifies cities having end-to-end wedding ecosystem coverage.',
    sql: `(SELECT city FROM venues WHERE is_available = TRUE) INTERSECT (SELECT city FROM vendors WHERE is_verified = TRUE);`
  },
  {
    id: 18,
    title: 'Querying View: Comprehensive Venue Performance',
    category: 'Database View Execution',
    description: 'Queries view_venue_performance to inspect occupancy, revenue, and customer satisfaction.',
    sql: `SELECT * FROM view_venue_performance ORDER BY gross_revenue_generated DESC;`
  },
  {
    id: 19,
    title: 'Querying View: Upcoming Weddings Schedule',
    category: 'Database View Execution',
    description: 'Queries view_upcoming_weddings to project logistical commitments and remaining days.',
    sql: `SELECT * FROM view_upcoming_weddings;`
  },
  {
    id: 20,
    title: 'Execute Stored Function: fn_check_venue_availability',
    category: 'Stored Function / PL/pgSQL',
    description: 'Executes stored function fn_check_venue_availability against live venue inventory.',
    sql: `SELECT v.id, v.name, '2026-12-15'::DATE AS test_date, fn_check_venue_availability(v.id, '2026-12-15'::DATE) AS is_available FROM venues v;`
  },
  {
    id: 21,
    title: 'Execute Stored Function: fn_calculate_booking_total',
    category: 'Stored Function / PL/pgSQL',
    description: 'Executes fn_calculate_booking_total to dynamically verify consistency of total amounts.',
    sql: `SELECT b.id AS booking_id, b.booking_reference, b.total_amount AS recorded_total, fn_calculate_booking_total(b.id) AS computed_total FROM bookings b;`
  }
];

/**
 * List all available queries
 */
const getAvailableQueries = (req, res) => {
  res.json({
    success: true,
    total_queries: DBMS_QUERIES.length,
    queries: DBMS_QUERIES.map(q => ({
      id: q.id,
      title: q.title,
      category: q.category,
      description: q.description,
      sql: q.sql,
    })),
  });
};

/**
 * Execute a specific query from the catalog or run a custom SELECT query
 */
const executeQuery = async (req, res, next) => {
  try {
    const { query_id, custom_sql } = req.body;

    let sqlToRun = '';
    let queryMeta = null;

    if (query_id) {
      const found = DBMS_QUERIES.find(q => q.id === parseInt(query_id, 10));
      if (!found) {
        return res.status(404).json({ success: false, message: 'Query not found in catalog.' });
      }
      sqlToRun = found.sql;
      queryMeta = found;
    } else if (custom_sql) {
      // Safety check: only allow SELECT or WITH queries to prevent accidental drops/deletions in demo
      const trimmed = custom_sql.trim().toUpperCase();
      if (!trimmed.startsWith('SELECT') && !trimmed.startsWith('WITH')) {
        return res.status(403).json({
          success: false,
          message: 'Security Guard: Only SELECT and WITH (read-only) queries are permitted in the live query runner.',
        });
      }
      sqlToRun = custom_sql;
      queryMeta = {
        title: 'Custom User SQL Query',
        category: 'Ad-hoc Demonstration',
        description: 'Dynamically submitted SQL executed on PostgreSQL database.',
      };
    } else {
      return res.status(400).json({ success: false, message: 'query_id or custom_sql is required.' });
    }

    const startTime = Date.now();
    const result = await db.query(sqlToRun);
    const executionTimeMs = Date.now() - startTime;

    const fields = result.fields ? result.fields.map(f => f.name) : [];

    res.json({
      success: true,
      meta: queryMeta,
      sql: sqlToRun,
      execution_time_ms: executionTimeMs,
      row_count: result.rowCount,
      fields,
      rows: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Table Record Counts & Schema Overview
 */
const getSchemaStats = async (req, res, next) => {
  try {
    const tables = [
      'users',
      'venues',
      'venue_availability',
      'vendors',
      'services',
      'vendor_services',
      'packages',
      'package_services',
      'bookings',
      'booking_services',
      'payments',
      'reviews',
    ];

    const stats = [];
    for (const table of tables) {
      const countRes = await db.query(`SELECT COUNT(*) FROM ${table}`);
      stats.push({
        table_name: table,
        record_count: parseInt(countRes.rows[0].count, 10),
      });
    }

    res.json({
      success: true,
      schema_status: '3NF Normalized PostgreSQL Relational Schema',
      tables: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailableQueries,
  executeQuery,
  getSchemaStats,
};

