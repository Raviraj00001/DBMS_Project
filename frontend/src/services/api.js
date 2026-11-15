// frontend/src/services/api.js

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Universal Fetch API wrapper with automatic JWT token attachment
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('wedding_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`[API ERROR] ${options.method || 'GET'} ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
  getMe: () => request('/auth/me'),
  updateProfile: (profileData) => request('/auth/profile', { method: 'PUT', body: profileData }),

  // Venues
  getVenues: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/venues${query ? `?${query}` : ''}`);
  },
  getAdminVenues: () => request('/venues?limit=100&sort_by=name&order=ASC'),
  getVenueById: (id) => request(`/venues/${id}`),
  checkVenueAvailability: (id, date) => request(`/venues/${id}/availability?date=${date}`),
  createVenue: (venueData) => request('/venues', { method: 'POST', body: venueData }),
  updateVenue: (id, venueData) => request(`/venues/${id}`, { method: 'PUT', body: venueData }),
  deleteVenue: (id) => request(`/venues/${id}`, { method: 'DELETE' }),

  // Vendors
  getVendors: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/vendors${query ? `?${query}` : ''}`);
  },
  getVendorById: (id) => request(`/vendors/${id}`),
  updateVendorProfile: (profileData) => request('/vendors/profile', { method: 'PUT', body: profileData }),
  addVendorService: (serviceData) => request('/vendors/services', { method: 'POST', body: serviceData }),
  verifyVendor: (id, is_verified) => request(`/vendors/${id}/verify`, { method: 'PATCH', body: { is_verified } }),
  removeVendor: (id) => request(`/vendors/${id}`, { method: 'DELETE' }),

  // Packages
  getPackages: () => request('/packages'),
  getPackageById: (id) => request(`/packages/${id}`),
  createPackage: (pkgData) => request('/packages', { method: 'POST', body: pkgData }),

  // Bookings
  createBooking: (bookingData) => request('/bookings', { method: 'POST', body: bookingData }),
  getCustomerBookings: () => request('/bookings/my-bookings'),
  getVendorBookings: () => request('/bookings/vendor-orders'),
  getAllBookingsAdmin: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/bookings/admin/all${query ? `?${query}` : ''}`);
  },
  getBookingById: (id) => request(`/bookings/${id}`),
  updateBookingStatus: (id, status) => request(`/bookings/${id}/status`, { method: 'PATCH', body: { status } }),
  cancelBooking: (id) => request(`/bookings/${id}/cancel`, { method: 'POST' }),

  // Payments
  recordPayment: (paymentData) => request('/payments', { method: 'POST', body: paymentData }),
  getBookingPayments: (bookingId) => request(`/payments/booking/${bookingId}`),

  // Reviews
  createReview: (reviewData) => request('/reviews', { method: 'POST', body: reviewData }),
  getVenueReviews: (venueId) => request(`/reviews/venue/${venueId}`),
  getVendorReviews: (vendorId) => request(`/reviews/vendor/${vendorId}`),

  // Dashboards
  getCustomerDashboard: () => request('/dashboard/customer'),
  getVendorDashboard: () => request('/dashboard/vendor'),
  getAdminDashboard: () => request('/dashboard/admin'),

  // Customer support questions and complaints
  createSupportRequest: (payload) => request('/support', { method: 'POST', body: payload }),
  getMySupportRequests: () => request('/support/mine'),
  getAdminSupportRequests: () => request('/support/admin'),
  updateSupportRequest: (id, payload) => request(`/support/${id}`, { method: 'PATCH', body: payload }),

  // DBMS Reports & Query Demo
  getDbmsQueries: () => request('/reports/queries'),
  runDbmsQuery: (payload) => request('/reports/run-query', { method: 'POST', body: payload }),
  getSchemaStats: () => request('/reports/schema-stats'),
  getHealth: () => request('/health'),
};

