// frontend/src/pages/VenuesPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import VenueCard from '../components/VenueCard';
import { Search, Filter, MapPin, Users, SlidersHorizontal, RotateCcw } from 'lucide-react';

export default function VenuesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [venues, setVenues] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [venueType, setVenueType] = useState(searchParams.get('venue_type') || '');
  const [minCapacity, setMinCapacity] = useState(searchParams.get('min_capacity') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'rating');
  const [order, setOrder] = useState(searchParams.get('order') || 'DESC');

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (city) params.city = city;
      if (venueType) params.venue_type = venueType;
      if (minCapacity) params.min_capacity = minCapacity;
      if (maxPrice) params.max_price = maxPrice;
      params.sort_by = sortBy;
      params.order = order;

      const res = await api.getVenues(params);
      if (res.venues) {
        setVenues(res.venues);
        if (res.available_cities) setCities(res.available_cities);
      }
    } catch (err) {
      console.error('Failed to load venues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, [city, venueType, sortBy, order]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVenues();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCity('');
    setVenueType('');
    setMinCapacity('');
    setMaxPrice('');
    setSortBy('rating');
    setOrder('DESC');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-700">
          Royal Destinations & Heritage Estates
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900">
          Wedding Venues & Palaces
        </h1>
        <p className="text-sm text-slate-600">
          Discover certified heritage palaces, lakeside lawns, and luxury ballrooms with real-time date availability checking.
        </p>
      </div>

      {/* Filter Control Box */}
      <div className="bg-white rounded-2xl p-6 border border-champagne-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Keyword Search */}
          <div className="lg:col-span-2 relative">
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Search Venue
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search palace, resort, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500 bg-ivory-50/50"
              />
            </div>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              City Destination
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500 bg-ivory-50/50"
            >
              <option value="">All Cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Venue Type */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Venue Type
            </label>
            <select
              value={venueType}
              onChange={(e) => setVenueType(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500 bg-ivory-50/50"
            >
              <option value="">All Types</option>
              <option value="palace">Palace</option>
              <option value="lawn">Lawn</option>
              <option value="beachside">Beachside</option>
              <option value="banquet_hall">Banquet Hall</option>
              <option value="resort">Resort</option>
              <option value="hotel">Hotel</option>
            </select>
          </div>

          {/* Sorting */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Sort By
            </label>
            <select
              value={`${sortBy}_${order}`}
              onChange={(e) => {
                const [sb, ord] = e.target.value.split('_');
                setSortBy(sb);
                setOrder(ord);
              }}
              className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500 bg-ivory-50/50"
            >
              <option value="rating_DESC">Highest Rated</option>
              <option value="price_ASC">Price: Low to High</option>
              <option value="price_DESC">Price: High to Low</option>
              <option value="capacity_DESC">Largest Capacity</option>
            </select>
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-between pt-3 border-t border-champagne-100 gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-semibold text-slate-900">{venues.length}</span> venues matched your criteria.
          </div>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-gold-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      </div>

      {/* Venues Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-96 rounded-2xl bg-champagne-200/50"></div>
          ))}
        </div>
      ) : venues.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-champagne-200 p-8 space-y-4">
          <MapPin className="w-12 h-12 text-gold-400 mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-slate-800">No Venues Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Try adjusting your search criteria or resetting filters to explore all royal destinations.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-6 py-2.5 rounded-xl bg-gold-600 text-white font-semibold text-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      )}
    </div>
  );
}

