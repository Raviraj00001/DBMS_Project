// frontend/src/components/Modal.jsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className={`bg-white rounded-2xl shadow-2xl border border-champagne-200 w-full ${maxWidth} overflow-hidden transform transition-all animate-in fade-in zoom-in-95`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-champagne-100 flex items-center justify-between bg-ivory-100/50">
          <h3 className="font-serif text-xl font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-champagne-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

