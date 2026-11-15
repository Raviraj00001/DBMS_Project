// frontend/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, MapPin, Phone, Mail, ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { role } = useAuth();

  return (
    <footer className="bg-charcoal-900 text-slate-300 border-t border-champagne-300/20 pt-16 pb-10 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-charcoal-800">
          
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold-600 to-gold-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                Wedding<span className="text-gold-400 italic">Bliss</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's premier luxury wedding planning and booking platform. Connecting distinguished couples with royal heritage palaces, master culinary chefs, and visionary wedding artisans.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-gold-400" />
                <span>Jaipur • Udaipur • Goa • New Delhi • Mumbai</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gold-400" />
                <span>+91 98765 43210 (Concierge Desk)</span>
              </div>
            </div>
          </div>

          {/* Luxury Venues */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white tracking-wide mb-4">
              Royal Destinations
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/venues?venue_type=palace" className="hover:text-gold-400 transition-colors">
                  Heritage Palaces & Forts
                </Link>
              </li>
              <li>
                <Link to="/venues?venue_type=lawn" className="hover:text-gold-400 transition-colors">
                  Lakeside & Royal Lawns
                </Link>
              </li>
              <li>
                <Link to="/venues?venue_type=beachside" className="hover:text-gold-400 transition-colors">
                  Beachfront Pavilions
                </Link>
              </li>
              <li>
                <Link to="/venues?venue_type=banquet_hall" className="hover:text-gold-400 transition-colors">
                  Grand Ballrooms
                </Link>
              </li>
              <li>
                <Link to="/venues" className="hover:text-gold-400 transition-colors">
                  View All Venues
                </Link>
              </li>
            </ul>
          </div>

          {/* Master Vendors */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white tracking-wide mb-4">
              Curated Artisans
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/vendors?category=catering" className="hover:text-gold-400 transition-colors">
                  Gourmet Royal Catering
                </Link>
              </li>
              <li>
                <Link to="/vendors?category=photography" className="hover:text-gold-400 transition-colors">
                  Candid 4K Cinematography
                </Link>
              </li>
              <li>
                <Link to="/vendors?category=decoration" className="hover:text-gold-400 transition-colors">
                  Floral Mandap Architecture
                </Link>
              </li>
              <li>
                <Link to="/vendors?category=makeup_artist" className="hover:text-gold-400 transition-colors">
                  Celebrity Bridal Artistry
                </Link>
              </li>
              <li>
                <Link to="/packages" className="hover:text-gold-400 transition-colors">
                  Wedding Packages
                </Link>
              </li>
            </ul>
          </div>

          {/* Concierge & About */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white tracking-wide mb-4">
              Wedding Bliss Concierge
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/about" className="hover:text-gold-400 transition-colors">
                  About Our Founders
                </Link>
              </li>
              <li>
                <Link to="/packages" className="hover:text-gold-400 transition-colors">
                  All-Inclusive Packages
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-gold-400 transition-colors">
                  Vendor Partner Network
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-gold-400 transition-colors">
                  Account Sign In
                </Link>
              </li>
              
              {/* Discrete Faculty / Admin Access link */}
              <li className="pt-2">
                <Link 
                  to={role === 'admin' ? '/admin/dbms' : '/login'} 
                  className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-gold-400 transition-colors"
                >
                  <Lock className="w-3 h-3" />
                  <span>Admin & Faculty Portal</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Wedding Bliss Luxury Concierge. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> by Ravi Raj, Manpreet, Perirt & Raj Tripathi.
          </p>
        </div>
      </div>
    </footer>
  );
}
