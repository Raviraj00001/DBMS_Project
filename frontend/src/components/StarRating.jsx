// frontend/src/components/StarRating.jsx
import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 5, max = 5, size = 'w-4 h-4', interactive = false, onRatingChange }) {
  const stars = [];
  const numericRating = parseFloat(rating) || 0;

  for (let i = 1; i <= max; i++) {
    const isFilled = i <= Math.round(numericRating);
    stars.push(
      <Star
        key={i}
        onClick={() => interactive && onRatingChange && onRatingChange(i)}
        className={`${size} ${
          isFilled ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
        } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
      />
    );
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">{stars}</div>
      {!interactive && (
        <span className="text-xs font-semibold text-slate-700 ml-1">
          {numericRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

