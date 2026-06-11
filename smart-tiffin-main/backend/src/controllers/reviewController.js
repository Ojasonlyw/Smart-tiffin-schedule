// ============ src/controllers/reviewController.js ============
const Review = require('../models/Review');
const TiffinProvider = require('../models/TiffinProvider');
const Subscription = require('../models/Subscription');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const mongoose = require('mongoose');

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { provider, rating, comment, aspects, images } = req.body;

  // Check if provider exists
  const tiffinProvider = await TiffinProvider.findById(provider);
  if (!tiffinProvider) {
    throw new ApiError(404, 'Provider not found');
  }

  // Check if user has subscribed
  const subscription = await Subscription.findOne({
    user: req.user._id,
    provider,
    status: { $in: ['active', 'completed', 'cancelled'] }
  });

  const isVerifiedPurchase = !!subscription;

  // Check if review already exists
  const existingReview = await Review.findOne({
    user: req.user._id,
    provider
  });

  if (existingReview) {
    throw new ApiError(400, 'You have already reviewed this provider');
  }

  // Create review
  const review = await Review.create({
    user: req.user._id,
    provider,
    rating,
    comment,
    aspects,
    images,
    isVerifiedPurchase
  });

  // Update provider rating
  await tiffinProvider.updateRating();

  await review.populate('user', 'name avatar');

  res.status(201).json(
    new ApiResponse(201, { review }, 'Review created successfully')
  );
});

// @desc    Get provider reviews
// @route   GET /api/reviews/provider/:providerId
// @access  Public
const getProviderReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const reviews = await Review.find({ 
    provider: req.params.providerId,
    isReported: false 
  })
    .populate('user', 'name avatar')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Review.countDocuments({ 
    provider: req.params.providerId,
    isReported: false 
  });

  // Calculate rating breakdown
  const ratingStats = await Review.aggregate([
    { $match: { provider: new mongoose.Types.ObjectId(req.params.providerId) } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      reviews,
      ratingStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Reviews retrieved successfully')
  );
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  // Check ownership
  if (review.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to update this review');
  }

  review = await Review.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('user', 'name avatar');

  // Update provider rating
  const provider = await TiffinProvider.findById(review.provider);
  await provider.updateRating();

  res.status(200).json(
    new ApiResponse(200, { review }, 'Review updated successfully')
  );
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  // Check ownership or admin
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to delete this review');
  }

  const providerId = review.provider;
  await review.deleteOne();

  // Update provider rating
  const provider = await TiffinProvider.findById(providerId);
  await provider.updateRating();

  res.status(200).json(
    new ApiResponse(200, null, 'Review deleted successfully')
  );
});

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
const markHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  // Check if already marked
  const alreadyMarked = review.helpfulBy.includes(req.user._id);

  if (alreadyMarked) {
    // Remove from helpful
    review.helpfulBy = review.helpfulBy.filter(id => id.toString() !== req.user._id.toString());
    review.helpful = Math.max(0, review.helpful - 1);
  } else {
    // Add to helpful
    review.helpfulBy.push(req.user._id);
    review.helpful += 1;
  }

  await review.save();

  res.status(200).json(
    new ApiResponse(200, { review }, alreadyMarked ? 'Removed from helpful' : 'Marked as helpful')
  );
});

// @desc    Provider response to review
// @route   PUT /api/reviews/:id/response
// @access  Private (Provider)
const addProviderResponse = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  // Check if user owns the provider
  const provider = await TiffinProvider.findOne({
    _id: review.provider,
    owner: req.user._id
  });

  if (!provider) {
    throw new ApiError(403, 'Not authorized to respond to this review');
  }

  review.providerResponse = {
    comment: req.body.comment,
    respondedAt: new Date()
  };

  await review.save();
  await review.populate('user', 'name avatar');

  res.status(200).json(
    new ApiResponse(200, { review }, 'Response added successfully')
  );
});

module.exports = {
  createReview,
  getProviderReviews,
  updateReview,
  deleteReview,
  markHelpful,
  addProviderResponse
};

