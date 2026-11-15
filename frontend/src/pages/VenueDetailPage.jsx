// frontend/src/pages/VenueDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import Modal from '../components/Modal';
import { 
  MapPin, 
  Users, 
  Check, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  CreditCard 
} from 'lucide-react';

export default function VenueDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  // Availability Check State
  const [checkDate, setCheckDate] = useState('');
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [packages, setPackages] = useState([]);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [guestCount, setGuestCount] = useState(300);
  const [specialRequests, setSpecialRequests] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState(100000);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    async function loadVenue() {
      try {
        const [vRes, pRes] = await Promise.all([
          api.getVenueById(id),
          api.getPackages(),
        ]);
        if (vRes.venue) setVenue(vRes.venue);
        if (pRes.packages) setPackages(pRes.packages);
      } catch (err) {
        console.error('Error loading venue:', err);
      } finally {
        setLoading(false);
      }
    }
    loadVenue();
  }, [id]);

  const handleCheckAvailability = async (e) => {
    e.preventDefault();
    if (!checkDate) return;
    setCheckingAvailability(true);
    setAvailabilityResult(null);

    try {
      const res = await api.checkVenueAvailability(id, checkDate);
      setAvailabilityResult(res);
    } catch (err) {
      setAvailabilityResult({
        is_available: false,
        message: err.message || 'Error verifying date with database.',
      });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setBookingSubmitting(true);
    setBookingError('');

    try {
      const payload = {
        venue_id: parseInt(id, 10),
        package_id: selectedPackageId ? parseInt(selectedPackageId, 10) : null,
        wedding_date: bookingDate,
        guest_count: parseInt(guestCount, 10),
        special_requests: specialRequests,
        advance_payment_amount: parseFloat(advanceAmount) || 0,
        payment_method: paymentMethod,
      };

      const res = await api.createBooking(payload);
      setBookingSuccess(res.data);
    } catch (err) {
      setBookingError(err.message || 'Booking transaction failed.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setReviewSubmitting(true);
    try {
      await api.createReview({
        venue_id: parseInt(id, 10),
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewModalOpen(false);
      // Reload venue reviews
      const freshVenue = await api.getVenueById(id);
      setVenue(freshVenue.venue);
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const formatPrice = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="h-96 rounded-3xl bg-champagne-200 mb-6"></div>
        <div className="h-8 w-64 bg-champagne-200 mx-auto rounded"></div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-slate-800">Venue Not Found</h2>
        <p className="text-sm text-slate-500">The requested venue could not be retrieved.</p>
        <Link to="/venues" className="inline-block px-5 py-2.5 rounded-xl bg-gold-600 text-white font-semibold text-xs">
          Back to Venues
        </Link>
      </div>
    );
  }

  const images = venue.image_urls || ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* 1. IMAGE GALLERY */}
      <div className="space-y-4">
        <div className="h-[480px] rounded-3xl overflow-hidden shadow-lg border border-champagne-200 relative">
          <img
            src={images[selectedImage]}
            alt={venue.name}
            className="w-full h-full object-cover transition-all duration-500"
          />
          <div className="absolute top-4 left-4 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-gold-900 font-bold text-xs uppercase tracking-wider border border-gold-300">
            {venue.venue_type?.replace('_', ' ')}
          </div>
        </div>

        {/* Thumbnail Selector */}
        {images.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                  selectedImage === idx ? 'border-gold-500 ring-2 ring-gold-400' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. VENUE HEADLINE & HIGHLIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900">
                {venue.name}
              </h1>
              <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-champagne-300 shadow-sm">
                <StarRating rating={venue.rating} />
                <span className="text-xs text-slate-500 font-medium">
                  ({venue.reviews?.length || 0} Reviews)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-gold-600" />
              <span>{venue.address}, {venue.city}, {venue.state}</span>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-champagne-200">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Guest Capacity
              </span>
              <span className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gold-600" />
                {venue.capacity_min} - {venue.capacity_max} Guests
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-champagne-200">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Daily Base Rental
              </span>
              <span className="text-base font-bold text-slate-800">
                {formatPrice(venue.price_per_day)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-champagne-200">
              <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Operational Status
              </span>
              <span className="text-base font-bold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Available for Bookings
              </span>
            </div>
          </div>

          {/* Detailed Description */}
          <div className="space-y-3">
            <h3 className="font-serif text-2xl font-bold text-slate-900">
              About This Royal Venue
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {venue.description}
            </p>
          </div>

          {/* Amenities Grid */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-bold text-slate-900">
              Property Amenities & Facilities
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {venue.amenities?.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-ivory-100/70 border border-champagne-200/80 text-xs text-slate-800">
                  <div className="p-1 rounded-full bg-gold-500 text-white">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="font-medium">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="space-y-6 pt-6 border-t border-champagne-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-2xl font-bold text-slate-900">
                  Verified Customer Reviews
                </h3>
                <p className="text-xs text-slate-500">Experiences shared by couples celebrated at {venue.name}</p>
              </div>
              <button
                onClick={() => setReviewModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gold-900 bg-gold-100 hover:bg-gold-200 border border-gold-300 transition-colors"
              >
                Write a Review
              </button>
            </div>

            {venue.reviews?.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No reviews yet. Be the first couple to review this venue!</p>
            ) : (
              <div className="space-y-4">
                {venue.reviews?.map((r) => (
                  <div key={r.id} className="p-5 rounded-2xl bg-white border border-champagne-200/80 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                          alt={r.user_name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-gold-400"
                        />
                        <span className="text-xs font-bold text-slate-800">{r.user_name}</span>
                      </div>
                      <StarRating rating={r.rating} />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed italic">"{r.comment}"</p>
                    <span className="text-[10px] text-slate-400 block">
                      Posted on {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. SIDEBAR: LIVE AVAILABILITY CHECKER & BOOKING CTA */}
        <div className="space-y-6 sticky top-28">
          
          {/* Availability Card */}
          <div className="bg-white rounded-3xl p-6 border border-champagne-300 shadow-xl space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-gold-700 block mb-1">
                Real-Time PostgreSQL Stored Function
              </span>
              <h3 className="font-serif text-2xl font-bold text-slate-900">
                Check Date Availability
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Executes <code className="text-gold-700 bg-gold-50 px-1 py-0.5 rounded">fn_check_venue_availability()</code> to verify double-booking prevention.
              </p>
            </div>

            <form onSubmit={handleCheckAvailability} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Wedding Event Date
                </label>
                <input
                  type="date"
                  value={checkDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500 text-sm bg-ivory-50/50"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={checkingAvailability}
                className="w-full py-3 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 text-gold-400" />
                <span>{checkingAvailability ? 'Querying Database...' : 'Verify Availability'}</span>
              </button>
            </form>

            {/* Availability Result Alert */}
            {availabilityResult && (
              <div className={`p-4 rounded-2xl border text-xs leading-relaxed flex items-start gap-3 ${
                availabilityResult.is_available 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}>
                {availabilityResult.is_available ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block">
                    {availabilityResult.is_available ? 'Available!' : 'Date Unavailable'}
                  </span>
                  <span>{availabilityResult.message}</span>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-champagne-200">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-xs text-slate-500 font-medium">Daily Rental</span>
                <span className="text-2xl font-bold text-slate-900">{formatPrice(venue.price_per_day)}</span>
              </div>

              <button
                onClick={() => {
                  if (checkDate) setBookingDate(checkDate);
                  setBookingModalOpen(true);
                }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-700 hover:to-gold-600 text-white font-bold text-sm shadow-gold-soft transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Book This Royal Venue</span>
              </button>
              
              <p className="text-[11px] text-center text-slate-400 mt-2">
                Protected by PostgreSQL ACID transactions & double-booking prevention trigger.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOOKING WIZARD MODAL */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setBookingSuccess(null);
          setBookingError('');
        }}
        title={`Reserve ${venue.name}`}
      >
        {bookingSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="font-serif text-2xl font-bold text-slate-900">
              Wedding Reservation Confirmed!
            </h4>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your booking reference is <strong className="text-gold-700">{bookingSuccess.booking?.booking_reference}</strong>. 
              The venue availability has been updated in the database.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2.5 rounded-xl bg-gold-600 text-white font-semibold text-xs"
              >
                Go to My Dashboard
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateBooking} className="space-y-4">
            {bookingError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs">
                {bookingError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Wedding Date *
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Guests *
                </label>
                <input
                  type="number"
                  value={guestCount}
                  min={venue.capacity_min}
                  max={venue.capacity_max}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500"
                  required
                />
                <span className="text-[10px] text-slate-400">
                  Capacity range: {venue.capacity_min} - {venue.capacity_max}
                </span>
              </div>
            </div>

            {/* Optional Package Bundle */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Wedding Package (Optional)
              </label>
              <select
                value={selectedPackageId}
                onChange={(e) => setSelectedPackageId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500"
              >
                <option value="">No Package (Venue Rental Only)</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.tier} Tier) - {formatPrice(p.discounted_price || p.base_price)}
                  </option>
                ))}
              </select>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Special Requests & Mandap Specifications
              </label>
              <textarea
                rows={3}
                placeholder="Specific floral preferences, arrival timings, cultural ceremony requests..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500"
              />
            </div>

            {/* Advance Deposit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-champagne-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Advance Deposit Amount (₹)
                </label>
                <input
                  type="number"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500"
                />
                <span className="text-[10px] text-slate-400">Enter ₹0 to reserve as pending</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500"
                >
                  <option value="upi">UPI (Instant Confirmation)</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="net_banking">Net Banking</option>
                  <option value="cash">Bank Wire / Cash</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setBookingModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-champagne-300 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={bookingSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-semibold text-xs shadow-md transition-all"
              >
                {bookingSubmitting ? 'Processing Transaction...' : 'Confirm Reservation'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* 5. REVIEW SUBMISSION MODAL */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`Review ${venue.name}`}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Rating (1 to 5 Stars)
            </label>
            <StarRating
              rating={reviewRating}
              interactive={true}
              size="w-6 h-6"
              onRatingChange={(r) => setReviewRating(r)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Review & Experience
            </label>
            <textarea
              rows={4}
              placeholder="Tell other couples about the hospitality, architecture, and experience..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setReviewModalOpen(false)}
              className="px-5 py-2 rounded-xl border border-champagne-300 text-xs text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reviewSubmitting}
              className="px-6 py-2 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-semibold text-xs"
            >
              {reviewSubmitting ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

