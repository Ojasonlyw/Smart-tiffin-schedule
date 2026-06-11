// ============ src/services/mapsService.js ============
const axios = require('axios');

// Geocode address to coordinates
const geocodeAddress = async (address) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
        formattedAddress: response.data.results[0].formatted_address
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding Error:', error);
    return null;
  }
};

// Reverse geocode coordinates to address
const reverseGeocode = async (lat, lng) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        latlng: `${lat},${lng}`,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.results.length > 0) {
      const result = response.data.results[0];
      const addressComponents = result.address_components;

      return {
        formattedAddress: result.formatted_address,
        street: addressComponents.find(c => c.types.includes('route'))?.long_name || '',
        city: addressComponents.find(c => c.types.includes('locality'))?.long_name || '',
        state: addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.long_name || '',
        pincode: addressComponents.find(c => c.types.includes('postal_code'))?.long_name || ''
      };
    }

    return null;
  } catch (error) {
    console.error('Reverse Geocoding Error:', error);
    return null;
  }
};

// Calculate distance between two points
const calculateDistance = async (origin, destination) => {
  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
      params: {
        origins: `${origin.lat},${origin.lng}`,
        destinations: `${destination.lat},${destination.lng}`,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });

    if (response.data.rows.length > 0 && response.data.rows[0].elements.length > 0) {
      const element = response.data.rows[0].elements[0];
      return {
        distance: element.distance.text,
        distanceValue: element.distance.value, // in meters
        duration: element.duration.text,
        durationValue: element.duration.value // in seconds
      };
    }

    return null;
  } catch (error) {
    console.error('Distance Calculation Error:', error);
    return null;
  }
};

module.exports = {
  geocodeAddress,
  reverseGeocode,
  calculateDistance
};

