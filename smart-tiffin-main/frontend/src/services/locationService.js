// ============ frontend/src/services/locationService.js ============
class LocationService {
  constructor() {
    this.userLocation = this.getUserLocationFromStorage();
  }

  // Get user's current location
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          this.setUserLocation(location);
          resolve(location);
        },
        (error) => {
          reject(this.getGeolocationError(error));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  // Get error message for geolocation errors
  getGeolocationError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return new Error('Location permission denied. Please enable location access.');
      case error.POSITION_UNAVAILABLE:
        return new Error('Location information unavailable.');
      case error.TIMEOUT:
        return new Error('Location request timed out.');
      default:
        return new Error('An unknown error occurred.');
    }
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  toRad(value) {
    return (value * Math.PI) / 180;
  }

  // Format distance for display
  formatDistance(distance) {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(1)} km`;
  }

  // Get distance text with icon
  getDistanceText(providerLat, providerLng) {
    if (!this.userLocation) {
      return null;
    }

    const distance = this.calculateDistance(
      this.userLocation.lat,
      this.userLocation.lng,
      providerLat,
      providerLng
    );

    return {
      distance,
      formatted: this.formatDistance(distance),
      travelTime: this.estimateTravelTime(distance),
    };
  }

  // Estimate travel time (assuming average speed)
  estimateTravelTime(distance) {
    // Assuming 30 km/h average speed in city
    const hours = distance / 30;
    const minutes = Math.round(hours * 60);

    if (minutes < 60) {
      return `${minutes} min`;
    }
    return `${Math.round(hours)} hr`;
  }

  // Set user location in storage
  setUserLocation(location) {
    this.userLocation = location;
    localStorage.setItem('userLocation', JSON.stringify(location));
  }

  // Get user location from storage
  getUserLocationFromStorage() {
    const stored = localStorage.getItem('userLocation');
    return stored ? JSON.parse(stored) : null;
  }

  // Clear user location
  clearUserLocation() {
    this.userLocation = null;
    localStorage.removeItem('userLocation');
  }

  // Check if user location is available
  hasUserLocation() {
    return !!this.userLocation;
  }

  // Get user location
  getUserLocation() {
    return this.userLocation;
  }

  // Geocode address to coordinates using Nominatim (OpenStreetMap) - Free alternative
  async geocodeAddress(address) {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SmartTiffinScheduler/1.0'
        }
      });
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          formattedAddress: result.display_name,
        };
      } else {
        throw new Error('Address not found');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Failed to find location. Please try a more specific address.');
    }
  }

  // Reverse geocode coordinates to address using Nominatim (Free alternative)
  async reverseGeocode(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SmartTiffinScheduler/1.0'
        }
      });
      const data = await response.json();

      if (data && data.display_name) {
        // Parse address components from Nominatim response
        const addressComponents = [];
        if (data.address) {
          Object.entries(data.address).forEach(([key, value]) => {
            addressComponents.push({
              long_name: value,
              short_name: value,
              types: [key]
            });
          });
        }

        return {
          formattedAddress: data.display_name,
          addressComponents: addressComponents,
        };
      } else {
        // Fallback to simple coordinate display
        return {
          formattedAddress: `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          addressComponents: [],
        };
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Return coordinates as fallback instead of throwing error
      return {
        formattedAddress: `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        addressComponents: [],
      };
    }
  }

  // Optional: Google Maps geocode (if API key is available)
  async geocodeAddressWithGoogle(address) {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_KEY;
    if (!apiKey) {
      return this.geocodeAddress(address); // Fallback to Nominatim
    }

    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng,
          formattedAddress: data.results[0].formatted_address,
        };
      } else if (data.status === 'ZERO_RESULTS') {
        // Fallback to Nominatim
        return this.geocodeAddress(address);
      } else {
        throw new Error(data.error_message || 'Address not found');
      }
    } catch (error) {
      console.error('Google geocoding error:', error);
      // Fallback to Nominatim
      return this.geocodeAddress(address);
    }
  }

  // Optional: Google Maps reverse geocode (if API key is available)
  async reverseGeocodeWithGoogle(lat, lng) {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_KEY;
    if (!apiKey) {
      return this.reverseGeocode(lat, lng); // Fallback to Nominatim
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        return {
          formattedAddress: data.results[0].formatted_address,
          addressComponents: data.results[0].address_components,
        };
      } else {
        // Fallback to Nominatim
        return this.reverseGeocode(lat, lng);
      }
    } catch (error) {
      console.error('Google reverse geocoding error:', error);
      // Fallback to Nominatim
      return this.reverseGeocode(lat, lng);
    }
  }

  // Sort providers by distance
  sortByDistance(providers) {
    if (!this.userLocation) {
      return providers;
    }

    return [...providers].sort((a, b) => {
      const distanceA = this.calculateDistance(
        this.userLocation.lat,
        this.userLocation.lng,
        a.address.coordinates.lat,
        a.address.coordinates.lng
      );
      const distanceB = this.calculateDistance(
        this.userLocation.lat,
        this.userLocation.lng,
        b.address.coordinates.lat,
        b.address.coordinates.lng
      );
      return distanceA - distanceB;
    });
  }

  // Filter providers within radius
  filterByRadius(providers, radiusKm) {
    if (!this.userLocation) {
      return providers;
    }

    return providers.filter((provider) => {
      const distance = this.calculateDistance(
        this.userLocation.lat,
        this.userLocation.lng,
        provider.address.coordinates.lat,
        provider.address.coordinates.lng
      );
      return distance <= radiusKm;
    });
  }
}

export default new LocationService();