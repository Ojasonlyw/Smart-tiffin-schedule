// ============ frontend/src/components/common/LocationPicker.jsx ============
import React, { useState, useEffect } from 'react';
import { FiMapPin, FiNavigation, FiSearch } from 'react-icons/fi';
import Input from './Input';
import Button from './Button';
import locationService from '../../services/locationService';
import { toast } from 'react-toastify';

const LocationPicker = ({ value, onChange, label = 'Location', required = false }) => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [coordinates, setCoordinates] = useState(value || { lat: null, lng: null });
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (value?.lat && value?.lng) {
      setCoordinates(value);
      // Reverse geocode to get address
      loadAddress(value.lat, value.lng);
    }
  }, [value]);

  const loadAddress = async (lat, lng) => {
    try {
      const result = await locationService.reverseGeocode(lat, lng);
      setAddress(result.formattedAddress);
    } catch (error) {
      console.error('Failed to load address:', error);
    }
  };

  const handleGetCurrentLocation = async () => {
    setLoading(true);
    try {
      const location = await locationService.getCurrentLocation();
      setCoordinates(location);
      onChange(location);
      
      // Get address for display
      const result = await locationService.reverseGeocode(location.lat, location.lng);
      setAddress(result.formattedAddress);
      
      toast.success('Location detected successfully!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter an address to search');
      return;
    }

    setLoading(true);
    try {
      const result = await locationService.geocodeAddress(searchQuery);
      setCoordinates({ lat: result.lat, lng: result.lng });
      setAddress(result.formattedAddress);
      onChange({ lat: result.lat, lng: result.lng });
      toast.success('Location found!');
      setSearchQuery(''); // Clear search after success
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error(error.message || 'Failed to find location. Please try a more specific address (e.g., "123 MG Road, Pune, Maharashtra")');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Current Location Display */}
      {coordinates.lat && coordinates.lng && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <FiMapPin className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-900">Location Selected</p>
              <p className="text-xs text-green-700 mt-1 break-words">{address || `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Box */}
      <div className="flex space-x-2 mb-2">
        <div className="flex-1">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a location..."
            icon={FiSearch}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchLocation()}
          />
        </div>
        <Button
          type="button"
          onClick={handleSearchLocation}
          loading={loading}
          disabled={!searchQuery.trim()}
        >
          Search
        </Button>
      </div>

      {/* Get Current Location Button */}
      <Button
        type="button"
        variant="outline"
        fullWidth
        onClick={handleGetCurrentLocation}
        loading={loading}
      >
        <FiNavigation className="mr-2" />
        Use My Current Location
      </Button>

      {/* Manual Coordinates Input */}
      <div className="mt-3">
        <details className="group">
          <summary className="text-sm text-gray-600 cursor-pointer hover:text-primary-600">
            Enter coordinates manually
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Input
              type="number"
              value={coordinates.lat || ''}
              onChange={(e) => {
                const lat = parseFloat(e.target.value);
                const newCoords = { ...coordinates, lat };
                setCoordinates(newCoords);
                if (lat && coordinates.lng) {
                  onChange(newCoords);
                }
              }}
              placeholder="Latitude"
              step="0.000001"
            />
            <Input
              type="number"
              value={coordinates.lng || ''}
              onChange={(e) => {
                const lng = parseFloat(e.target.value);
                const newCoords = { ...coordinates, lng };
                setCoordinates(newCoords);
                if (coordinates.lat && lng) {
                  onChange(newCoords);
                }
              }}
              placeholder="Longitude"
              step="0.000001"
            />
          </div>
        </details>
      </div>

      {/* Instructions */}
      <p className="text-xs text-gray-500 mt-2">
        💡 Tip: Allow location access for accurate results or search for your address
      </p>
    </div>
  );
};

export default LocationPicker;