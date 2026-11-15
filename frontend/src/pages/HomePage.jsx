// frontend/src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  MapPin, 
  Users, 
  Search, 
  Calendar, 
  ShieldCheck, 
  Heart, 
  Award, 
  ArrowRight, 
  Star,
  CheckCircle2,
  Clock,
  Compass,
  Smile,
  Gem
} from 'lucide-react';
import { api } from '../services/api';
import VenueCard from '../components/VenueCard';
import VendorCard from '../components/VendorCard';
import PackageCard from '../components/PackageCard';
import StarRating from '../components/StarRating';

export default function HomePage() {
  const [featuredVenues, setFeaturedVenues] = useState([]);
  const [topVendors, setTopVendors] = useState([]);
  const [packages, setPackages] = useState([]);
  const [cities, setCities] = useState([]);
  const [searchCity, setSearchCity] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchGuests, setSearchGuests] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [venuesRes, vendorsRes, packagesRes] = await Promise.all([
          api.getVenues({ limit: 3, sort_by: 'rating' }),
          api.getVendors({ limit: 3, is_verified: true }),
          api.getPackages(),
        ]);

        if (venuesRes.venues) {
          setFeaturedVenues(venuesRes.venues);
          setCities(venuesRes.available_cities || ['Jaipur', 'Udaipur', 'Goa', 'New Delhi', 'Mumbai', 'Bengaluru']);
        }
        if (vendorsRes.vendors) setTopVendors(vendorsRes.vendors);
        if (packagesRes.packages) setPackages(packagesRes.packages.slice(0, 3));
      } catch (err) {
        console.warn('Backend API notice on homepage load:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity) params.append('city', searchCity);
    if (searchType) params.append('venue_type', searchType);
    if (searchGuests) params.append('min_capacity', searchGuests);
    navigate(`/venues?${params.toString()}`);
  };

  // Real Couple Testimonials
  const testimonials = [
    {
      id: 1,
      names: "Rajesh & Priya",
      location: "Jaipur Destination Wedding",
      venue: "The Grand Umaid Palace",
      image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=300",
      rating: 5,
      story: "Booking The Grand Umaid Palace through Wedding Bliss was effortless! The date was confirmed instantly, and the multi-cuisine catering by Royal Gourmet left all 700 of our guests mesmerized. Pure fairytale elegance.",
    },
    {
      id: 2,
      names: "Vikram & Simran",
      location: "Udaipur Lakeside Wedding",
      venue: "Taj Lakeview Lawn & Resort",
      image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=300",
      rating: 5,
      story: "The lakeside sunset vows were breathtaking. Having our photographers and mandap decorators synced under a single verified package removed all the stress from wedding week. Highly recommend!",
    },
    {
      id: 3,
      names: "Aarav & Meera",
      location: "Goa Beachfront Ceremony",
      venue: "Emerald Palms Beachside Pavilion",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300",
      rating: 5,
      story: "From barefoot cocktail hours to the midnight beach reception with DJ Kabir, everything ran like clockwork. The milestone payment plan gave our families complete confidence throughout.",
    },
  ];

  return (
    <div className="space-y-24">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[88vh] flex items-center justify-center -mt-20 pt-28 pb-20 overflow-hidden">
        {/* Background Image with Warm Ivory & Gold Gradients */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=85&w=1920"
            alt="Royal Wedding Celebration"
            className="w-full h-full object-cover scale-105 filter brightness-[0.40] saturate-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ivory-50 via-charcoal-950/40 to-charcoal-950/70"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-8">
          
          {/* Subtle Floating Luxury Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-gold-400/40 text-gold-200 text-xs font-semibold tracking-wider uppercase animate-float shadow-gold-soft">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>Curated Grand Celebrations • India's Premier Wedding Platform</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.12] drop-shadow-md">
            Where Royal Dreams Meet <br />
            <span className="italic font-normal gold-gradient-text">Timeless Splendor</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-200 font-light leading-relaxed">
            Reserve majestic palaces, award-winning culinary maestros, visionary photographers, and bespoke decor with instant date verification and verified partner guarantees.
          </p>

          {/* Quick Search Floating Bar */}
          <form 
            onSubmit={handleHeroSearch}
            className="bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-3xl shadow-2xl border border-champagne-300 max-w-4xl mx-auto text-left grid grid-cols-1 sm:grid-cols-4 gap-3 items-center card-hover-luxury"
          >
            {/* City */}
            <div className="px-3 py-2 border-b sm:border-b-0 sm:border-r border-champagne-200">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gold-600" /> City Destination
              </label>
              <select
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full bg-transparent font-medium text-sm text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="">All Destinations</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Venue Type */}
            <div className="px-3 py-2 border-b sm:border-b-0 sm:border-r border-champagne-200">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-gold-600" /> Venue Style
              </label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full bg-transparent font-medium text-sm text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="">All Venue Styles</option>
                <option value="palace">Royal Palace</option>
                <option value="lawn">Lakeside Lawn</option>
                <option value="beachside">Beachside Pavilion</option>
                <option value="banquet_hall">Grand Ballroom</option>
                <option value="resort">Heritage Resort</option>
                <option value="hotel">Penthouse Hotel</option>
              </select>
            </div>

            {/* Guest Count */}
            <div className="px-3 py-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-gold-600" /> Guests
              </label>
              <input
                type="number"
                placeholder="e.g. 500 Guests"
                value={searchGuests}
                onChange={(e) => setSearchGuests(e.target.value)}
                className="w-full bg-transparent font-medium text-sm text-slate-800 focus:outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-700 hover:to-gold-600 text-white font-semibold text-sm shadow-gold-soft flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02]"
              >
                <Search className="w-4 h-4" />
                <span>Search Venues</span>
              </button>
            </div>
          </form>

          {/* Commercial Brand Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 text-white">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 transition-transform hover:-translate-y-1">
              <span className="font-serif text-2xl font-bold block text-gold-300">120+</span>
              <span className="text-xs text-slate-300">Heritage Palaces & Estates</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 transition-transform hover:-translate-y-1">
              <span className="font-serif text-2xl font-bold block text-gold-300">500+</span>
              <span className="text-xs text-slate-300">Verified Master Artisans</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 transition-transform hover:-translate-y-1">
              <span className="font-serif text-2xl font-bold block text-gold-300">2,400+</span>
              <span className="text-xs text-slate-300">Unforgettable Weddings</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 transition-transform hover:-translate-y-1">
              <span className="font-serif text-2xl font-bold block text-gold-300">4.95 ★</span>
              <span className="text-xs text-slate-300">Couple Delight Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EXPLORE WEDDING VENUES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block mb-1">
              Handpicked Destinations
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
              Explore Wedding Venues
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              From sandstone royal fortresses in Rajasthan to sun-kissed Goan beaches.
            </p>
          </div>
          <Link
            to="/venues"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gold-700 hover:text-gold-900 group"
          >
            <span>View All Venues</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredVenues.map((venue) => (
            <div key={venue.id} className="card-hover-luxury">
              <VenueCard venue={venue} />
            </div>
          ))}
        </div>
      </section>

      {/* 3. HOW IT WORKS (Newly Added Commercial Section) */}
      <section className="bg-gradient-to-b from-champagne-100/60 to-ivory-100/40 py-20 border-y border-champagne-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-700">
              Seamless Four-Step Experience
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
              How Wedding Bliss Works
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We streamline luxury celebration planning into an effortless journey from initial destination inspiration to final celebratory toast.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Step 1 */}
            <div className="bg-white p-7 rounded-3xl border border-champagne-300/80 shadow-sm card-hover-luxury space-y-4 text-center sm:text-left relative">
              <div className="w-12 h-12 rounded-2xl bg-gold-100 text-gold-800 flex items-center justify-center font-serif text-xl font-bold shadow-inner">
                01
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900">
                Discover Royal Venues
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter through certified heritage palaces, manicured lawns, and luxury beach pavilions with transparent guest capacity details.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-7 rounded-3xl border border-champagne-300/80 shadow-sm card-hover-luxury space-y-4 text-center sm:text-left relative">
              <div className="w-12 h-12 rounded-2xl bg-gold-100 text-gold-800 flex items-center justify-center font-serif text-xl font-bold shadow-inner">
                02
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900">
                Check Live Availability
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select your preferred wedding date and verify instant venue calendar availability with zero wait time or manual callbacks.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-7 rounded-3xl border border-champagne-300/80 shadow-sm card-hover-luxury space-y-4 text-center sm:text-left relative">
              <div className="w-12 h-12 rounded-2xl bg-gold-100 text-gold-800 flex items-center justify-center font-serif text-xl font-bold shadow-inner">
                03
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900">
                Curate Packages & Menus
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bundle gourmet multi-cuisine feasts, 4K candid cinematography, and majestic floral mandaps tailored to your tier.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-7 rounded-3xl border border-champagne-300/80 shadow-sm card-hover-luxury space-y-4 text-center sm:text-left relative">
              <div className="w-12 h-12 rounded-2xl bg-gold-100 text-gold-800 flex items-center justify-center font-serif text-xl font-bold shadow-inner">
                04
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900">
                Secure & Celebrate
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Lock your reservation with flexible milestone payments, track receipts in your dashboard, and enjoy stress-free bliss.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. POPULAR WEDDING PACKAGES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-700">
            Curated All-Inclusive Experiences
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
            Popular Wedding Packages
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Transparent, bundled wedding tiers combining venue coordination, multi-cuisine catering, cinematography, and bridal styling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg) => (
            <div key={pkg.id} className="card-hover-luxury">
              <PackageCard
                pkg={pkg}
                onSelect={() => navigate(`/packages`)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 5. FEATURED VENDORS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block mb-1">
              Master Artisans & Chefs
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
              Featured Wedding Vendors
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Verified top-tier talent in catering, candid photography, stage decor, and bridal styling.
            </p>
          </div>
          <Link
            to="/vendors"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gold-700 hover:text-gold-900 group"
          >
            <span>Explore All Vendors</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {topVendors.map((vendor) => (
            <div key={vendor.id} className="card-hover-luxury">
              <VendorCard vendor={vendor} />
            </div>
          ))}
        </div>
      </section>

      {/* 6. CUSTOMER TESTIMONIALS & REAL WEDDINGS */}
      <section className="bg-champagne-50/70 py-20 border-y border-champagne-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-700">
              Cherished Celebrations
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
              Stories of Real Love & Magic
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Read authentic feedback from couples who entrusted their grand milestone celebrations to Wedding Bliss.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-3xl p-7 border border-champagne-200 shadow-sm card-hover-luxury flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <StarRating rating={t.rating} />
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500 opacity-80" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                    "{t.story}"
                  </p>
                </div>

                <div className="pt-4 border-t border-champagne-100 flex items-center gap-3.5">
                  <img
                    src={t.image}
                    alt={t.names}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-gold-400"
                  />
                  <div>
                    <h4 className="font-serif text-base font-bold text-slate-900">
                      {t.names}
                    </h4>
                    <span className="text-[11px] text-gold-700 font-medium block">
                      {t.venue}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {t.location}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. BESPOKE CONCIERGE BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-charcoal-950 via-charcoal-900 to-slate-900 text-white p-8 sm:p-14 overflow-hidden border border-gold-500/30 shadow-2xl">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-gold-500/15 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-gold-500/20 text-gold-300 border border-gold-500/30">
              <Gem className="w-3.5 h-3.5 text-gold-400" />
              <span>Personalized Wedding Concierge Service</span>
            </span>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
              Begin Your Royal Wedding Story Today
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Whether you envision an intimate palace affair under star-lit skies or an extravagant 1,000-guest celebration, our luxury planning concierge is ready to assist.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/venues"
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-slate-950 font-bold text-sm shadow-gold-glow flex items-center gap-2 transition-all duration-300 hover:scale-[1.03]"
              >
                <span>Browse All Royal Venues</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/packages"
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-colors"
              >
                Explore Packages
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
