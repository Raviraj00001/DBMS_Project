// frontend/src/pages/CustomerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import CustomerSupportPanel from '../components/CustomerSupportPanel';
import { 
  Calendar, 
  MapPin, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  Receipt, 
  ArrowRight, 
  XCircle,
  FileText
} from 'lucide-react';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Payment Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('upi');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');

  const loadData = async () => {
    try {
      const res = await api.getCustomerDashboard();
      if (res.success) setDashboardData(res);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePayInstallment = (booking) => {
    setSelectedBooking(booking);
    const balance = parseFloat(booking.total_amount) - parseFloat(booking.paid_amount);
    setPayAmount(balance > 0 ? balance : 10000);
    setPaymentModalOpen(true);
    setPayError('');
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setPaying(true);
    setPayError('');

    try {
      await api.recordPayment({
        booking_id: selectedBooking.id,
        amount: parseFloat(payAmount),
        payment_method: payMethod,
        notes: `Installment via ${payMethod.toUpperCase()}`,
      });
      setPaymentModalOpen(false);
      await loadData();
    } catch (err) {
      setPayError(err.message || 'Payment processing failed.');
    } finally {
      setPaying(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? The venue reservation will be released.')) {
      return;
    }

    try {
      await api.cancelBooking(bookingId);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to cancel booking.');
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

  const stats = dashboardData?.stats || {
    total_bookings: 0,
    confirmed_bookings: 0,
    total_committed_amount: 0,
    total_paid_amount: 0,
    total_balance_due: 0,
  };

  const upcomingEvents = dashboardData?.upcoming_events || [];
  const recentPayments = dashboardData?.recent_payments || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* 1. WELCOME GREETING BANNER */}
      <div className="bg-gradient-to-r from-charcoal-950 via-charcoal-900 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden border border-gold-500/30 shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
              Customer Portal • Live PostgreSQL Database
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold">
              Welcome, {user?.full_name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Track your royal wedding reservations, monitor payment balances, and organize bespoke event services.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/venues"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-700 text-white font-semibold text-xs shadow-gold-soft flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore New Venues</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. LIVE STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-champagne-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Bookings
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {stats.total_bookings}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block">
            {stats.confirmed_bookings} Confirmed Events
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-champagne-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Contract Value
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {formatPrice(stats.total_committed_amount)}
          </div>
          <span className="text-[10px] text-slate-400 block">
            Total for all reserved weddings
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-champagne-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Settled / Paid Amount
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
            {formatPrice(stats.total_paid_amount)}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block">
            Verified in Payments table
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-champagne-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Remaining Due Balance
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-gold-700">
            {formatPrice(stats.total_balance_due)}
          </div>
          <span className="text-[10px] text-gold-600 font-semibold block">
            Payable in milestones
          </span>
        </div>
      </div>

      {/* 3. MY WEDDING RESERVATIONS */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              My Wedding Reservations
            </h2>
            <p className="text-xs text-slate-500">Active events booked with venues and bundled wedding packages</p>
          </div>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-champagne-200 space-y-4">
            <Calendar className="w-12 h-12 text-gold-400 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-slate-800">No Reservations Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't reserved any wedding venues yet. Select your dream destination and celebrate in style.
            </p>
            <Link
              to="/venues"
              className="inline-block px-5 py-2.5 rounded-xl bg-gold-600 text-white font-semibold text-xs"
            >
              Browse Luxury Venues
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((booking) => {
              const balance = parseFloat(booking.total_amount) - parseFloat(booking.paid_amount);
              const progressPct = booking.total_amount > 0 
                ? Math.min(100, Math.round((booking.paid_amount / booking.total_amount) * 100))
                : 0;

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-champagne-200 shadow-sm hover:border-gold-400 transition-all space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-champagne-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gold-100 text-gold-800 flex items-center justify-center font-bold">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-gold-900 bg-gold-100/60 px-2.5 py-0.5 rounded-md">
                            {booking.booking_reference}
                          </span>
                          <StatusBadge status={booking.status} />
                        </div>
                        <h3 className="font-serif text-xl font-bold text-slate-900 mt-1">
                          {booking.venue_name || 'Bespoke Private Venue'}
                        </h3>
                      </div>
                    </div>

                    <div className="text-right sm:text-right">
                      <span className="text-xs text-slate-500 block">Wedding Date</span>
                      <span className="text-sm font-bold text-slate-900">
                        {new Date(booking.wedding_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      {booking.days_left !== undefined && (
                        <span className="text-[11px] text-gold-700 font-semibold block">
                          ⏳ in {booking.days_left} Days
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Financial Breakdown & Progress */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Invited Guests</span>
                      <span className="text-sm font-bold text-slate-800">{booking.guest_count} Pax</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Selected Package</span>
                      <span className="text-sm font-bold text-slate-800">{booking.package_name || 'Custom Package'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Total Cost</span>
                      <span className="text-sm font-bold text-slate-800">{formatPrice(booking.total_amount)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Balance Pending</span>
                      <span className="text-sm font-bold text-rose-600">{formatPrice(balance)}</span>
                    </div>
                  </div>

                  {/* Payment Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                      <span>Payment Milestone Progress</span>
                      <span>{progressPct}% Settled ({formatPrice(booking.paid_amount)})</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-champagne-200 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-gold-600 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-champagne-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {balance > 0 && booking.status !== 'cancelled' && (
                        <button
                          onClick={() => handlePayInstallment(booking)}
                          className="px-4 py-2 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Installment</span>
                        </button>
                      )}
                      {booking.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold text-xs transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400">
                      ID: #{booking.id} • Automated by trigger: <code className="text-gold-700">fn_process_payment_update()</code>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. RECENT PAYMENT RECEIPTS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-champagne-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-2xl font-bold text-slate-900">
              Payment Transactions & Receipts
            </h3>
            <p className="text-xs text-slate-500">Live transaction records from the PostgreSQL payments table</p>
          </div>
          <Receipt className="w-6 h-6 text-gold-600" />
        </div>

        {recentPayments.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No payments recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-champagne-200 text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Txn Reference</th>
                  <th className="py-2.5 px-3">Booking Ref</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-champagne-100 text-slate-700">
                {recentPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-champagne-50/50">
                    <td className="py-3 px-3 font-mono font-semibold text-gold-900">{p.transaction_reference}</td>
                    <td className="py-3 px-3 font-semibold">{p.booking_reference}</td>
                    <td className="py-3 px-3 uppercase text-[10px] font-bold text-slate-500">{p.payment_method}</td>
                    <td className="py-3 px-3">{new Date(p.payment_date).toLocaleDateString()}</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-700">{formatPrice(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CustomerSupportPanel />

      {/* Payment Processing Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={`Payment for ${selectedBooking?.booking_reference}`}
      >
        <form onSubmit={handleProcessPayment} className="space-y-4">
          {payError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs">
              {payError}
            </div>
          )}

          <div className="p-4 rounded-2xl bg-ivory-100/70 border border-champagne-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Venue:</span>
              <span className="font-semibold text-slate-800">{selectedBooking?.venue_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Contract:</span>
              <span className="font-semibold text-slate-800">{formatPrice(selectedBooking?.total_amount)}</span>
            </div>
            <div className="flex justify-between font-bold text-gold-900 pt-1 border-t border-champagne-200">
              <span>Remaining Balance:</span>
              <span>{formatPrice(parseFloat(selectedBooking?.total_amount) - parseFloat(selectedBooking?.paid_amount))}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Amount (₹) *
            </label>
            <input
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Payment Method *
            </label>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500"
            >
              <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="net_banking">Net Banking</option>
              <option value="cash">Bank Wire / Cash</option>
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setPaymentModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-champagne-300 text-xs font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={paying}
              className="px-6 py-2.5 rounded-xl bg-gold-600 hover:bg-gold-700 text-white font-semibold text-xs shadow-md transition-all"
            >
              {paying ? 'Processing...' : 'Authorize Payment'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}

