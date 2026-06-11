// ============ src/pages/AdminDashboard.jsx ============
import React, { useEffect, useState } from 'react';
import { FiUsers, FiPackage, FiDollarSign, FiTrendingUp, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import axios from '../api/axios';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';

// Stat Card Component - Define it at the top
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

const DEFAULT_STATS = {
  totalUsers: 0,
  totalProviders: 0,
  activeSubscriptions: 0,
  totalRevenue: 0,
  pendingProviders: 0,
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [reportedContent, setReportedContent] = useState({ messages: [], reviews: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, providersRes, messagesRes, reviewsRes] = await Promise.allSettled([
        axios.get('/admin/stats'),
        axios.get('/admin/providers/pending'),
        axios.get('/admin/reports/messages'),
        axios.get('/admin/reports/reviews'),
      ]);

      if (statsRes.status === 'fulfilled') {
        setStats({
          ...DEFAULT_STATS,
          ...(statsRes.value?.data || {}),
        });
      } else {
        setStats(DEFAULT_STATS);
        toast.error('Failed to load admin stats');
      }

      if (providersRes.status === 'fulfilled') {
        setPendingProviders(providersRes.value?.data?.providers || []);
      } else {
        setPendingProviders([]);
        toast.error('Failed to load pending providers');
      }

      if (messagesRes.status === 'fulfilled') {
        setReportedContent((prev) => ({
          ...prev,
          messages: messagesRes.value?.data?.messages || [],
        }));
      } else {
        setReportedContent((prev) => ({ ...prev, messages: [] }));
        toast.error('Failed to load reported messages');
      }

      if (reviewsRes.status === 'fulfilled') {
        setReportedContent((prev) => ({
          ...prev,
          reviews: reviewsRes.value?.data?.reviews || [],
        }));
      } else {
        setReportedContent((prev) => ({ ...prev, reviews: [] }));
        toast.error('Failed to load reported reviews');
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-lg text-gray-600">Manage your platform</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <div className="flex space-x-8">
          {['overview', 'providers', 'reports', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && stats && <OverviewTab stats={stats} />}
      {activeTab === 'providers' && (
        <ProvidersTab providers={pendingProviders} onUpdate={loadDashboardData} />
      )}
      {activeTab === 'reports' && (
        <ReportsTab content={reportedContent} onUpdate={loadDashboardData} />
      )}
      {activeTab === 'analytics' && <AnalyticsTab />}
    </div>
  );
};

// Overview Tab
const OverviewTab = ({ stats }) => (
  <div>
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Users"
        value={stats.totalUsers}
        icon={FiUsers}
        color="bg-blue-500"
      />
      <StatCard
        title="Total Providers"
        value={stats.totalProviders}
        icon={FiPackage}
        color="bg-green-500"
      />
      <StatCard
        title="Active Subscriptions"
        value={stats.activeSubscriptions}
        icon={FiTrendingUp}
        color="bg-purple-500"
      />
      <StatCard
        title="Total Revenue"
        value={formatCurrency(stats.totalRevenue)}
        icon={FiDollarSign}
        color="bg-yellow-500"
      />
    </div>

    {/* Alerts */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Pending Approvals</p>
            <p className="text-3xl font-bold text-gray-900">{stats.pendingProviders}</p>
          </div>
          <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
            <FiXCircle className="h-6 w-6 text-red-600" />
          </div>
        </div>
      </Card>
    </div>
  </div>
);

// Stat Card Component - removed duplicate, already defined above

// Providers Tab
const ProvidersTab = ({ providers, onUpdate }) => {
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleApprove = async (id) => {
    try {
      await axios.put(`/admin/providers/${id}/approve`);
      toast.success('Provider approved successfully');
      onUpdate();
    } catch (error) {
      toast.error('Failed to approve provider');
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`/admin/providers/${id}/reject`, {
        reason: 'Does not meet platform requirements',
      });
      toast.success('Provider rejected');
      onUpdate();
    } catch (error) {
      toast.error('Failed to reject provider');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Pending Provider Approvals ({providers.length})
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {providers.length > 0 ? (
          providers.map((provider) => (
            <Card key={provider._id}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {provider.businessName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {provider.address.city}, {provider.address.state}
                  </p>
                </div>
                <Badge variant="warning">Pending</Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Owner:</span>
                  <span className="font-medium">{provider.owner.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{provider.owner.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{provider.phone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cuisines:</span>
                  <span className="font-medium">{provider.cuisines.join(', ')}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => {
                    setSelectedProvider(provider);
                    setShowModal(true);
                  }}
                >
                  View Details
                </Button>
                <Button
                  fullWidth
                  onClick={() => handleApprove(provider._id)}
                >
                  <FiCheckCircle className="mr-2" />
                  Approve
                </Button>
                <Button
                  fullWidth
                  variant="danger"
                  onClick={() => handleReject(provider._id)}
                >
                  <FiXCircle className="mr-2" />
                  Reject
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-2 text-center py-12 text-gray-500">
            No pending provider approvals
          </div>
        )}
      </div>

      {/* Provider Details Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Provider Details"
        size="lg"
      >
        {selectedProvider && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Business Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-600">Name:</span> {selectedProvider.businessName}</p>
                <p><span className="text-gray-600">Description:</span> {selectedProvider.description || 'N/A'}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Documents</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-600">FSSAI License:</span> {selectedProvider.documents?.fssaiLicense || 'Not provided'}</p>
                <p><span className="text-gray-600">GST Number:</span> {selectedProvider.documents?.gstNumber || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button fullWidth onClick={() => handleApprove(selectedProvider._id)}>
                Approve
              </Button>
              <Button fullWidth variant="danger" onClick={() => handleReject(selectedProvider._id)}>
                Reject
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// Reports Tab
const ReportsTab = ({ content, onUpdate }) => {
  const [activeReportTab, setActiveReportTab] = useState('messages');

  const handleDeleteContent = async (type, id) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await axios.delete(`/admin/reports/${type}/${id}`);
        toast.success('Content deleted successfully');
        onUpdate();
      } catch (error) {
        toast.error('Failed to delete content');
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Reported Content</h2>

      {/* Report Type Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveReportTab('messages')}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeReportTab === 'messages'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Messages ({content.messages.length})
          </button>
          <button
            onClick={() => setActiveReportTab('reviews')}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeReportTab === 'reviews'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Reviews ({content.reviews.length})
          </button>
        </div>
      </div>

      {/* Reported Messages */}
      {activeReportTab === 'messages' && (
        <div className="space-y-4">
          {content.messages.length > 0 ? (
            content.messages.map((message) => (
              <Card key={message._id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-900">
                        {message.sender.name}
                      </span>
                      <span className="text-gray-500">→</span>
                      <span className="font-semibold text-gray-900">
                        {message.receiver.name}
                      </span>
                      <Badge variant="danger">Reported</Badge>
                    </div>
                    <p className="text-gray-700 mb-2">{message.message}</p>
                    <p className="text-sm text-gray-500">
                      Reported by: {message.reportedBy.name} - Reason: {message.reportReason}
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteContent('message', message._id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No reported messages</p>
          )}
        </div>
      )}

      {/* Reported Reviews */}
      {activeReportTab === 'reviews' && (
        <div className="space-y-4">
          {content.reviews.length > 0 ? (
            content.reviews.map((review) => (
              <Card key={review._id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-900">
                        {review.user.name}
                      </span>
                      <span className="text-gray-500">reviewed</span>
                      <span className="font-semibold text-gray-900">
                        {review.provider.businessName}
                      </span>
                      <Badge variant="danger">Reported</Badge>
                    </div>
                    <p className="text-gray-700 mb-2">{review.comment}</p>
                    <p className="text-sm text-gray-500">
                      Reports: {review.reportedBy.length}
                    </p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteContent('review', review._id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No reported reviews</p>
          )}
        </div>
      )}
    </div>
  );
};

// Analytics Tab
const AnalyticsTab = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">User Growth</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart will be displayed here</p>
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Revenue Trends</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart will be displayed here</p>
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Popular Cuisines</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart will be displayed here</p>
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Subscription Types</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart will be displayed here</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
