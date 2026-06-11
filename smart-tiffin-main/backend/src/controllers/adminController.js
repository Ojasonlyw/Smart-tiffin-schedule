// ============ src/controllers/adminController.js ============
const User = require('../models/User');
const TiffinProvider = require('../models/TiffinProvider');
const Subscription = require('../models/Subscription');
const Review = require('../models/Review');
const ChatMessage = require('../models/ChatMessage');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({ role: 'user' });
  const totalProviders = await TiffinProvider.countDocuments();
  const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
  const totalRevenue = await Subscription.aggregate([
    {
      $match: { status: { $in: ['active', 'completed'] } }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  const pendingProviders = await TiffinProvider.countDocuments({ isApproved: false });
  const reportedMessages = await ChatMessage.countDocuments({ isReported: true });
  const reportedReviews = await Review.countDocuments({ isReported: true });

  res.status(200).json(
    new ApiResponse(200, {
      totalUsers,
      totalProviders,
      activeSubscriptions,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingProviders,
      reportedMessages,
      reportedReviews
    }, 'Dashboard stats retrieved successfully')
  );
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, isActive, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = {};
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Users retrieved successfully')
  );
});

// @desc    Get pending providers
// @route   GET /api/admin/providers/pending
// @access  Private (Admin)
const getPendingProviders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const providers = await TiffinProvider.find({ isApproved: false })
    .populate('owner', 'name email phone')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await TiffinProvider.countDocuments({ isApproved: false });

  res.status(200).json(
    new ApiResponse(200, {
      providers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Pending providers retrieved successfully')
  );
});

// @desc    Approve provider
// @route   PUT /api/admin/providers/:id/approve
// @access  Private (Admin)
const approveProvider = asyncHandler(async (req, res) => {
  const provider = await TiffinProvider.findById(req.params.id);

  if (!provider) {
    throw new ApiError(404, 'Provider not found');
  }

  provider.isApproved = true;
  provider.isVerified = true;
  await provider.save();

  // TODO: Send notification/email to provider

  res.status(200).json(
    new ApiResponse(200, { provider }, 'Provider approved successfully')
  );
});

// @desc    Reject provider
// @route   PUT /api/admin/providers/:id/reject
// @access  Private (Admin)
const rejectProvider = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const provider = await TiffinProvider.findById(req.params.id);

  if (!provider) {
    throw new ApiError(404, 'Provider not found');
  }

  // TODO: Send notification/email to provider with reason

  await provider.deleteOne();

  res.status(200).json(
    new ApiResponse(200, null, 'Provider rejected successfully')
  );
});

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin)
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, { user }, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`)
  );
});

// @desc    Get reported messages
// @route   GET /api/admin/reports/messages
// @access  Private (Admin)
const getReportedMessages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const messages = await ChatMessage.find({ isReported: true })
    .populate('sender receiver reportedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await ChatMessage.countDocuments({ isReported: true });

  res.status(200).json(
    new ApiResponse(200, {
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Reported messages retrieved successfully')
  );
});

// @desc    Get reported reviews
// @route   GET /api/admin/reports/reviews
// @access  Private (Admin)
const getReportedReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const reviews = await Review.find({ isReported: true })
    .populate('user provider', 'name businessName')
    .populate('reportedBy.user', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Review.countDocuments({ isReported: true });

  res.status(200).json(
    new ApiResponse(200, {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Reported reviews retrieved successfully')
  );
});

// @desc    Delete reported content
// @route   DELETE /api/admin/reports/:type/:id
// @access  Private (Admin)
const deleteReportedContent = asyncHandler(async (req, res) => {
  const { type, id } = req.params;

  let content;
  if (type === 'message') {
    content = await ChatMessage.findByIdAndDelete(id);
  } else if (type === 'review') {
    content = await Review.findByIdAndDelete(id);
  } else {
    throw new ApiError(400, 'Invalid content type');
  }

  if (!content) {
    throw new ApiError(404, 'Content not found');
  }

  res.status(200).json(
    new ApiResponse(200, null, 'Content deleted successfully')
  );
});

// @desc    Get subscription analytics
// @route   GET /api/admin/analytics/subscriptions
// @access  Private (Admin)
const getSubscriptionAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const matchStage = {};
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const analytics = await Subscription.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          planType: '$planType',
          status: '$status'
        },
        count: { $sum: 1 },
        totalRevenue: { $sum: '$amount' }
      }
    }
  ]);

  res.status(200).json(
    new ApiResponse(200, { analytics }, 'Subscription analytics retrieved successfully')
  );
});

module.exports = {
  getDashboardStats,
  getAllUsers,
  getPendingProviders,
  approveProvider,
  rejectProvider,
  toggleUserStatus,
  getReportedMessages,
  getReportedReviews,
  deleteReportedContent,
  getSubscriptionAnalytics
};