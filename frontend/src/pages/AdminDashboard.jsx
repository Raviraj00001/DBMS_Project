// frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { 
  ShieldCheck, 
  Users, 
  MapPin, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  BadgeCheck, 
  Plus, 
  Sparkles, 
  Layers, 
  TrendingUp,
  FileSpreadsheet,
  GitBranch,
  Trash2,
  MessageSquareText,
} from 'lucide-react';

export default function AdminDashboard() {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Venue Modal
  const [venueModalOpen, setVenueModalOpen] = useState(false);
  const [venueName, setVenueName] = useState('');
  const [venueDesc, setVenueDesc] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [venueCity, setVenueCity] = useState('Jaipur');
  const [venueState, setVenueState] = useState('Rajasthan');
  const [capMin, setCapMin] = useState(150);
  const [capMax, setCapMax] = useState(1000);
  const [pricePerDay, setPricePerDay] = useState(250000);
  const [venueType, setVenueType] = useState('palace');
  const [creatingVenue, setCreatingVenue] = useState(false);
  const [managedVenues, setManagedVenues] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);
  const [supportDrafts, setSupportDrafts] = useState({});

  const loadAdminData = async () => {
    try {
      const res = await api.getAdminDashboard();
      if (res.success) setAdminData(res);
      const [venueResult, supportResult] = await Promise.allSettled([
        api.getAdminVenues(),
        api.getAdminSupportRequests(),
      ]);
      if (venueResult.status === 'fulfilled') setManagedVenues(venueResult.value.venues || []);
      if (supportResult.status === 'fulfilled') {
        const requests = supportResult.value.requests || [];
        setSupportRequests(requests);
        setSupportDrafts((current) => {
          const next = { ...current };
          requests.forEach((item) => {
            if (!next[item.id]) next[item.id] = { status: item.status, admin_response: item.admin_response || '' };
          });
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.updateBookingStatus(bookingId, newStatus);
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Status update failed.');
    }
  };

  const handleVerifyVendor = async (vendorId, status) => {
    try {
      await api.verifyVendor(vendorId, status);
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Verification update failed.');
    }
  };

  const handleRemoveVendor = async (vendor) => {
    if (!window.confirm(`Remove ${vendor.business_name} from the marketplace? Its booking history will be retained.`)) return;
    try {
      await api.removeVendor(vendor.vendor_id);
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to remove vendor.');
    }
  };

  const handleDeleteVenue = async (venue) => {
    if (!window.confirm(`Delete venue “${venue.name}”? Existing bookings will remain, but venue reviews and availability records will be deleted.`)) return;
    try {
      await api.deleteVenue(venue.id);
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete venue.');
    }
  };

  const handleSaveSupportRequest = async (requestId) => {
    const draft = supportDrafts[requestId];
    try {
      await api.updateSupportRequest(requestId, draft);
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update customer request.');
    }
  };

  const handleCreateVenue = async (e) => {
    e.preventDefault();
    setCreatingVenue(true);

    try {
      await api.createVenue({
        name: venueName,
        description: venueDesc,
        address: venueAddress,
        city: venueCity,
        state: venueState,
        capacity_min: parseInt(capMin, 10),
        capacity_max: parseInt(capMax, 10),
        price_per_day: parseFloat(pricePerDay),
        venue_type: venueType,
        image_urls: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200'],
        amenities: ['Valet Parking', 'Bridal Dressing Suite', 'Central AC', 'Power Backup'],
      });
      setVenueModalOpen(false);
      await loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to create venue.');
    } finally {
      setCreatingVenue(false);
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

  const kpi = adminData?.kpi || {
    total_customers: 0,
    total_vendors: 0,
    total_venues: 0,
    total_bookings: 0,
    total_platform_revenue: 0,
    pending_vendor_verifications: 0,
  };

  const recentBookings = adminData?.recent_bookings || [];
  const monthlyRevenue = adminData?.monthly_revenue_trend || [];
  const topVendors = adminData?.top_vendors || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* 1. ADMIN HEADER */}
      <div className="bg-gradient-to-r from-charcoal-950 via-charcoal-900 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden border border-gold-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
              System Administration Console
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gold-500/20 text-gold-300 border border-gold-400/30">
              PostgreSQL 3NF Superuser
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">
            Platform Master Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Engineered by Ravi Raj, Manpreet, Perirt, and Raj Tripathi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setVenueModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 shadow-sm flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Post a New Venue</span>
          </button>
        </div>
      </div>

      {/* 2. PLATFORM KPIS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-champagne-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Revenue
          </span>
          <div className="text-2xl font-extrabold text-emerald-700">
            {formatPrice(kpi.total_platform_revenue)}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block">
            From verified payments
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-champagne-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Bookings
          </span>
          <div className="text-2xl font-extrabold text-slate-900">
            {kpi.total_bookings}
          </div>
          <span className="text-[10px] text-slate-400 block">
            Across all venue tiers
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-champagne-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Customers
          </span>
          <div className="text-2xl font-extrabold text-slate-900">
            {kpi.total_customers}
          </div>
          <span className="text-[10px] text-slate-400 block">
            Registered accounts
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-champagne-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Partner Vendors
          </span>
          <div className="text-2xl font-extrabold text-slate-900">
            {kpi.total_vendors}
          </div>
          <span className="text-[10px] text-gold-700 font-semibold block">
            {kpi.pending_vendor_verifications} Pending Approval
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-champagne-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Registered Venues
          </span>
          <div className="text-2xl font-extrabold text-slate-900">
            {kpi.total_venues}
          </div>
          <span className="text-[10px] text-slate-400 block">
            Active destinations
          </span>
        </div>
      </div>

      {/* 3. MASTER BOOKINGS MANAGER TABLE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-champagne-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              Master Bookings Manager
            </h2>
            <p className="text-xs text-slate-500">
              Live records from <code className="text-gold-700">view_booking_details</code>
            </p>
          </div>
          <FileSpreadsheet className="w-6 h-6 text-gold-600" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-champagne-200 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Booking Ref</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Venue</th>
                <th className="py-3 px-3">Wedding Date</th>
                <th className="py-3 px-3">Total Amount</th>
                <th className="py-3 px-3">Paid Amount</th>
                <th className="py-3 px-3">Current Status</th>
                <th className="py-3 px-3 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-champagne-100 text-slate-700">
              {recentBookings.map((b) => (
                <tr key={b.booking_id} className="hover:bg-champagne-50/50">
                  <td className="py-3 px-3 font-mono font-bold text-gold-900">{b.booking_reference}</td>
                  <td className="py-3 px-3 font-semibold">{b.customer_name}</td>
                  <td className="py-3 px-3">{b.venue_name || 'Bespoke Private'}</td>
                  <td className="py-3 px-3">{new Date(b.wedding_date).toLocaleDateString()}</td>
                  <td className="py-3 px-3 font-bold">{formatPrice(b.total_amount)}</td>
                  <td className="py-3 px-3 font-bold text-emerald-700">{formatPrice(b.paid_amount)}</td>
                  <td className="py-3 px-3">
                    <StatusBadge status={b.booking_status} />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <select
                      value={b.booking_status}
                      onChange={(e) => handleStatusChange(b.booking_id, e.target.value)}
                      className="px-2 py-1 text-xs rounded-lg border border-champagne-300 focus:outline-none focus:border-gold-500 bg-white"
                    >
                      <option value="pending">pending</option>
                      <option value="confirmed">confirmed</option>
                      <option value="completed">completed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. VENDOR VERIFICATION & REVENUE BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Vendor Verifications */}
        <div className="bg-white rounded-3xl p-6 border border-champagne-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-slate-900">
              Vendor Analytics & Verification
            </h3>
            <BadgeCheck className="w-5 h-5 text-gold-600" />
          </div>

          <div className="space-y-3">
            {topVendors.map((v) => (
              <div key={v.vendor_id} className="p-3.5 rounded-2xl bg-ivory-50 border border-champagne-200 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{v.business_name}</span>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">{v.category} • {v.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-700">{formatPrice(v.total_vendor_earnings)}</span>
                  {v.is_verified ? (
                    <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                      Verified
                    </span>
                  ) : (
                    <button
                      onClick={() => handleVerifyVendor(v.vendor_id, true)}
                      className="px-3 py-1 rounded-lg bg-gold-600 hover:bg-gold-700 text-white font-semibold text-[11px]"
                    >
                      Verify
                    </button>
                  )}
                  <button
                    type="button"
                    title={`Remove ${v.business_name}`}
                    aria-label={`Remove ${v.business_name}`}
                    onClick={() => handleRemoveVendor(v)}
                    className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Revenue Trend */}
        <div className="bg-white rounded-3xl p-6 border border-champagne-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-slate-900">
              Monthly Platform Revenue (View)
            </h3>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-champagne-200 text-slate-400 uppercase">
                  <th className="py-2 px-3">Billing Month</th>
                  <th className="py-2 px-3">Transactions</th>
                  <th className="py-2 px-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-champagne-100 text-slate-700">
                {monthlyRevenue.map((m, idx) => (
                  <tr key={idx} className="hover:bg-champagne-50/50">
                    <td className="py-2.5 px-3 font-semibold">{m.payment_month}</td>
                    <td className="py-2.5 px-3">{m.total_transactions} verified txns</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                      {formatPrice(m.monthly_revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Venue management and customer support inbox */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section className="bg-white rounded-3xl p-6 border border-champagne-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-slate-900">Manage Venues</h3>
              <p className="text-xs text-slate-500">Post a new venue above or remove an active listing.</p>
            </div>
            <MapPin className="w-5 h-5 text-gold-600" />
          </div>
          <div className="space-y-2 max-h-[28rem] overflow-y-auto">
            {managedVenues.length === 0 ? <p className="text-xs text-slate-500">No active venues found.</p> : managedVenues.map((venue) => (
              <div key={venue.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-ivory-50 border border-champagne-200">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{venue.name}</p>
                  <p className="text-[10px] text-slate-500">{venue.city}, {venue.state} · {formatPrice(venue.price_per_day)} / day</p>
                </div>
                <button type="button" onClick={() => handleDeleteVenue(venue)} className="shrink-0 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-semibold flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-3xl p-6 border border-champagne-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-slate-900">Customer Questions & Complaints</h3>
              <p className="text-xs text-slate-500">Review requests, reply, and update their status.</p>
            </div>
            <MessageSquareText className="w-5 h-5 text-gold-600" />
          </div>
          <div className="space-y-3 max-h-[34rem] overflow-y-auto">
            {supportRequests.length === 0 ? <p className="text-xs text-slate-500">No customer requests yet.</p> : supportRequests.map((request) => {
              const draft = supportDrafts[request.id] || { status: request.status, admin_response: request.admin_response || '' };
              return (
                <article key={request.id} className="p-3 rounded-xl bg-ivory-50 border border-champagne-200 space-y-2">
                  <div className="flex flex-wrap justify-between gap-1">
                    <p className="text-xs font-bold text-slate-900">{request.subject}</p>
                    <span className="text-[10px] text-gold-800 font-semibold">{request.customer_name} · {request.customer_email}</span>
                  </div>
                  <p className="text-[10px] uppercase font-bold tracking-wide text-slate-500">{request.category} · {new Date(request.created_at).toLocaleString()}</p>
                  <p className="text-xs text-slate-700 whitespace-pre-wrap">{request.message}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-[9rem_1fr_auto] gap-2">
                    <select value={draft.status} onChange={(event) => setSupportDrafts((prev) => ({ ...prev, [request.id]: { ...draft, status: event.target.value } }))} className="px-2 py-2 rounded-lg border border-champagne-300 bg-white text-xs">
                      <option value="open">Open</option><option value="in_review">In review</option><option value="resolved">Resolved</option>
                    </select>
                    <textarea rows={2} value={draft.admin_response} onChange={(event) => setSupportDrafts((prev) => ({ ...prev, [request.id]: { ...draft, admin_response: event.target.value } }))} placeholder="Reply to customer" className="px-2 py-2 rounded-lg border border-champagne-300 text-xs" />
                    <button type="button" onClick={() => handleSaveSupportRequest(request.id)} className="px-3 py-2 rounded-lg bg-charcoal-900 text-white text-[11px] font-semibold">Save</button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      {/* Add Venue Modal */}
      <Modal
        isOpen={venueModalOpen}
        onClose={() => setVenueModalOpen(false)}
        title="Add Royal Destination Venue"
      >
        <form onSubmit={handleCreateVenue} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Venue Name *
            </label>
            <input
              type="text"
              placeholder="e.g. The Imperial Samode Palace"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description *
            </label>
            <textarea
              rows={3}
              placeholder="Architectural style, scenic features, courtyards..."
              value={venueDesc}
              onChange={(e) => setVenueDesc(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                value={venueCity}
                onChange={(e) => setVenueCity(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
              <input
                type="text"
                value={venueState}
                onChange={(e) => setVenueState(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Address *</label>
            <input
              type="text"
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Min Guests</label>
              <input
                type="number"
                value={capMin}
                onChange={(e) => setCapMin(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Guests</label>
              <input
                type="number"
                value={capMax}
                onChange={(e) => setCapMax(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rental (₹/Day)</label>
              <input
                type="number"
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Venue Type</label>
            <select
              value={venueType}
              onChange={(e) => setVenueType(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500"
            >
              <option value="palace">Palace</option>
              <option value="lawn">Lawn</option>
              <option value="resort">Resort</option>
              <option value="beachside">Beachside</option>
              <option value="banquet_hall">Banquet Hall</option>
              <option value="hotel">Hotel</option>
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setVenueModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-champagne-300 text-xs font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingVenue}
              className="px-6 py-2.5 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-semibold text-xs shadow-md"
            >
              {creatingVenue ? 'Saving Venue...' : 'Create Venue'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

