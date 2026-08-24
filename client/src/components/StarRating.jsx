import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ value = 0, onChange, readOnly = false, size = 'md' }) {
  const [hoverValue, setHoverValue] = useState(null);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const displayRating = hoverValue !== null ? hoverValue : (value || 0);

  const handleMouseMove = (e, starIndex) => {
    if (readOnly) return;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - left) / width;
    const ratingVal = starIndex + (percent < 0.5 ? 0.5 : 1.0);
    setHoverValue(ratingVal);
  };

  const handleClick = () => {
    if (readOnly || !onChange) return;
    if (hoverValue !== null) {
      onChange(hoverValue);
    }
  };

  return (
    <div 
      className="inline-flex items-center gap-1 cursor-pointer select-none"
      onMouseLeave={() => !readOnly && setHoverValue(null)}
    >
      {[0, 1, 2, 3, 4].map((starIndex) => {
        const starNumber = starIndex + 1;
        const isFull = displayRating >= starNumber;
        const isHalf = displayRating >= starIndex + 0.5 && displayRating < starNumber;

        return (
          <div
            key={starIndex}
            className="relative transition-transform hover:scale-110"
            onMouseMove={(e) => handleMouseMove(e, starIndex)}
            onClick={handleClick}
          >
            {/* Background Star */}
            <Star className={`${starSizes[size]} text-slate-700 fill-slate-800`} />

            {/* Filled / Half Filled Overlay */}
            {(isFull || isHalf) && (
              <div 
                className="absolute top-0 left-0 overflow-hidden pointer-events-none text-amber-400"
                style={{ width: isHalf ? '50%' : '100%' }}
              >
                <Star className={`${starSizes[size]} fill-amber-400 text-amber-400`} />
              </div>
            )}
          </div>
        );
      })}

      {displayRating > 0 && (
        <span className="ml-1 text-xs font-bold text-amber-400">
          {Number(displayRating).toFixed(1)}
        </span>
      )}
    </div>
  );
}
