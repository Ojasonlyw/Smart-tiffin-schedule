// ============ frontend/src/components/common/DistanceBadge.jsx ============
import React from 'react';
import { FiMapPin, FiClock } from 'react-icons/fi';
import locationService from '../../services/locationService';

const DistanceBadge = ({ 
  providerLat, 
  providerLng, 
  showTravelTime = true,
  size = 'md',
  className = '' 
}) => {
  if (!locationService.hasUserLocation() || !providerLat || !providerLng) {
    return null;
  }

  const distanceInfo = locationService.getDistanceText(providerLat, providerLng);

  if (!distanceInfo) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const getColorClass = (distance) => {
    if (distance < 2) return 'bg-green-100 text-green-800 border-green-200';
    if (distance < 5) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (distance < 10) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <span
        className={`inline-flex items-center rounded-full border font-medium ${sizeClasses[size]} ${getColorClass(
          distanceInfo.distance
        )}`}
      >
        <FiMapPin className="mr-1 flex-shrink-0" />
        <span>{distanceInfo.formatted} away</span>
      </span>
      
      {showTravelTime && (
        <span
          className={`inline-flex items-center rounded-full border font-medium bg-purple-100 text-purple-800 border-purple-200 ${sizeClasses[size]}`}
        >
          <FiClock className="mr-1 flex-shrink-0" />
          <span>{distanceInfo.travelTime}</span>
        </span>
      )}
    </div>
  );
};

export default DistanceBadge;