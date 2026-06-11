// ============ src/pages/SubscriptionsPage.jsx ============
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiMapPin, FiMoreVertical } from 'react-icons/fi';
import { fetchSubscriptions, cancelSubscription, pauseSubscription } from '../redux/slices/subscriptionSlice';
import { paymentApi } from '../api/paymentApi';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { ListSkeleton } from '../components/common/Skeleton';
import { NoSubscriptions } from '../components/common/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { SUBSCRIPTION_STATUS } from '../utils/constants';
import { toast } from 'react-toastify';

const SubscriptionsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { subscriptions, loading } = useSelector((state) => state.subscription);
  const [filter, setFilter] = useState('all');
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    dispatch(fetchSubscriptions());
    loadRazorpay();
  }, [dispatch]);

  const loadRazorpay = () => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay');
    };
    document.body.appendChild(script);
  };

  const filteredSubscriptions = subscriptions.filter((sub) =>
    filter === 'all' ? true : sub.status === filter
  );

  const handleCancelSubscription = async (id) => {
    setShowCancelDialog(true);
  };

  const confirmCancelSubscription = async () => {
    try {
      await dispatch(cancelSubscription(selectedSubscription._id));
      toast.success('Subscription cancelled successfully');
      setShowCancelDialog(false);
      setShowActionModal(false);
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  const handlePauseSubscription = async (id) => {
    try {
      await dispatch(pauseSubscription({ id, data: { pausedFrom: new Date(), pausedUntil: null, reason: 'User requested' } }));
      toast.success('Subscription paused');
      setShowActionModal(false);
    } catch (error) {
      toast.error('Failed to pause subscription');
    }
  };

  const handleCompletePayment = async (subscription) => {
    // Check if Razorpay is loaded
    if (!razorpayLoaded || !window.Razorpay) {
      toast.error('Payment gateway is loading. Please wait and try again.');
      loadRazorpay();
      return;
    }

    try {
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
        description: `${subscription.planType} ${subscription.mealType} subscription`,
        handler: async (response) => {
          try {
            // Verify payment
            await paymentApi.verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              subscriptionId: subscription._id,
            });

            toast.success('Payment successful! Subscription activated.');
            dispatch(fetchSubscriptions());
          } catch (error) {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: function() {
            toast.info('Payment cancelled');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#ef4444',
        },
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        toast.error('Payment failed. Please try again.');
        console.error('Payment failed:', response.error);
      });

      rzp.open();
    } catch (error) {
      toast.error('Failed to initiate payment');
      console.error('Payment error:', error);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      active: 'success',
      paused: 'warning',
      cancelled: 'danger',
      expired: 'default',
      completed: 'info',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Subscriptions</h1>
        <p className="text-lg text-gray-600">Manage your tiffin subscriptions</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          {['all', 'active', 'paused', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`pb-4 px-2 font-medium capitalize transition-colors ${
                filter === status
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {status} ({subscriptions.filter((s) => status === 'all' || s.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions Grid */}
      {loading ? (
  <ListSkeleton count={3} />
) : filteredSubscriptions.length > 0 ? (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {filteredSubscriptions.map((subscription) => (
      <Card key={subscription._id}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {subscription.provider.businessName}
            </h3>
            {getStatusBadge(subscription.status)}
          </div>
          <button
            onClick={() => {
              setSelectedSubscription(subscription);
              setShowActionModal(true);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiMoreVertical className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-gray-600">
            <FiCalendar className="h-4 w-4 mr-2" />
            <span className="text-sm">
              {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <FiClock className="h-4 w-4 mr-2" />
            <span className="text-sm capitalize">
              {subscription.planType} - {subscription.mealType === 'fullDay' ? 'Full Day' : subscription.mealType}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <FiMapPin className="h-4 w-4 mr-2" />
            <span className="text-sm">
              {subscription.deliveryAddress?.city || 'N/A'}
            </span>
          </div>
        </div>

        <div className="border-t pt-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-2xl font-bold text-primary-600">
              {formatCurrency(subscription.amount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Meals Delivered</p>
            <p className="text-xl font-semibold text-gray-900">
              {subscription.mealsDelivered}/{subscription.totalMeals}
            </p>
          </div>
        </div>

        <div className="mt-4 flex space-x-2">
          <Button fullWidth variant="outline" size="sm">
            View Details
          </Button>
          {subscription.status === 'pending' && (
            <Button 
              fullWidth 
              size="sm"
              onClick={() => handleCompletePayment(subscription)}
            >
              Complete Payment
            </Button>
          )}
          {subscription.status === 'active' && (
            <Button fullWidth variant="outline" size="sm">
              Manage
            </Button>
          )}
        </div>
      </Card>
    ))}
  </div>
) : (
  <NoSubscriptions onAction={() => navigate('/explore')} />
)}


      {/* Action Modal */}

      {/* Action Modal */}
      <Modal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title="Manage Subscription"
      >
        {selectedSubscription && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                {selectedSubscription.provider.businessName}
              </h4>
              <p className="text-sm text-gray-600">
                {selectedSubscription.planType} - {selectedSubscription.mealType}
              </p>
            </div>

            <div className="space-y-2">
              {selectedSubscription.status === 'active' && (
                <>
                  <Button
                    fullWidth
                    variant="outline"
                    onClick={() => handlePauseSubscription(selectedSubscription._id)}
                  >
                    Pause Subscription
                  </Button>
                  <Button
                    fullWidth
                    variant="danger"
                    onClick={() => handleCancelSubscription(selectedSubscription._id)}
                  >
                    Cancel Subscription
                  </Button>
                </>
              )}
              {selectedSubscription.status === 'paused' && (
                <Button fullWidth>Resume Subscription</Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={confirmCancelSubscription}
        title="Cancel Subscription"
        message="Are you sure you want to cancel this subscription? This action cannot be undone."
        confirmText="Yes, Cancel"
        cancelText="No, Keep It"
        variant="danger"
      />
    </div>
  );
};

export default SubscriptionsPage;