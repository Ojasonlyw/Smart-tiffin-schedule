// ============ src/pages/PricingManagementPage.jsx ============
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiDollarSign } from 'react-icons/fi';
import { providerApi } from '../api/providerApi';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { toast } from 'react-toastify';

const PricingManagementPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pricing, setPricing] = useState({
    daily: {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      fullDay: 0,
    },
    weekly: {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      fullDay: 0,
    },
    monthly: {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      fullDay: 0,
    },
  });

  useEffect(() => {
    loadPricing();
  }, [id]);

  const loadPricing = async () => {
    try {
      const response = await providerApi.getProvider(id);
      setPricing(response.data.provider.pricing || pricing);
    } catch (error) {
      toast.error('Failed to load pricing');
    }
  };

  const updatePrice = (planType, mealType, value) => {
    setPricing({
      ...pricing,
      [planType]: {
        ...pricing[planType],
        [mealType]: parseFloat(value) || 0,
      },
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await providerApi.updatePricing(id, { pricing });
      toast.success('Pricing updated successfully!');
      navigate('/provider-dashboard');
    } catch (error) {
      toast.error('Failed to update pricing');
    } finally {
      setLoading(false);
    }
  };

  const calculateSavings = (planType, mealType) => {
    const daily = pricing.daily[mealType];
    const multiplier = planType === 'weekly' ? 7 : 30;
    const planPrice = pricing[planType][mealType];
    const savings = (daily * multiplier) - planPrice;
    return savings > 0 ? savings : 0;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Pricing Management</h1>
          <p className="text-lg text-gray-600">Set your subscription prices</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate('/provider-dashboard')}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={loading}>
            <FiSave className="mr-2" />
            Save Pricing
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {['daily', 'weekly', 'monthly'].map((planType) => (
          <Card key={planType} className="border-2 border-gray-200">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 capitalize flex items-center">
                <FiDollarSign className="mr-2 text-primary-600" />
                {planType} Plan
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {planType === 'daily' && 'Price per day'}
                {planType === 'weekly' && 'Price for 7 days'}
                {planType === 'monthly' && 'Price for 30 days'}
              </p>
            </div>

            <div className="space-y-4">
              {['breakfast', 'lunch', 'dinner', 'fullDay'].map((mealType) => (
                <div key={mealType}>
                  <Input
                    label={mealType === 'fullDay' ? 'Full Day (3 meals)' : mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                    type="number"
                    value={pricing[planType][mealType]}
                    onChange={(e) => updatePrice(planType, mealType, e.target.value)}
                    placeholder="Enter price"
                  />
                  {planType !== 'daily' && pricing.daily[mealType] > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      Save ₹{calculateSavings(planType, mealType).toFixed(0)} compared to daily
                    </p>
                  )}
                </div>
              ))}
            </div>

            {planType === 'daily' && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 Set competitive prices to attract more customers
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing Tips</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Offer discounts on weekly and monthly plans to encourage long-term subscriptions</li>
          <li>• Full day plans should be priced attractively (less than sum of individual meals)</li>
          <li>• Review competitor pricing in your area</li>
          <li>• Consider your costs and target profit margin</li>
        </ul>
      </Card>
    </div>
  );
};

export default PricingManagementPage;