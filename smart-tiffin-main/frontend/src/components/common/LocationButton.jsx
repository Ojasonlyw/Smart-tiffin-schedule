// ============ frontend/src/components/common/LocationButton.jsx ============
import React, { useState, useEffect } from 'react';
import { FiMapPin, FiNavigation, FiX } from 'react-icons/fi';
import Button from './Button';
import locationService from '../../services/locationService';
import { toast } from 'react-toastify';

const LocationButton = ({ onLocationChange }) => {
  const [hasLocation, setHasLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationText, setLocationText] = useState('');

  useEffect(() => {
    const userLocation = locationService.getUserLocation();
    if (userLocation) {
      setHasLocation(true);
      loadLocationText(userLocation.lat, userLocation.lng);
    }
  }, []);

  const loadLocationText = async (lat, lng) => {
    try {
      const result = await locationService.reverseGeocode(lat, lng);
      // Extract city from address components
      const city = result.addressComponents.find(
        (comp) => comp.types.includes('locality')
      )?.long_name || 'Current Location';
      setLocationText(city);
    } catch (error) {
      setLocationText('Current Location');
    }
  };

  const handleGetLocation = async () => {
    setLoading(true);
    try {
      const location = await locationService.getCurrentLocation();
      setHasLocation(true);
      await loadLocationText(location.lat, location.lng);
      
      if (onLocationChange) {
        onLocationChange(location);
      }
      
      toast.success('Location updated successfully!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearLocation = () => {
    locationService.clearUserLocation();
    setHasLocation(false);
    setLocationText('');
    
    if (onLocationChange) {
      onLocationChange(null);
    }
    
    toast.info('Location cleared');
  };

  if (hasLocation) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center px-3 py-2 bg-primary-50 text-primary-700 rounded-lg border border-primary-200">
          <FiMapPin className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">{locationText}</span>
        </div>
        <button
          onClick={handleClearLocation}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Clear location"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleGetLocation}
      loading={loading}
    >
      <FiNavigation className="mr-2" />
      Enable Location
    </Button>
  );
};

export default LocationButton;