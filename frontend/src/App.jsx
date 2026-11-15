// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import VenuesPage from './pages/VenuesPage';
import VenueDetailPage from './pages/VenueDetailPage';
import VendorsPage from './pages/VendorsPage';
import VendorDetailPage from './pages/VendorDetailPage';
import PackagesPage from './pages/PackagesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DbmsShowcasePage from './pages/DbmsShowcasePage';
import AboutPage from './pages/AboutPage';

// Protected Route Guard
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gold-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-ivory-50 text-slate-800 font-sans selection:bg-gold-200 selection:text-gold-900">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Luxury Customer Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/venues" element={<VenuesPage />} />
              <Route path="/venues/:id" element={<VenueDetailPage />} />
              <Route path="/vendors" element={<VendorsPage />} />
              <Route path="/vendors/:id" element={<VendorDetailPage />} />
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/about" element={<AboutPage />} />

              {/* Legacy route redirects to protected Admin DBMS lab */}
              <Route path="/dbms-showcase" element={<Navigate to="/admin/dbms" replace />} />

              {/* Protected Customer Portal */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'admin']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Vendor Portal */}
              <Route
                path="/vendor"
                element={
                  <ProtectedRoute allowedRoles={['vendor', 'admin']}>
                    <VendorDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Operations Console */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Faculty & Admin DBMS Evaluation Route */}
              <Route
                path="/admin/dbms"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DbmsShowcasePage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

