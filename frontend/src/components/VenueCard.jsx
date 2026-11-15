// frontend/src/components/VenueCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Calendar, ArrowRight } from 'lucide-react';
import StarRating from './StarRating';

export default function VenueCard({ venue, onQuickBook }) {
  const primaryImage = venue.image_urls?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800';

  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-champagne-200/80 hover:border-gold-400 shadow-sm hover:shadow-gold-soft transition-all duration-300 flex flex-col">
      {/* Image & Badges */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={primaryImage}
          alt={venue.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Venue Type Tag */}
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-gold-900 border border-gold-300/40 uppercase tracking-wider">
          {venue.venue_type?.replace('_', ' ')}
        </span>

        {/* City Location */}
        <span className="absolute bottom-3 left-3 flex items-center gap-1 text-xs font-medium text-white/95">
          <MapPin className="w-3.5 h-3.5 text-gold-400" />
          <span>{venue.city}, {venue.state}</span>
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h3 className="font-serif text-xl font-bold text-slate-900 group-hover:text-gold-700 transition-colors line-clamp-1">
              {venue.name}
            </h3>
            <StarRating rating={venue.rating} />
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
            {venue.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-champagne-100">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-gold-600" />
              <span>{venue.capacity_min} - {venue.capacity_max} Guests</span>
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 border-t border-champagne-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
              Daily Rental
            </span>
            <span className="text-lg font-bold text-slate-900">
              {formatPrice(venue.price_per_day)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/venues/${venue.id}`}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold text-gold-900 bg-gold-100 hover:bg-gold-200 transition-colors"
            >
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

