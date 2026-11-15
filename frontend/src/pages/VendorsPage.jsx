// frontend/src/pages/VendorsPage.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import VendorCard from '../components/VendorCard';
import { Search, Filter, RotateCcw, BadgeCheck, Utensils, Camera, Palette, Music, Sparkles } from 'lucide-react';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [search, setSearch] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const categories = [
    { label: 'All Categories', value: '' },
    { label: 'Catering', value: 'catering' },
    { label: 'Photography', value: 'photography' },
    { label: 'Decoration', value: 'decoration' },
    { label: 'Makeup Artist', value: 'makeup_artist' },
    { label: 'Music & DJ', value: 'music_dj' },
    { label: 'Wedding Planner', value: 'wedding_planner' },
  ];

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category) params.category = category;
      if (city) params.city = city;
      if (search) params.search = search;
      if (verifiedOnly) params.is_verified = 'true';

      const res = await api.getVendors(params);
      if (res.vendors) setVendors(res.vendors);
    } catch (err) {
      console.error('Failed to load vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [category, verifiedOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVendors();
  };

  const handleReset = () => {
    setCategory('');
    setCity('');
    setSearch('');
    setVerifiedOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700">
          Certified Wedding Artisans
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900">
          Premier Wedding Vendors
        </h1>
        <p className="text-sm text-slate-600">
          Connect with vetted culinary masters, candid visual storytellers, floral architects, and celebrity makeup artists.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 justify-start sm:justify-center">
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              category === c.value
                ? 'bg-gold-600 text-white shadow-gold-soft'
                : 'bg-white text-slate-700 border border-champagne-300 hover:border-gold-400'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl p-5 border border-champagne-200 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search vendor name, specialty, services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500 bg-ivory-50/50"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Filter by City (e.g. Jaipur)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500 bg-ivory-50/50"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-semibold text-xs transition-colors"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-xl border border-champagne-300 text-slate-500 hover:text-gold-700 transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="flex items-center justify-between pt-2 border-t border-champagne-100 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded text-gold-600 focus:ring-gold-500"
            />
            <span className="flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" /> Show Verified Vendors Only
            </span>
          </label>
          <span className="text-slate-500">{vendors.length} vendors listed</span>
        </div>
      </div>

      {/* Vendors Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 rounded-2xl bg-champagne-200/50"></div>
          ))}
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-champagne-200 p-8 space-y-4">
          <Sparkles className="w-12 h-12 text-gold-400 mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-slate-800">No Vendors Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Try choosing a different category or clearing search filters.
          </p>
          <button
            onClick={handleReset}
            className="px-6 py-2.5 rounded-xl bg-gold-600 text-white font-semibold text-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      )}
    </div>
  );
}

