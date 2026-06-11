// ============ src/routes/userRoutes.js ============
const express = require('express');
const User = require('../models/User');
const TiffinProvider = require('../models/TiffinProvider');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// @desc    Get user profile
// @route   GET /api/users/profile
router.get('/profile', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json(new ApiResponse(200, { user }, 'Profile retrieved'));
}));

// @desc    Update user profile
// @route   PUT /api/users/profile
router.put('/profile', asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'phone', 'address', 'preferences', 'avatar'];
  const updates = {};
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true
  });

  res.status(200).json(new ApiResponse(200, { user }, 'Profile updated'));
}));

// @desc    Add/Remove favorite provider
// @route   PUT /api/users/favorites/:providerId
router.put('/favorites/:providerId', asyncHandler(async (req, res) => {
  const provider = await TiffinProvider.findById(req.params.providerId);
  
  if (!provider) {
    throw new ApiError(404, 'Provider not found');
  }

  const user = await User.findById(req.user._id);
  const index = user.favorites.indexOf(req.params.providerId);

  if (index > -1) {
    user.favorites.splice(index, 1);
    await user.save();
    res.status(200).json(new ApiResponse(200, { user }, 'Removed from favorites'));
  } else {
    user.favorites.push(req.params.providerId);
    await user.save();
    res.status(200).json(new ApiResponse(200, { user }, 'Added to favorites'));
  }
}));

// @desc    Get favorite providers
// @route   GET /api/users/favorites
router.get('/favorites', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('favorites');
  res.status(200).json(new ApiResponse(200, { favorites: user.favorites }, 'Favorites retrieved'));
}));

module.exports = router;

