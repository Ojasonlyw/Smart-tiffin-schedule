// ============ frontend/src/components/provider/ProviderCard.jsx - UPDATED WITH DISTANCE ============
import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiStar, FiHeart } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatters';
import Card from '../common/Card';
import Badge from '../common/Badge';
import DistanceBadge from '../common/DistanceBadge';

const ProviderCard = ({ provider, onFavoriteToggle }) => {
  return (
    <Card hover className="relative">
      <button
        onClick={() => onFavoriteToggle(provider._id)}
        className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors z-10"
      >
        <FiHeart className="h-5 w-5 text-red-500" />
      </button>

      <Link to={`/providers/${provider._id}`}>
        <div className="aspect-w-16 aspect-h-9 mb-4 rounded-lg overflow-hidden">
          <img
            src={provider.coverImage || 'https://via.placeholder.com/400x300'}
            alt={provider.businessName}
            className="w-full h-48 object-cover"
          />
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {provider.businessName}
        </h3>

        <div className="flex items-center text-sm text-gray-600 mb-2">
          <FiMapPin className="h-4 w-4 mr-1" />
          <span>{provider.address.city}, {provider.address.state}</span>
        </div>

        {/* Distance Badge */}
        {provider.address?.coordinates?.lat && provider.address?.coordinates?.lng && (
          <div className="mb-3">
            <DistanceBadge
              providerLat={provider.address.coordinates.lat}
              providerLng={provider.address.coordinates.lng}
              showTravelTime={true}
              size="sm"
            />
          </div>
        )}

        <div className="flex items-center mb-3">
          <FiStar className="h-4 w-4 text-yellow-500 mr-1" />
          <span className="text-sm font-medium text-gray-900">
            {provider.ratings.average.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500 ml-1">
            ({provider.ratings.count} reviews)
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {provider.cuisines.slice(0, 3).map((cuisine, index) => (
            <Badge key={index} variant="primary" size="sm">
              {cuisine}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {provider.specialties.slice(0, 2).map((specialty, index) => (
            <Badge key={index} variant="success" size="sm">
              {specialty}
            </Badge>
          ))}
        </div>

        <div className="border-t pt-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Starting from</p>
              <p className="text-lg font-bold text-primary-600">
                {formatCurrency(provider.pricing.daily.breakfast || 0)}/meal
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Subscribers</p>
              <p className="text-lg font-semibold text-gray-900">
                {provider.totalSubscribers}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default ProviderCard;