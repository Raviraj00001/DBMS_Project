// frontend/src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  MapPin, 
  Users, 
  Package, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard, 
  Info,
  Database,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  // Pure customer luxury wedding navigation
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Venues', path: '/venues', icon: MapPin },
    { name: 'Vendors', path: '/vendors', icon: Users },
    { name: 'Packages', path: '/packages', icon: Package },
    { name: 'About Us', path: '/about', icon: Info },
  ];

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin';
    if (role === 'vendor') return '/vendor';
    return '/dashboard';
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-ivory-50/95 backdrop-blur-md border-b border-champagne-200/90 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo - Commercial Luxury Wedding Experience */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-gold-600 via-gold-400 to-gold-200 flex items-center justify-center shadow-gold-soft group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-slate-900 group-hover:text-gold-700 transition-colors">
                Wedding<span className="text-gold-600 italic">Bliss</span>
              </span>
              <span className="block text-[10px] tracking-widest uppercase font-semibold text-gold-700">
                Luxury Planning & Concierge
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Customer Centric */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-gold-500 text-white shadow-sm'
                      : 'text-slate-700 hover:text-gold-700 hover:bg-champagne-100/70'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 opacity-80" />}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-champagne-300 bg-white hover:border-gold-400 transition-all shadow-sm"
                >
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                    alt={user.full_name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-gold-400"
                  />
                  <div className="text-left text-xs">
                    <span className="font-semibold text-slate-800 block truncate max-w-[120px]">
                      {user.full_name}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-gold-100 text-gold-800">
                      {role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-champagne-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-champagne-100">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.email}</p>
                    </div>

                    <Link
                      to={getDashboardPath()}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-champagne-50 hover:text-gold-800 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gold-600" />
                      <span>{role === 'admin' ? 'Admin Console' : role === 'vendor' ? 'Vendor Portal' : 'My Wedding Bookings'}</span>
                    </Link>

                    {/* Admin Exclusive: DBMS Lab link in user menu */}
                    {role === 'admin' && (
                      <Link
                        to="/admin/dbms"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gold-900 bg-gold-50/80 hover:bg-gold-100/90 font-semibold transition-colors border-y border-gold-200/60"
                      >
                        <Database className="w-4 h-4 text-gold-700" />
                        <span>DBMS Evaluation Lab</span>
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full text-sm font-medium text-slate-700 hover:text-gold-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-700 hover:to-gold-600 shadow-gold-soft transition-all duration-200 hover:scale-[1.02]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:text-gold-700 hover:bg-champagne-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-champagne-200 bg-ivory-50 px-4 pt-3 pb-6 space-y-2 animate-in fade-in duration-150">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-gold-500 text-white'
                    : 'text-slate-800 hover:bg-champagne-100'
                }`}
              >
                {Icon && <Icon className="w-5 h-5 opacity-70" />}
                <span>{link.name}</span>
              </Link>
            );
          })}

          <div className="pt-4 border-t border-champagne-200">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gold-100 text-gold-900 font-semibold"
                >
                  <LayoutDashboard className="w-5 h-5 text-gold-700" />
                  <span>Go to {role === 'admin' ? 'Admin Console' : role === 'vendor' ? 'Vendor Portal' : 'My Dashboard'}</span>
                </Link>

                {role === 'admin' && (
                  <Link
                    to="/admin/dbms"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gold-200/80 text-gold-950 font-semibold border border-gold-400"
                  >
                    <Database className="w-5 h-5 text-gold-700" />
                    <span>Faculty DBMS Evaluation Lab</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-champagne-300 text-slate-800 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-gold-600 text-white font-semibold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
