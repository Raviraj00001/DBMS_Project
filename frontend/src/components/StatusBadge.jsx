// frontend/src/components/StatusBadge.jsx
import React from 'react';

export default function StatusBadge({ status, type = 'booking' }) {
  const getBadgeStyle = () => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'cancelled':
      case 'failed':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'refunded':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle()} capitalize`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {status || 'Unknown'}
    </span>
  );
}

