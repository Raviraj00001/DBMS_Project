// backend/src/controllers/packageController.js
const db = require('../config/db');

/**
 * Get all wedding packages with included service lists
 */
const getAllPackages = async (req, res, next) => {
  try {
    const packagesRes = await db.query(
      `SELECT 
        p.*,
        ROUND(p.base_price * (1 - (p.discount_percent / 100.0)), 2) AS discounted_price,
        COUNT(ps.id) AS included_services_count
       FROM packages p
       LEFT JOIN package_services ps ON p.id = ps.package_id
       WHERE p.is_active = TRUE
       GROUP BY p.id
       ORDER BY p.base_price ASC`
    );

    // Also fetch service details for each package
    const packages = [];
    for (const pkg of packagesRes.rows) {
      const servicesRes = await db.query(
        `SELECT 
          s.id, s.name, s.category, s.description, ps.quantity, ps.notes
         FROM package_services ps
         JOIN services s ON ps.service_id = s.id
         WHERE ps.package_id = $1`,
        [pkg.id]
      );
      packages.push({
        ...pkg,
        services: servicesRes.rows,
      });
    }

    res.json({
      success: true,
      count: packages.length,
      packages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single package by ID
 */
const getPackageById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pkgRes = await db.query(
      `SELECT 
        p.*,
        ROUND(p.base_price * (1 - (p.discount_percent / 100.0)), 2) AS discounted_price
       FROM packages p
       WHERE p.id = $1`,
      [id]
    );

    if (pkgRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Wedding package not found.' });
    }

    const pkg = pkgRes.rows[0];

    const servicesRes = await db.query(
      `SELECT 
        s.id, s.name, s.category, s.description, ps.quantity, ps.notes
       FROM package_services ps
       JOIN services s ON ps.service_id = s.id
       WHERE ps.package_id = $1`,
      [id]
    );

    res.json({
      success: true,
      package: {
        ...pkg,
        services: servicesRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new wedding package (Admin only)
 */
const createPackage = async (req, res, next) => {
  try {
    const {
      name,
      tier,
      description,
      guest_count,
      base_price,
      discount_percent,
      image_url,
      features,
      services, // Array of { service_id, quantity, notes }
    } = req.body;

    const result = await db.transaction(async (client) => {
      const insertPkg = await client.query(
        `INSERT INTO packages (name, tier, description, guest_count, base_price, discount_percent, image_url, features)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          name,
          tier || 'Custom',
          description,
          guest_count,
          base_price,
          discount_percent || 0,
          image_url,
          features || [],
        ]
      );

      const pkg = insertPkg.rows[0];

      if (services && Array.isArray(services)) {
        for (const s of services) {
          await client.query(
            `INSERT INTO package_services (package_id, service_id, quantity, notes)
             VALUES ($1, $2, $3, $4)`,
            [pkg.id, s.service_id, s.quantity || 1, s.notes || 'Included']
          );
        }
      }

      return pkg;
    });

    res.status(201).json({
      success: true,
      message: 'Package created successfully!',
      package: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPackages,
  getPackageById,
  createPackage,
};

