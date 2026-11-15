// backend/src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorHandler');
const db = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const venueRoutes = require('./routes/venueRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const packageRoutes = require('./routes/packageRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const supportRoutes = require('./routes/supportRoutes');

const app = express();

// Security and middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: '*', // Allow frontend Vite dev server or production host
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health and Diagnostics API
app.get('/api/health', async (req, res) => {
  const dbStatus = await db.testConnection();
  res.json({
    status: 'online',
    system: 'Wedding Planning & Booking Management System API',
    version: '1.0.0',
    authors: ['Ravi Raj', 'Manpreet', 'Perirt', 'Raj Tripathi'],
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/support', supportRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;

