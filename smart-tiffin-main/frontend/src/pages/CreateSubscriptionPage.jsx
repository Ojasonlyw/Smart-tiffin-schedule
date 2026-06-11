// ============ src/pages/CreateSubscriptionPage.jsx ============
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiCalendar, FiMapPin, FiCreditCard } from 'react-icons/fi';
import { providerApi } from '../api/providerApi';
import { paymentApi } from '../api/paymentApi';
import { createSubscription } from '../redux/slices/subscriptionSlice';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { formatCurrency } from '../utils/formatters';
import { toast } from 'react-toastify';

const CreateSubscriptionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { provider: providerId, planType, mealType } = location.state || {};

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      pincode: '',
    },
    deliveryInstructions: '',
  });

  useEffect(() => {
    if (!providerId || !planType || !mealType) {
      toast.error('Invalid subscription data');
      navigate('/explore');
      return;
    }
    loadProvider();
    loadRazorpay();
  }, [providerId]);

  const loadRazorpay = () => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    // Load Razorpay script dynamically
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('Razorpay loaded successfully');
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay');
      toast.error('Failed to load payment gateway. Please check your internet connection.');
    };
    document.body.appendChild(script);
  };

  const loadProvider = async () => {
    try {
      const response = await providerApi.getProvider(providerId);
      setProvider(response.data.provider);
    } catch (error) {
      toast.error('Failed to load provider details');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('deliveryAddress.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        deliveryAddress: { ...formData.deliveryAddress, [field]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const calculateAmount = () => {
    if (!provider) return 0;
    return provider.pricing[planType]?.[mealType] || 0;
  };

  const handleSubscribe = async () => {
    // Validate address
    if (!formData.deliveryAddress.street || !formData.deliveryAddress.city) {
      toast.error('Please enter your delivery address');
      return;
    }

    // Check if Razorpay is loaded
    if (!razorpayLoaded || !window.Razorpay) {
      toast.error('Payment gateway is loading. Please wait a moment and try again.');
      loadRazorpay(); // Try loading again
      return;
    }

    setLoading(true);
    try {
      // Create subscription
      const subscriptionData = {
        provider: providerId,
        planType,
        mealType,
        startDate: formData.startDate,
        deliveryAddress: formData.deliveryAddress,
        deliveryInstructions: formData.deliveryInstructions,
      };

      const result = await dispatch(createSubscription(subscriptionData));
      
      if (result.type === 'subscription/createSubscription/fulfilled') {
        const subscription = result.payload.subscription;

        // Check if Razorpay is loaded
        if (!window.Razorpay) {
          toast.error('Payment gateway not loaded. Please refresh the page.');
          setLoading(false);
          return;
        }

        try {
          // Create payment order
          const orderResponse = await paymentApi.createOrder({
            subscriptionId: subscription._id,
          });

          // Initialize Razorpay
          const options = {
            key: process.env.REACT_APP_RAZORPAY_KEY,
            amount: orderResponse.data.amount,
            currency: orderResponse.data.currency,
            order_id: orderResponse.data.orderId,
            name: 'Smart Tiffin Scheduler',
            description: `${planType} ${mealType} subscription`,
            handler: async (response) => {
              try {
                setLoading(true);
                // Verify payment
                await paymentApi.verifyPayment({
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  subscriptionId: subscription._id,
                });

                toast.success('Payment successful! Subscription activated.');
                navigate('/subscriptions');
              } catch (error) {
                toast.error('Payment verification failed. Please contact support.');
                console.error('Payment verification error:', error);
              } finally {
                setLoading(false);
              }
            },
            modal: {
              ondismiss: function() {
                setLoading(false);
                toast.info('Payment cancelled');
              }
            },
            prefill: {
              name: formData.deliveryAddress.name || '',
              email: '',
              contact: '',
            },
            theme: {
              color: '#ef4444',
            },
          };

          const rzp = new window.Razorpay(options);
          
          rzp.on('payment.failed', function (response) {
            setLoading(false);
            toast.error('Payment failed. Please try again.');
            console.error('Payment failed:', response.error);
          });

          rzp.open();
          setLoading(false); // Remove loading after opening modal
        } catch (orderError) {
          console.error('Order creation error:', orderError);
          toast.error('Failed to create payment order. Please try again.');
          setLoading(false);
        }
      } else {
        // Subscription creation failed
        toast.error(result.payload || 'Failed to create subscription');
        setLoading(false);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to process subscription. Please try again.');
      setLoading(false);
    }
  };

  if (!provider) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Complete Your Subscription</h1>
        <p className="text-lg text-gray-600">Review details and proceed to payment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subscription Details */}
          <Card>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Subscription Details</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Provider</p>
                  <p className="font-medium text-gray-900">{provider.businessName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Plan Type</p>
                  <p className="font-medium text-gray-900 capitalize">{planType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Meal Type</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {mealType === 'fullDay' ? 'Full Day' : mealType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <Input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Delivery Address */}
          <Card>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              <FiMapPin className="inline mr-2" />
              Delivery Address
            </h2>

            <Input
              label="Street Address"
              type="text"
              name="deliveryAddress.street"
              value={formData.deliveryAddress.street}
              onChange={handleChange}
              placeholder="House No., Street Name"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="City"
                type="text"
                name="deliveryAddress.city"
                value={formData.deliveryAddress.city}
                onChange={handleChange}
                placeholder="City"
                required
              />

              <Input
                label="State"
                type="text"
                name="deliveryAddress.state"
                value={formData.deliveryAddress.state}
                onChange={handleChange}
                placeholder="State"
                required
              />

              <Input
                label="Pincode"
                type="text"
                name="deliveryAddress.pincode"
                value={formData.deliveryAddress.pincode}
                onChange={handleChange}
                placeholder="400001"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Instructions (Optional)
              </label>
              <textarea
                name="deliveryInstructions"
                value={formData.deliveryInstructions}
                onChange={handleChange}
                placeholder="Any special instructions for delivery..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan</span>
                <span className="font-medium capitalize">{planType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Meal Type</span>
                <span className="font-medium capitalize">
                  {mealType === 'fullDay' ? 'Full Day' : mealType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration</span>
                <span className="font-medium">
                  {planType === 'daily' && '1 day'}
                  {planType === 'weekly' && '7 days'}
                  {planType === 'monthly' && '30 days'}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                <span className="text-3xl font-bold text-primary-600">
                  {formatCurrency(calculateAmount())}
                </span>
              </div>
            </div>

            <Button
              fullWidth
              onClick={handleSubscribe}
              loading={loading}
              disabled={!razorpayLoaded}
            >
              <FiCreditCard className="mr-2" />
              {razorpayLoaded ? 'Proceed to Payment' : 'Loading Payment Gateway...'}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              {razorpayLoaded ? 'Secured payment powered by Razorpay' : 'Initializing payment gateway...'}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateSubscriptionPage;