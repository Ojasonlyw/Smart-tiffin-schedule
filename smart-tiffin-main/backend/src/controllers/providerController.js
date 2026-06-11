const TiffinProvider = require('../models/TiffinProvider');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { calculateDistance } = require('../utils/helpers');

// @desc    Get all providers with filters
// @route   GET /api/providers
// @access  Public
const getProviders = asyncHandler(async (req, res) => {
  const {
    search,
    city,
    cuisine,
    specialty,
    minPrice,
    maxPrice,
    minRating,
    lat,
    lng,
    radius = 10,
    page = 1,
    limit = 10
  } = req.query;

  // Build query
  const query = { isApproved: true, isActive: true };

  // Search by business name
  if (search) {
    query.businessName = { $regex: search, $options: 'i' };
  }

  // Filter by city
  if (city) {
    query['address.city'] = { $regex: city, $options: 'i' };
  }

  // Filter by cuisine
  if (cuisine) {
    query.cuisines = { $in: [cuisine] };
  }

  // Filter by specialty
  if (specialty) {
    query.specialties = { $in: [specialty] };
  }

  // Filter by rating
  if (minRating) {
    query['ratings.average'] = { $gte: parseFloat(minRating) };
  }

  // Geospatial query
  if (lat && lng) {
    query['address.coordinates'] = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: parseInt(radius) * 1000 // Convert km to meters
      }
    };
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query
  const providers = await TiffinProvider.find(query)
    .populate('owner', 'name email phone')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ 'ratings.average': -1, createdAt: -1 });

  // Get total count
  const total = await TiffinProvider.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, {
      providers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Providers retrieved successfully')
  );
});

// @desc    Get single provider
// @route   GET /api/providers/:id
// @access  Public
const getProvider = asyncHandler(async (req, res) => {
  const provider = await TiffinProvider.findById(req.params.id)
    .populate('owner', 'name email phone avatar');

  if (!provider) {
    throw new ApiError(404, 'Provider not found');
  }

  res.status(200).json(
    new ApiResponse(200, { provider }, 'Provider retrieved successfully')
  );
});

// @desc    Create new provider listing
// @route   POST /api/providers
// @access  Private (Provider role)
const createProvider = asyncHandler(async (req, res) => {
  // Check if user already has a provider listing
  const existingProvider = await TiffinProvider.findOne({ owner: req.user._id });
  if (existingProvider) {
    throw new ApiError(400, 'You already have a provider listing');
  }

  // Create provider
  const provider = await TiffinProvider.create({
    ...req.body,
    owner: req.user._id
  });

  // Update user role to provider if not already
  if (req.user.role !== 'provider') {
    await User.findByIdAndUpdate(req.user._id, { role: 'provider' });
  }

  res.status(201).json(
    new ApiResponse(201, { provider }, 'Provider listing created successfully. Awaiting admin approval.')
  );
});

// @desc    Update provider
// @route   PUT /api/providers/:id
// @access  Private (Owner)
const updateProvider = asyncHandler(async (req, res) => {
  let provider = await TiffinProvider.findById(req.params.id);

  if (!provider) {
    throw new ApiError(404, 'Provider not found');
  }

  // Check ownership
  if (provider.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to update this provider');
  }

  // Update provider
  provider = await TiffinProvider.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json(
    new ApiResponse(200, { provider }, 'Provider updated successfully')
  );
});

// @desc    Delete provider
// @route   DELETE /api/providers/:id
// @access  Private (Owner/Admin)
const deleteProvider = asyncHandler(async (req, res) => {
  const provider = await TiffinProvider.findById(req.params.id);

  if (!provider) {
    throw new ApiError(404, 'Provider not found');
  }

  // Check ownership
  if (provider.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to delete this provider');
  }

  await provider.deleteOne();

  res.status(200).json(
    new ApiResponse(200, null, 'Provider deleted successfully')
  );
});

// @desc    Get my provider listing
// @route   GET /api/providers/me/listing
// @access  Private (Provider)
const getMyProvider = asyncHandler(async (req, res) => {
  const provider = await TiffinProvider.findOne({ owner: req.user._id });

  if (!provider) {
    throw new ApiError(404, 'You do not have a provider listing');
  }

  res.status(200).json(
    new ApiResponse(200, { provider }, 'Provider retrieved successfully')
  );
});

// @desc    Update menu
// @route   PUT /api/providers/:id/menu
// @access  Private (Owner)
const updateMenu = asyncHandler(async (req, res) => {
  const provider = await TiffinProvider.findById(req.params.id);

  if (!provider) {
    throw new ApiError(404, 'Provider not found');
  }

  // Check ownership
  if (provider.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to update this menu');
  }

  // Update menu
  provider.menu = req.body.menu;
  await provider.save();

  res.status(200).json(
    new ApiResponse(200, { provider }, 'Menu updated successfully')
  );
});

// @desc    Update weekly menu
// @route   PUT /api/providers/:id/weekly-menu
// @access  Private (Owner)
const updateWeeklyMenu = asyncHandler(async (req, res) => {
  const provider = await TiffinProvider.findById(req.params.id);

  if (!provider) {
    throw new ApiError(404, 'Provider not found');
  }

  // Check ownership
  if (provider.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to update this menu');
  }

  // Update weekly menu
  provider.weeklyMenu = req.body.weeklyMenu;
  await provider.save();

  res.status(200).json(
    new ApiResponse(200, { provider }, 'Weekly menu updated successfully')
  );
});

// @desc    Update pricing
// @route   PUT /api/providers/:id/pricing
// @access  Private (Owner)
const updatePricing = asyncHandler(async (req, res) => {
  const provider = await TiffinProvider.findById(req.params.id);

  if (!provider) {
    throw new ApiError(404, 'Provider not found');
  }

  // Check ownership
  if (provider.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to update pricing');
  }

  // Update pricing
  provider.pricing = req.body.pricing;
  await provider.save();

  res.status(200).json(
    new ApiResponse(200, { provider }, 'Pricing updated successfully')
  );
});

// @desc    Get nearby providers
// @route   GET /api/providers/nearby
// @access  Public
const getNearbyProviders = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 5, limit = 20 } = req.query;

  if (!lat || !lng) {
    throw new ApiError(400, 'Please provide latitude and longitude');
  }

  const providers = await TiffinProvider.find({
    isApproved: true,
    isActive: true,
    'address.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: parseInt(radius) * 1000
      }
    }
  })
    .limit(parseInt(limit))
    .populate('owner', 'name email phone');

  res.status(200).json(
    new ApiResponse(200, { providers, count: providers.length }, 'Nearby providers retrieved successfully')
  );
});

module.exports = {
  getProviders,
  getProvider,
  createProvider,
  updateProvider,
  deleteProvider,
  getMyProvider,
  updateMenu,
  updateWeeklyMenu,
  updatePricing,
  getNearbyProviders
};
