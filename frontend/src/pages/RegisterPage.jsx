// frontend/src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, User, Phone, Briefcase, MapPin, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [role, setRole] = useState('customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // Vendor specific fields
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('catering');
  const [city, setCity] = useState('Jaipur');
  const [address, setAddress] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        full_name: fullName,
        email,
        phone,
        password,
        role,
      };

      if (role === 'vendor') {
        payload.business_name = businessName;
        payload.category = category;
        payload.city = city;
        payload.address = address;
      }

      const res = await register(payload);
      if (res.user.role === 'vendor') navigate('/vendor');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please verify inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-champagne-300 shadow-xl relative overflow-hidden">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gold-600 to-gold-400 flex items-center justify-center mx-auto shadow-gold-soft">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-slate-900">
            Create Your Account
          </h2>
          <p className="text-xs text-slate-500">
            Join Wedding Bliss as an esteemed couple or a verified wedding service vendor.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-ivory-100 border border-champagne-300 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-2 rounded-xl transition-all ${
              role === 'customer'
                ? 'bg-white text-gold-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            I am a Couple / Customer
          </button>
          <button
            type="button"
            onClick={() => setRole('vendor')}
            className={`py-2 rounded-xl transition-all ${
              role === 'vendor'
                ? 'bg-white text-gold-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            I am a Wedding Vendor
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500 bg-ivory-50/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500 bg-ivory-50/50"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500 bg-ivory-50/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500 bg-ivory-50/50"
                required
              />
            </div>
          </div>

          {/* Vendor Details */}
          {role === 'vendor' && (
            <div className="p-4 rounded-2xl bg-champagne-100/50 border border-champagne-200 space-y-3">
              <span className="text-[11px] uppercase font-bold text-gold-800 tracking-wider block">
                Vendor Business Profile
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business / Brand Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Gourmet Catering"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Service Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500 bg-white"
                  >
                    <option value="catering">Catering</option>
                    <option value="photography">Photography</option>
                    <option value="videography">Videography</option>
                    <option value="decoration">Decoration</option>
                    <option value="music_dj">Music & DJ</option>
                    <option value="makeup_artist">Makeup Artist</option>
                    <option value="wedding_planner">Wedding Planner</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Operational City *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jaipur"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business Address
                  </label>
                  <input
                    type="text"
                    placeholder="Studio or Office Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-700 hover:to-gold-600 text-white font-bold text-sm shadow-gold-soft transition-all flex items-center justify-center gap-2"
          >
            <span>{submitting ? 'Creating Account...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-gold-700 hover:text-gold-900 underline">
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
}

