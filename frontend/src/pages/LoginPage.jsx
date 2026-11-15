// frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.user.role === 'admin') navigate('/admin');
      else if (res.user.role === 'vendor') navigate('/vendor');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-champagne-300 shadow-xl relative overflow-hidden">
        
        {/* Subtle decorative gold glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gold-400/10 blur-2xl pointer-events-none"></div>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gold-600 to-gold-400 flex items-center justify-center mx-auto shadow-gold-soft">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-slate-900">
            Welcome to Wedding<span className="text-gold-600 italic">Bliss</span>
          </h2>
          <p className="text-xs text-slate-500">
            Sign in to manage your wedding reservations, services, or vendor console.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
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
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500 bg-ivory-50/50"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-700 hover:to-gold-600 text-white font-bold text-sm shadow-gold-soft transition-all flex items-center justify-center gap-2"
          >
            <span>{submitting ? 'Verifying Session...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-gold-700 hover:text-gold-900 underline">
            Register Here
          </Link>
        </div>

      </div>
    </div>
  );
}

