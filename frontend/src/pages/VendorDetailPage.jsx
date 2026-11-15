// frontend/src/pages/VendorDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import Modal from '../components/Modal';
import { 
  BadgeCheck, 
  MapPin, 
  Briefcase, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function VendorDetailPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    async function loadVendor() {
      try {
        const res = await api.getVendorById(id);
        if (res.vendor) setVendor(res.vendor);
      } catch (err) {
        console.error('Error fetching vendor:', err);
      } finally {
        setLoading(false);
      }
    }
    loadVendor();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please sign in to post a review.');
      return;
    }

    setReviewSubmitting(true);
    try {
      await api.createReview({
        vendor_id: parseInt(id, 10),
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewModalOpen(false);
      const freshRes = await api.getVendorById(id);
      setVendor(freshRes.vendor);
    } catch (err) {
      alert(err.message || 'Review failed to submit');
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
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse text-center">
        <div className="h-64 rounded-3xl bg-champagne-200 mb-6"></div>
        <div className="h-8 w-60 bg-champagne-200 mx-auto rounded"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-3xl font-bold text-slate-800">Vendor Not Found</h2>
        <Link to="/vendors" className="px-5 py-2.5 rounded-xl bg-gold-600 text-white font-semibold text-xs">
          Back to Vendors
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl p-8 border border-champagne-200 shadow-md grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        <div className="md:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-gold-100 text-gold-900 border border-gold-300 uppercase tracking-wider">
              {vendor.category?.replace('_', ' ')}
            </span>
            {vendor.is_verified && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Wedding Vendor</span>
              </span>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
            {vendor.business_name}
          </h1>

          <div className="flex items-center gap-3">
            <StarRating rating={vendor.rating} />
            <span className="text-xs text-slate-500 font-medium">
              ({vendor.reviews?.length || 0} Verified Reviews)
            </span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
            {vendor.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-champagne-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold-600" />
              <span>{vendor.address}, {vendor.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gold-600" />
              <span>{vendor.experience_years} Years Industry Experience</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gold-600" />
              <span>{vendor.phone}</span>
            </div>
          </div>
        </div>

        {/* Starting Price Card */}
        <div className="bg-ivory-100/70 p-6 rounded-2xl border border-champagne-300 space-y-4 text-center">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Starting Package Rate
          </span>
          <div className="text-3xl font-extrabold text-slate-900">
            {formatPrice(vendor.starting_price)}
          </div>
          <p className="text-xs text-slate-500">
            Customizable packages available. You can add these services during venue reservation.
          </p>
          <button
            onClick={() => setReviewModalOpen(true)}
            className="w-full py-2.5 rounded-xl border border-gold-400 text-xs font-semibold text-gold-900 bg-white hover:bg-gold-50 transition-colors"
          >
            Review This Vendor
          </button>
        </div>
      </div>

      {/* Services Catalog */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-700 block mb-1">
            Menu & Service Line-up
          </span>
          <h2 className="font-serif text-3xl font-bold text-slate-900">
            Services Offered by {vendor.business_name}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vendor.services?.map((service) => (
            <div
              key={service.vendor_service_id}
              className="bg-white p-6 rounded-2xl border border-champagne-200/90 shadow-sm hover:border-gold-400 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-serif text-xl font-bold text-slate-900">
                    {service.custom_title}
                  </h3>
                  <span className="text-lg font-extrabold text-gold-800">
                    {formatPrice(service.price)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {service.custom_description || service.base_service_name}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-champagne-100">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gold-600" />
                  <span>Duration: ~{service.duration_hours} Hours</span>
                </span>
                <span className="text-[11px] font-semibold text-emerald-600">
                  Available for Wedding Booking
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-6 pt-6 border-t border-champagne-200">
        <h2 className="font-serif text-3xl font-bold text-slate-900">
          Client Feedback & Testimonials
        </h2>

        {vendor.reviews?.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No reviews yet for this vendor.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendor.reviews?.map((r) => (
              <div key={r.id} className="p-5 rounded-2xl bg-white border border-champagne-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{r.user_name}</span>
                  <StarRating rating={r.rating} />
                </div>
                <p className="text-xs text-slate-600 italic">"{r.comment}"</p>
                <span className="text-[10px] text-slate-400 block">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`Review ${vendor.business_name}`}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rating
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
              Your Review
            </label>
            <textarea
              rows={4}
              placeholder="Describe your experience with this vendor's services and professionalism..."
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
              {reviewSubmitting ? 'Posting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

