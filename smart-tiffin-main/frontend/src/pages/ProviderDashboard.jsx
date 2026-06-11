// ============ src/pages/ProviderDashboard.jsx ============
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiDollarSign, FiPackage, FiStar } from 'react-icons/fi';
import { providerApi } from '../api/providerApi';
import { subscriptionApi } from '../api/subscriptionApi';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { formatCurrency, formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';
import Loader from '../components/common/Loader';

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`h-12 w-12 ${color} rounded-full flex items-center justify-center`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </Card>
);

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [hasProvider, setHasProvider] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const providerRes = await providerApi.getMyProvider();
      setProvider(providerRes.data.provider);
      setHasProvider(true);

      // Only fetch subscriptions if provider exists
      const subsRes = await subscriptionApi.getProviderSubscriptions({ status: 'active' });
      setSubscriptions(subsRes.data.subscriptions);

      // Calculate stats
      const activeCount = subsRes.data.subscriptions.length;
      const revenue = subsRes.data.subscriptions.reduce(
        (sum, sub) => sum + sub.amount,
        0
      );

      setStats({
        totalSubscribers: providerRes.data.provider.totalSubscribers,
        activeSubscriptions: activeCount,
        monthlyRevenue: revenue,
        averageRating: providerRes.data.provider.ratings.average,
      });
    } catch (error) {
      if (error.response?.status === 404) {
        // Provider doesn't exist yet
        setHasProvider(false);
      } else {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  // Show create provider form if no provider listing exists
  if (!hasProvider) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <div className="text-center py-12">
            <FiPackage className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create Your Provider Listing
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't created a provider listing yet. Create one to start accepting subscriptions.
            </p>
            <Button onClick={() => window.location.href = '/provider/create'}>
              Create Provider Listing
            </Button>
          </div>
        </Card>

        {/* Quick Setup Guide */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="text-center">
                <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary-600 font-bold text-lg">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Create Listing</h4>
                <p className="text-sm text-gray-600">
                  Add your business details, address, and contact information
                </p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary-600 font-bold text-lg">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Setup Menu</h4>
                <p className="text-sm text-gray-600">
                  Add your menu items and pricing for different meal types
                </p>
              </div>
            </Card>

            <Card>
              <div className="text-center">
                <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary-600 font-bold text-lg">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Get Approved</h4>
                <p className="text-sm text-gray-600">
                  Wait for admin approval and start accepting subscriptions
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Provider Dashboard</h1>
        <p className="text-lg text-gray-600">Manage your tiffin service</p>
      </div>

      {/* Provider Status Alert */}
      {provider && !provider.isApproved && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Your provider listing is pending admin approval. You'll be able to accept subscriptions once approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Subscribers"
          value={stats.totalSubscribers}
          icon={FiUsers}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={FiPackage}
          color="bg-green-500"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue)}
          icon={FiDollarSign}
          color="bg-yellow-500"
        />
        <StatCard
          title="Average Rating"
          value={stats.averageRating.toFixed(1)}
          icon={FiStar}
          color="bg-purple-500"
        />
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            fullWidth
            onClick={() => navigate(`/provider/menu/${provider._id}`)}
          >
            Update Menu
          </Button>
          <Button 
            fullWidth 
            variant="outline"
            onClick={() => navigate(`/provider/pricing/${provider._id}`)}
          >
            Manage Pricing
          </Button>
          <Button 
            fullWidth 
            variant="outline"
            onClick={() => navigate(`/providers/${provider._id}#reviews`)}
          >
            View Reviews
          </Button>
        </div>
      </Card>

      {/* Recent Subscriptions */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Subscriptions
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscriptions.map((sub) => (
                <tr key={sub._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {sub.user.name}
                    </div>
                    <div className="text-sm text-gray-500">{sub.user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sub.planType} - {sub.mealType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(sub.startDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(sub.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="success">{sub.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ProviderDashboard;