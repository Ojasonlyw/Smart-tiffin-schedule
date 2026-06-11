// ============ src/controllers/paymentController.js ============
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Subscription = require('../models/Subscription');
const TiffinProvider = require('../models/TiffinProvider');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create payment order
// @route   POST /api/payments/create-order
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.body;

  const subscription = await Subscription.findById(subscriptionId);

  if (!subscription) {
    throw new ApiError(404, 'Subscription not found');
  }

  // Check ownership
  if (subscription.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized');
  }

  // Create Razorpay order
  const options = {
    amount: subscription.amount * 100, // Amount in paise
    currency: 'INR',
    receipt: `sub_${subscriptionId}`,
    notes: {
      subscriptionId: subscriptionId,
      userId: req.user._id.toString()
    }
  };

  const order = await razorpay.orders.create(options);

  res.status(200).json(
    new ApiResponse(200, {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    }, 'Payment order created successfully')
  );
});

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentId, signature, subscriptionId } = req.body;

  // Verify signature
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  if (generatedSignature !== signature) {
    throw new ApiError(400, 'Payment verification failed');
  }

  // Update subscription
  const subscription = await Subscription.findById(subscriptionId);

  if (!subscription) {
    throw new ApiError(404, 'Subscription not found');
  }

  subscription.paymentDetails = {
    orderId,
    paymentId,
    signature,
    method: 'razorpay',
    paidAt: new Date()
  };
  subscription.status = 'active';

  await subscription.save();

  // Update provider subscriber count
  await TiffinProvider.findByIdAndUpdate(
    subscription.provider,
    { $inc: { totalSubscribers: 1 } }
  );

  res.status(200).json(
    new ApiResponse(200, { subscription }, 'Payment verified successfully')
  );
});

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
const getPaymentHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const subscriptions = await Subscription.find({
    user: req.user._id,
    'paymentDetails.paidAt': { $exists: true }
  })
    .populate('provider', 'businessName')
    .sort({ 'paymentDetails.paidAt': -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Subscription.countDocuments({
    user: req.user._id,
    'paymentDetails.paidAt': { $exists: true }
  });

  res.status(200).json(
    new ApiResponse(200, {
      payments: subscriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Payment history retrieved successfully')
  );
});

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentHistory
};