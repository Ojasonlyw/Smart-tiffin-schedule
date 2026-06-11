// ============ src/controllers/subscriptionController.js ============
const Subscription = require('../models/Subscription');
const TiffinProvider = require('../models/TiffinProvider');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create subscription
// @route   POST /api/subscriptions
// @access  Private
const createSubscription = asyncHandler(async (req, res) => {
  const { provider, planType, mealType, startDate, deliveryAddress, deliveryInstructions } = req.body;

  // Check if provider exists
  const tiffinProvider = await TiffinProvider.findById(provider);
  if (!tiffinProvider) {
    throw new ApiError(404, 'Provider not found');
  }

  // Get pricing
  const amount = tiffinProvider.pricing[planType]?.[mealType];
  if (!amount) {
    throw new ApiError(400, 'Invalid plan or meal type');
  }

  // Calculate end date
  const start = new Date(startDate);
  let endDate = new Date(start);
  let totalMeals = 0;

  switch(planType) {
    case 'daily':
      endDate.setDate(start.getDate() + 1);
      totalMeals = mealType === 'fullDay' ? 3 : 1;
      break;
    case 'weekly':
      endDate.setDate(start.getDate() + 7);
      totalMeals = mealType === 'fullDay' ? 21 : 7;
      break;
    case 'monthly':
      endDate.setMonth(start.getMonth() + 1);
      totalMeals = mealType === 'fullDay' ? 90 : 30;
      break;
  }

  // Create subscription
  const subscription = await Subscription.create({
    user: req.user._id,
    provider,
    planType,
    mealType,
    startDate,
    endDate,
    amount,
    totalMeals,
    deliveryAddress: deliveryAddress || req.user.address,
    deliveryInstructions,
    status: 'pending' // Set to pending until payment is verified
  });

  await subscription.populate('provider', 'businessName address phone');

  res.status(201).json(
    new ApiResponse(201, { subscription }, 'Subscription created successfully')
  );
});

// @desc    Get user subscriptions
// @route   GET /api/subscriptions
// @access  Private
const getSubscriptions = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = { user: req.user._id };
  if (status) {
    query.status = status;
  }

  const subscriptions = await Subscription.find(query)
    .populate('provider', 'businessName address phone coverImage')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Subscription.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, {
      subscriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Subscriptions retrieved successfully')
  );
});

// @desc    Get single subscription
// @route   GET /api/subscriptions/:id
// @access  Private
const getSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.params.id)
    .populate('provider', 'businessName address phone email coverImage menu weeklyMenu')
    .populate('user', 'name email phone');

  if (!subscription) {
    throw new ApiError(404, 'Subscription not found');
  }

  // Check access
  if (subscription.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    const provider = await TiffinProvider.findOne({ _id: subscription.provider._id, owner: req.user._id });
    if (!provider) {
      throw new ApiError(403, 'Not authorized to access this subscription');
    }
  }

  res.status(200).json(
    new ApiResponse(200, { subscription }, 'Subscription retrieved successfully')
  );
});

// @desc    Cancel subscription
// @route   PUT /api/subscriptions/:id/cancel
// @access  Private
const cancelSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    throw new ApiError(404, 'Subscription not found');
  }

  // Check ownership
  if (subscription.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to cancel this subscription');
  }

  if (subscription.status === 'cancelled') {
    throw new ApiError(400, 'Subscription already cancelled');
  }

  subscription.status = 'cancelled';
  await subscription.save();

  res.status(200).json(
    new ApiResponse(200, { subscription }, 'Subscription cancelled successfully')
  );
});

// @desc    Pause subscription
// @route   PUT /api/subscriptions/:id/pause
// @access  Private
const pauseSubscription = asyncHandler(async (req, res) => {
  const { pausedFrom, pausedUntil, reason } = req.body;
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    throw new ApiError(404, 'Subscription not found');
  }

  // Check ownership
  if (subscription.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized');
  }

  subscription.status = 'paused';
  subscription.pauseHistory.push({
    pausedFrom,
    pausedUntil,
    reason
  });
  await subscription.save();

  res.status(200).json(
    new ApiResponse(200, { subscription }, 'Subscription paused successfully')
  );
});

// @desc    Resume subscription
// @route   PUT /api/subscriptions/:id/resume
// @access  Private
const resumeSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    throw new ApiError(404, 'Subscription not found');
  }

  // Check ownership
  if (subscription.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized');
  }

  if (subscription.status !== 'paused') {
    throw new ApiError(400, 'Subscription is not paused');
  }

  subscription.status = 'active';
  await subscription.save();

  res.status(200).json(
    new ApiResponse(200, { subscription }, 'Subscription resumed successfully')
  );
});

// @desc    Get provider subscriptions
// @route   GET /api/subscriptions/provider/list
// @access  Private (Provider)
const getProviderSubscriptions = asyncHandler(async (req, res) => {
  const provider = await TiffinProvider.findOne({ owner: req.user._id });

  if (!provider) {
    throw new ApiError(404, 'Provider not found');
  }

  const { status, page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = { provider: provider._id };
  if (status) {
    query.status = status;
  }

  const subscriptions = await Subscription.find(query)
    .populate('user', 'name email phone address')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Subscription.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, {
      subscriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Provider subscriptions retrieved successfully')
  );
});

module.exports = {
  createSubscription,
  getSubscriptions,
  getSubscription,
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
  getProviderSubscriptions
};