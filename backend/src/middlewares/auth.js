// backend/src/middlewares/auth.js
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_wedding_bliss_jwt_key_2026_xyz';

/**
 * Verify JWT token middleware
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch fresh user profile from DB to ensure account is active
    const userRes = await db.query(
      'SELECT id, full_name, email, phone, role, avatar_url, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userRes.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User no longer exists.',
      });
    }

    const user = userRes.rows[0];
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact administration.',
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session token expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token authentication.',
      error: error.message,
    });
  }
};

/**
 * Role-Based Access Control (RBAC) middleware
 * @param  {...string} roles Allowed roles ('admin', 'vendor', 'customer')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. This operation requires one of the following roles: [${roles.join(', ')}]. Your role is '${req.user.role}'.`,
      });
    }

    next();
  };
};

/**
 * Optional authentication: attaches user if token valid, continues anyway if not
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const userRes = await db.query(
        'SELECT id, full_name, email, phone, role, avatar_url FROM users WHERE id = $1 AND is_active = TRUE',
        [decoded.id]
      );
      if (userRes.rowCount > 0) {
        req.user = userRes.rows[0];
      }
    }
  } catch (err) {
    // Ignore error for optional auth
  }
  next();
};

module.exports = {
  verifyToken,
  requireRole,
  optionalAuth,
};

