// ============ src/components/common/Card.jsx ============
import React from 'react';

const Card = ({ children, className = '', hover = false, onClick }) => {
  const hoverClass = hover ? 'hover:shadow-xl hover:scale-105 cursor-pointer' : '';
  
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md p-6 transition-all duration-300 ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;