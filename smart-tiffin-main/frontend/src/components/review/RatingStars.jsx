// ============ src/components/review/RatingStars.jsx ============
import React from 'react';
import { FiStar } from 'react-icons/fi';

const RatingStars = ({ rating, count, size = 'md', showCount = true }) => {
  const sizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className="flex items-center">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`${sizes[size]} ${
              star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      {showCount && count !== undefined && (
        <span className="ml-2 text-sm text-gray-600">({count})</span>
      )}
    </div>
  );
};

export default RatingStars;