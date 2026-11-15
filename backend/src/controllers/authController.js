// backend/src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_wedding_bliss_jwt_key_2026_xyz';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token for user
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.full_name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Register a new user (Customer or Vendor)
 */
const register = async (req, res, next) => {
  try {
    const { full_name, email, password, phone, role, avatar_url } = req.body;

    const assignedRole = ['customer', 'vendor'].includes(role) ? role : 'customer';

    // Check if email already registered
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered. Please sign in.',
      });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const defaultAvatar = assignedRole === 'vendor'
      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';

    // Insert user into database
    const insertRes = await db.query(
      `INSERT INTO users (full_name, email, password_hash, phone, role, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, full_name, email, phone, role, avatar_url, created_at`,
      [
        full_name.trim(),
        email.toLowerCase().trim(),
        password_hash,
        phone.trim(),
        assignedRole,
        avatar_url || defaultAvatar,
      ]
    );

    const newUser = insertRes.rows[0];

    // If role is vendor, create initial vendor profile record
    if (assignedRole === 'vendor') {
      const { business_name, category, city, address } = req.body;
      await db.query(
        `INSERT INTO vendors (user_id, business_name, category, description, address, city, starting_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          newUser.id,
          business_name || `${newUser.full_name} Services`,
          category || 'wedding_planner',
          'Professional wedding vendor specializing in bespoke celebrations.',
          address || 'Downtown Center',
          city || 'Jaipur',
          15000.00,
        ]
      );
    }

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * User login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userRes = await db.query(
      `SELECT id, full_name, email, password_hash, phone, role, avatar_url, is_active, created_at
       FROM users 
       WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (userRes.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    const user = userRes.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    // If vendor, also attach vendor record
    let vendorDetails = null;
    if (user.role === 'vendor') {
      const vRes = await db.query('SELECT * FROM vendors WHERE user_id = $1', [user.id]);
      if (vRes.rowCount > 0) {
        vendorDetails = vRes.rows[0];
      }
    }

    const token = generateToken(user);
    delete user.password_hash;

    res.json({
      success: true,
      message: `Welcome back, ${user.full_name}!`,
      token,
      user: {
        ...user,
        vendor: vendorDetails,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 */
const getMe = async (req, res, next) => {
  try {
    const userRes = await db.query(
      `SELECT id, full_name, email, phone, role, avatar_url, is_active, created_at
       FROM users 
       WHERE id = $1`,
      [req.user.id]
    );

    if (userRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = userRes.rows[0];

    let vendorDetails = null;
    if (user.role === 'vendor') {
      const vRes = await db.query('SELECT * FROM vendors WHERE user_id = $1', [user.id]);
      if (vRes.rowCount > 0) {
        vendorDetails = vRes.rows[0];
      }
    }

    res.json({
      success: true,
      user: {
        ...user,
        vendor: vendorDetails,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { full_name, phone, avatar_url } = req.body;

    const updateRes = await db.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           avatar_url = COALESCE($3, avatar_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, full_name, email, phone, role, avatar_url, updated_at`,
      [full_name, phone, avatar_url, req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updateRes.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};

