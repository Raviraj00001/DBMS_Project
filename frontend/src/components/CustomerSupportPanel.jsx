import React, { useEffect, useState } from 'react';
import { MessageSquareText, Send } from 'lucide-react';
import { api } from '../services/api';

const initialForm = { subject: '', category: 'general', message: '' };

export default function CustomerSupportPanel() {
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadRequests = async () => {
    try {
      const response = await api.getMySupportRequests();
      setRequests(response.requests || []);
    } catch (err) {
      setError(err.message || 'Could not load your support requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, []);

  const submitRequest = async (event) => {
    event.preventDefault();
    setSending(true);
    setError('');
    setNotice('');
    try {
      await api.createSupportRequest(form);
      setForm(initialForm);
      setNotice('Your request was sent. You can follow its status below.');
      await loadRequests();
    } catch (err) {
      setError(err.message || 'Could not send your request.');
    } finally {
      setSending(false);
    }
  };

  const statusLabel = { open: 'Open', in_review: 'In review', resolved: 'Resolved' };

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 border border-champagne-200 shadow-sm space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquareText className="w-6 h-6 text-gold-600" />
        <div>
          <h3 className="font-serif text-2xl font-bold text-slate-900">Questions & Complaints</h3>
          <p className="text-xs text-slate-500">Send a request to the Wedding Bliss support team and track replies here.</p>
        </div>
      </div>

      <form onSubmit={submitRequest} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          aria-label="Subject"
          maxLength={160}
          required
          placeholder="Subject"
          value={form.subject}
          onChange={(event) => setForm({ ...form, subject: event.target.value })}
          className="px-3 py-2.5 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500"
        />
        <select
          aria-label="Request type"
          value={form.category}
          onChange={(event) => setForm({ ...form, category: event.target.value })}
          className="px-3 py-2.5 text-sm rounded-xl border border-champagne-300 bg-white focus:outline-none focus:border-gold-500"
        >
          <option value="general">General question</option>
          <option value="booking">Booking</option>
          <option value="payment">Payment</option>
          <option value="venue">Venue</option>
          <option value="vendor">Vendor</option>
          <option value="complaint">Complaint</option>
        </select>
        <textarea
          aria-label="Message"
          required
          maxLength={5000}
          rows={3}
          placeholder="Tell us how we can help (up to 5,000 characters)"
          value={form.message}
          onChange={(event) => setForm({ ...form, message: event.target.value })}
          className="md:col-span-2 px-3 py-2.5 text-sm rounded-xl border border-champagne-300 focus:outline-none focus:border-gold-500"
        />
        <div className="md:col-span-2 flex items-center justify-between gap-3">
          <div className="text-xs" role="status">
            {error && <span className="text-rose-700">{error}</span>}
            {notice && <span className="text-emerald-700">{notice}</span>}
          </div>
          <button disabled={sending} className="px-4 py-2.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 disabled:opacity-60 text-white font-semibold text-xs flex items-center gap-2">
            <Send className="w-4 h-4" />{sending ? 'Sending…' : 'Send to Support'}
          </button>
        </div>
      </form>

      <div className="space-y-3">
        <h4 className="text-sm font-bold text-slate-800">Your requests</h4>
        {loading ? <p className="text-xs text-slate-500">Loading requests…</p> : requests.length === 0 ? (
          <p className="text-xs text-slate-500">You have not sent a request yet.</p>
        ) : requests.map((request) => (
          <article key={request.id} className="p-4 rounded-2xl bg-ivory-50 border border-champagne-200 space-y-2">
            <div className="flex flex-wrap justify-between gap-2">
              <h5 className="text-sm font-semibold text-slate-900">{request.subject}</h5>
              <span className="text-[11px] font-semibold text-gold-800">{statusLabel[request.status]}</span>
            </div>
            <p className="text-xs text-slate-600 whitespace-pre-wrap">{request.message}</p>
            {request.admin_response && <p className="text-xs text-emerald-800 border-t border-champagne-200 pt-2"><b>Support reply:</b> {request.admin_response}</p>}
            <p className="text-[10px] text-slate-400">{new Date(request.created_at).toLocaleString()}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
