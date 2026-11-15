// frontend/src/components/PackageCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, Users } from 'lucide-react';

export default function PackageCard({ pkg, onSelect }) {
  const isPlatinum = pkg.tier === 'Platinum' || pkg.tier === 'Royal Bespoke';

  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const discountedPrice = pkg.discounted_price || (pkg.base_price * (1 - (pkg.discount_percent || 0) / 100));

  return (
    <div className={`relative rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 ${
      isPlatinum 
        ? 'bg-gradient-to-b from-charcoal-900 to-charcoal-950 text-white border-2 border-gold-500 shadow-xl' 
        : 'bg-white text-slate-800 border border-champagne-300 shadow-sm hover:shadow-gold-soft'
    }`}>
      {/* Featured Badge */}
      {isPlatinum && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-gold-600 to-gold-400 text-slate-950 text-[10px] font-bold tracking-widest uppercase px-4 py-1 rounded-bl-xl shadow-md flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>Most Luxurious</span>
        </div>
      )}

      <div className="p-7 space-y-6">
        <div>
          <span className={`text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full ${
            isPlatinum ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'bg-gold-100 text-gold-800'
          }`}>
            {pkg.tier} Tier
          </span>
          <h3 className={`font-serif text-2xl font-bold mt-3 ${isPlatinum ? 'text-white' : 'text-slate-900'}`}>
            {pkg.name}
          </h3>
          <p className={`text-xs mt-2 leading-relaxed ${isPlatinum ? 'text-slate-300' : 'text-slate-600'}`}>
            {pkg.description}
          </p>
        </div>

        {/* Pricing */}
        <div className="pt-4 border-t border-champagne-200/30">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">
              {formatPrice(discountedPrice)}
            </span>
            {pkg.discount_percent > 0 && (
              <span className="text-sm line-through text-slate-400">
                {formatPrice(pkg.base_price)}
              </span>
            )}
          </div>
          {pkg.discount_percent > 0 && (
            <span className="inline-block text-[11px] font-semibold text-emerald-500 mt-1">
              Save {pkg.discount_percent}% with seasonal booking
            </span>
          )}

          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3">
            <Users className="w-4 h-4 text-gold-500" />
            <span>Designed for ~{pkg.guest_count} Invited Guests</span>
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-2.5 pt-2">
          <span className={`text-[11px] font-bold uppercase tracking-wider block ${isPlatinum ? 'text-gold-400' : 'text-slate-400'}`}>
            What's Included:
          </span>
          <ul className="space-y-2 text-xs">
            {pkg.features?.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <div className={`rounded-full p-0.5 mt-0.5 ${isPlatinum ? 'bg-gold-500 text-slate-950' : 'bg-gold-100 text-gold-700'}`}>
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className={isPlatinum ? 'text-slate-200' : 'text-slate-700'}>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA Button */}
      <div className="p-7 pt-0">
        <button
          onClick={() => onSelect && onSelect(pkg)}
          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
            isPlatinum
              ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-slate-950 hover:from-gold-400 hover:to-gold-300 shadow-gold-glow'
              : 'bg-gold-600 hover:bg-gold-700 text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Select This Package</span>
        </button>
      </div>
    </div>
  );
}

