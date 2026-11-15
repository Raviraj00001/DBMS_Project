// frontend/src/components/VendorCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, MapPin, Briefcase, ArrowRight } from 'lucide-react';
import StarRating from './StarRating';

export default function VendorCard({ vendor }) {
  const image = vendor.portfolio_images?.[0] || vendor.avatar_url || 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800';

  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-champagne-200/80 hover:border-gold-400 shadow-sm hover:shadow-gold-soft transition-all duration-300 flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={vendor.business_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-sm text-gold-900 border border-gold-300/40 uppercase tracking-wider">
          {vendor.category?.replace('_', ' ')}
        </span>

        {vendor.is_verified && (
          <span className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-sm">
            <BadgeCheck className="w-3.5 h-3.5" />
            <span>Verified</span>
          </span>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-serif text-lg font-bold text-slate-900 group-hover:text-gold-700 transition-colors line-clamp-1">
              {vendor.business_name}
            </h3>
            <StarRating rating={vendor.rating} />
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
            {vendor.description}
          </p>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-champagne-100">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gold-600" />
              <span>{vendor.city}</span>
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-gold-600" />
              <span>{vendor.experience_years}+ Yrs Exp</span>
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-champagne-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
              Starting From
            </span>
            <span className="text-base font-bold text-slate-900">
              {formatPrice(vendor.starting_price)}
            </span>
          </div>

          <Link
            to={`/vendors/${vendor.id}`}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gold-900 bg-gold-100 hover:bg-gold-200 transition-colors"
          >
            <span>View Services</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

