// frontend/src/pages/VendorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import StarRating from '../components/StarRating';
import Modal from '../components/Modal';
import { 
  Briefcase, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  BadgeCheck, 
  Clock, 
  Plus, 
  MapPin, 
  User, 
  Phone,
  Sparkles
} from 'lucide-react';

export default function VendorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add Service Modal
  const [addServiceModalOpen, setAddServiceModalOpen] = useState(false);
  const [serviceCatalog, setServiceCatalog] = useState([
    { id: 1, name: 'Royal Multi-Cuisine Feast' },
    { id: 2, name: 'Cocktail & Canapés Live Counter' },
    { id: 3, name: 'Full Wedding Day Candid Photography' },
    { id: 4, name: 'Cinematic 4K Wedding Film & Drone' },
    { id: 5, name: 'Grand Royal Mandap & Stage Decor' },
    { id: 6, name: 'Fairytale Fairy-Light Canopy' },
    { id: 7, name: 'Celebrity Bridal HD Airbrush Makeup' },
    { id: 8, name: 'Family & Bridesmaid Glam Styling' },
    { id: 9, name: 'Sangeet DJ & Concert Stage Rigging' },
    { id: 10, name: 'Live Acoustic Sufi & Fusion Ensemble' },
  ]);
  const [selectedServiceId, setSelectedServiceId] = useState(1);
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [price, setPrice] = useState(25000);
  const [duration, setDuration] = useState(6);
  const [savingService, setSavingService] = useState(false);

  const loadVendorData = async () => {
    try {
      const res = await api.getVendorDashboard();
      if (res.success) setData(res);
    } catch (err) {
      console.error('Failed to load vendor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendorData();
  }, []);

  const handleAddService = async (e) => {
    e.preventDefault();
    setSavingService(true);

    try {
      await api.addVendorService({
        service_id: parseInt(selectedServiceId, 10),
        custom_title: customTitle,
        custom_description: customDesc,
        price: parseFloat(price),
        duration_hours: parseInt(duration, 10),
      });
      setAddServiceModalOpen(false);
      setCustomTitle('');
      setCustomDesc('');
      await loadVendorData();
    } catch (err) {
      alert(err.message || 'Failed to add service.');
    } finally {
      setSavingService(false);
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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-pulse space-y-6">
        <div className="h-40 rounded-3xl bg-champagne-200"></div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 rounded-2xl bg-champagne-200"></div>
          ))}
        </div>
      </div>
    );
  }

  const profile = data?.profile || {};
  const stats = data?.stats || {
    total_orders: 0,
    active_orders: 0,
    completed_orders: 0,
    total_revenue: 0,
    active_services_count: 0,
  };
  const orders = data?.orders || [];
  const services = data?.services || [];
  const reviews = data?.recent_reviews || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* 1. VENDOR HEADER */}
      <div className="bg-gradient-to-r from-charcoal-950 via-charcoal-900 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden border border-gold-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
              Vendor Management Console
            </span>
            {profile.is_verified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                <BadgeCheck className="w-3 h-3" /> Verified Partner
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">
            {profile.business_name || user?.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {profile.description || 'Professional wedding vendor profile'}
          </p>
        </div>

        <button
          onClick={() => setAddServiceModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-700 text-white font-semibold text-xs shadow-gold-soft flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service Offering</span>
        </button>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-champagne-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Assigned Work Orders
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats.total_orders}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block">
            {stats.active_orders} Active Upcoming
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-champagne-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Gross Vendor Earnings
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
            {formatPrice(stats.total_revenue)}
          </div>
          <span className="text-[10px] text-slate-400 block">
            From fulfilled wedding services
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-champagne-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Service Catalog Offerings
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-gold-700">
            {services.length}
          </div>
          <span className="text-[10px] text-gold-600 font-semibold block">
            Listed on marketplace
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-champagne-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Customer Rating
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {profile.rating || 5.0} ★
          </div>
          <span className="text-[10px] text-slate-400 block">
            {reviews.length} Verified Reviews
          </span>
        </div>
      </div>

      {/* 3. ASSIGNED SERVICE WORK ORDERS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-champagne-200 shadow-sm space-y-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Assigned Wedding Orders
          </h2>
          <p className="text-xs text-slate-500">
            Bookings containing your services joined through <code className="text-gold-700">booking_services</code>
          </p>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">No service orders assigned yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-champagne-200 text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Booking Ref</th>
                  <th className="py-3 px-3">Service Ordered</th>
                  <th className="py-3 px-3">Event Date</th>
                  <th className="py-3 px-3">Client Contact</th>
                  <th className="py-3 px-3">Venue</th>
                  <th className="py-3 px-3 text-right">Subtotal</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-champagne-100 text-slate-700">
                {orders.map((o) => (
                  <tr key={o.booking_service_id} className="hover:bg-champagne-50/50">
                    <td className="py-3 px-3 font-mono font-bold text-gold-900">{o.booking_reference}</td>
                    <td className="py-3 px-3">
                      <span className="font-semibold block">{o.custom_title}</span>
                      <span className="text-[10px] text-slate-400">Qty: {o.quantity}</span>
                    </td>
                    <td className="py-3 px-3 font-medium">
                      {new Date(o.service_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold block">{o.customer_name}</span>
                      <span className="text-[10px] text-slate-400">{o.customer_phone}</span>
                    </td>
                    <td className="py-3 px-3">{o.venue_name || 'Private Venue'}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {formatPrice(o.subtotal)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <StatusBadge status={o.service_status || o.booking_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. MY SERVICE OFFERINGS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-champagne-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              My Service Offerings & Pricing
            </h2>
            <p className="text-xs text-slate-500">
              Manage custom pricing and specifications stored in <code className="text-gold-700">vendor_services</code> table
            </p>
          </div>
          <button
            onClick={() => setAddServiceModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gold-100 hover:bg-gold-200 text-gold-900 font-semibold text-xs border border-gold-300 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((s) => (
            <div
              key={s.id}
              className="p-5 rounded-2xl bg-ivory-50 border border-champagne-200 space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-serif text-lg font-bold text-slate-900">{s.custom_title}</h4>
                  <span className="text-[10px] uppercase font-bold text-gold-700 bg-gold-100 px-2 py-0.5 rounded">
                    {s.category || 'Service'}
                  </span>
                </div>
                <span className="text-base font-extrabold text-gold-900">
                  {formatPrice(s.price)}
                </span>
              </div>
              <p className="text-xs text-slate-600 italic">"{s.custom_description || 'Standard offering'}"</p>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-champagne-200 flex justify-between">
                <span>Duration: ~{s.duration_hours} Hours</span>
                <span className="text-emerald-600 font-semibold">Active in Catalog</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Service Modal */}
      <Modal
        isOpen={addServiceModalOpen}
        onClose={() => setAddServiceModalOpen(false)}
        title="Add Service to Your Catalog"
      >
        <form onSubmit={handleAddService} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Base Service *
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500"
            >
              {serviceCatalog.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Custom Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Maharaja Royal Dinner Buffet"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Custom Description
            </label>
            <textarea
              rows={3}
              placeholder="Detailed description of menu items, equipment, or artistic methodology..."
              value={customDesc}
              onChange={(e) => setCustomDesc(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duration (Hours)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setAddServiceModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-champagne-300 text-xs font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingService}
              className="px-6 py-2.5 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-semibold text-xs shadow-md"
            >
              {savingService ? 'Saving...' : 'Add Service'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

