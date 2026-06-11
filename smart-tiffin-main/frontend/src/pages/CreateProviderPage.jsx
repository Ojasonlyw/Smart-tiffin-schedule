// ============ frontend/src/pages/CreateProviderPage.jsx - UPDATED WITH LOCATION ============
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { providerApi } from '../api/providerApi';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import LocationPicker from '../components/common/LocationPicker';
import { CUISINES, SPECIALTIES } from '../utils/constants';
import { toast } from 'react-toastify';

const CreateProviderPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      coordinates: {
        lat: null,
        lng: null,
      },
    },
    cuisines: [],
    specialties: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: { ...formData.address, [addressField]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleLocationChange = (coordinates) => {
    setFormData({
      ...formData,
      address: {
        ...formData.address,
        coordinates: coordinates,
      },
    });
  };

  const handleCuisineToggle = (cuisine) => {
    const cuisines = formData.cuisines.includes(cuisine)
      ? formData.cuisines.filter((c) => c !== cuisine)
      : [...formData.cuisines, cuisine];
    setFormData({ ...formData, cuisines });
  };

  const handleSpecialtyToggle = (specialty) => {
    const specialties = formData.specialties.includes(specialty)
      ? formData.specialties.filter((s) => s !== specialty)
      : [...formData.specialties, specialty];
    setFormData({ ...formData, specialties });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.cuisines.length === 0) {
      toast.error('Please select at least one cuisine');
      return;
    }

    if (!formData.address.coordinates.lat || !formData.address.coordinates.lng) {
      toast.error('Please set your business location');
      return;
    }

    setLoading(true);
    try {
      await providerApi.createProvider(formData);
      toast.success('Provider listing created! Awaiting admin approval.');
      navigate('/provider-dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create provider listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Provider Listing</h1>
        <p className="text-lg text-gray-600">
          Fill in your business details to start accepting subscriptions
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <Card className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <Input
            label="Business Name"
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            placeholder="e.g., Tasty Tiffin Service"
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell customers about your tiffin service..."
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              icon={FiPhone}
              placeholder="9876543210"
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              icon={FiMail}
              placeholder="contact@yourbusiness.com"
              required
            />
          </div>
        </Card>

        {/* Address & Location */}
        <Card className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            <FiMapPin className="inline mr-2" />
            Business Location
          </h2>

          {/* Location Picker */}
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              📍 <strong>Important:</strong> Set your exact business location for customers to find you easily
            </p>
            <p className="text-xs text-blue-600">
              This helps customers see distance and delivery time estimates
            </p>
          </div>

          <LocationPicker
            value={formData.address.coordinates}
            onChange={handleLocationChange}
            label="Business Location"
            required
          />

          <Input
            label="Street Address"
            type="text"
            name="address.street"
            value={formData.address.street}
            onChange={handleChange}
            placeholder="Shop No. 5, MG Road"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="City"
              type="text"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
              placeholder="Pune"
              required
            />

            <Input
              label="State"
              type="text"
              name="address.state"
              value={formData.address.state}
              onChange={handleChange}
              placeholder="Maharashtra"
              required
            />

            <Input
              label="Pincode"
              type="text"
              name="address.pincode"
              value={formData.address.pincode}
              onChange={handleChange}
              placeholder="411001"
              required
            />
          </div>
        </Card>

        {/* Cuisines */}
        <Card className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cuisines</h2>
          <p className="text-sm text-gray-600 mb-4">Select the cuisines you offer</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {CUISINES.map((cuisine) => (
              <button
                key={cuisine}
                type="button"
                onClick={() => handleCuisineToggle(cuisine)}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  formData.cuisines.includes(cuisine)
                    ? 'border-primary-600 bg-primary-50 text-primary-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </Card>

        {/* Specialties */}
        <Card className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Specialties</h2>
          <p className="text-sm text-gray-600 mb-4">Highlight what makes you special</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SPECIALTIES.map((specialty) => (
              <button
                key={specialty}
                type="button"
                onClick={() => handleSpecialtyToggle(specialty)}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  formData.specialties.includes(specialty)
                    ? 'border-secondary-600 bg-secondary-50 text-secondary-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {specialty}
              </button>
            ))}
          </div>
        </Card>

        {/* Submit */}
        <div className="flex space-x-4">
          <Button
            type="submit"
            fullWidth
            loading={loading}
          >
            Create Provider Listing
          </Button>
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => navigate('/provider-dashboard')}
          >
            Cancel
          </Button>
        </div>

        <p className="text-sm text-gray-500 text-center mt-4">
          Your listing will be reviewed by our admin team before going live
        </p>
      </form>
    </div>
  );
};

export default CreateProviderPage;