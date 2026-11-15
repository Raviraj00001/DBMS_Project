// backend/src/middlewares/validator.js

const validateRegistration = (req, res, next) => {
  const { full_name, email, password, phone } = req.body;

  if (!full_name || full_name.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Full name is required (min 2 characters).' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'A valid email address is required.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }

  if (!phone || phone.trim().length < 7) {
    return res.status(400).json({ success: false, message: 'Valid phone number is required.' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }
  next();
};

const validateBooking = (req, res, next) => {
  const { wedding_date, guest_count } = req.body;

  if (!wedding_date) {
    return res.status(400).json({ success: false, message: 'Wedding date is required.' });
  }

  const dateObj = new Date(wedding_date);
  if (isNaN(dateObj.getTime())) {
    return res.status(400).json({ success: false, message: 'Invalid wedding date format.' });
  }

  if (!guest_count || parseInt(guest_count, 10) <= 0) {
    return res.status(400).json({ success: false, message: 'Guest count must be a positive integer.' });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateBooking,
};

