// ============ src/controllers/mealPlanController.js ============
const MealPlan = require('../models/MealPlan');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create meal plan
// @route   POST /api/mealplans
// @access  Private
const createMealPlan = asyncHandler(async (req, res) => {
  const mealPlan = await MealPlan.create({
    ...req.body,
    user: req.user._id
  });

  await mealPlan.populate('meals.breakfast.provider meals.lunch.provider meals.dinner.provider', 'businessName');

  res.status(201).json(
    new ApiResponse(201, { mealPlan }, 'Meal plan created successfully')
  );
});

// @desc    Get user's meal plans
// @route   GET /api/mealplans
// @access  Private
const getMealPlans = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const mealPlans = await MealPlan.find({ user: req.user._id })
    .populate('meals.breakfast.provider meals.lunch.provider meals.dinner.provider', 'businessName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await MealPlan.countDocuments({ user: req.user._id });

  res.status(200).json(
    new ApiResponse(200, {
      mealPlans,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Meal plans retrieved successfully')
  );
});

// @desc    Get single meal plan
// @route   GET /api/mealplans/:id
// @access  Private
const getMealPlan = asyncHandler(async (req, res) => {
  const mealPlan = await MealPlan.findById(req.params.id)
    .populate('meals.breakfast.provider meals.lunch.provider meals.dinner.provider');

  if (!mealPlan) {
    throw new ApiError(404, 'Meal plan not found');
  }

  // Check ownership
  if (mealPlan.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to access this meal plan');
  }

  res.status(200).json(
    new ApiResponse(200, { mealPlan }, 'Meal plan retrieved successfully')
  );
});

// @desc    Update meal plan
// @route   PUT /api/mealplans/:id
// @access  Private
const updateMealPlan = asyncHandler(async (req, res) => {
  let mealPlan = await MealPlan.findById(req.params.id);

  if (!mealPlan) {
    throw new ApiError(404, 'Meal plan not found');
  }

  // Check ownership
  if (mealPlan.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to update this meal plan');
  }

  mealPlan = await MealPlan.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('meals.breakfast.provider meals.lunch.provider meals.dinner.provider');

  res.status(200).json(
    new ApiResponse(200, { mealPlan }, 'Meal plan updated successfully')
  );
});

// @desc    Delete meal plan
// @route   DELETE /api/mealplans/:id
// @access  Private
const deleteMealPlan = asyncHandler(async (req, res) => {
  const mealPlan = await MealPlan.findById(req.params.id);

  if (!mealPlan) {
    throw new ApiError(404, 'Meal plan not found');
  }

  // Check ownership
  if (mealPlan.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized to delete this meal plan');
  }

  await mealPlan.deleteOne();

  res.status(200).json(
    new ApiResponse(200, null, 'Meal plan deleted successfully')
  );
});

// @desc    Toggle favorite meal plan
// @route   PUT /api/mealplans/:id/favorite
// @access  Private
const toggleFavorite = asyncHandler(async (req, res) => {
  const mealPlan = await MealPlan.findById(req.params.id);

  if (!mealPlan) {
    throw new ApiError(404, 'Meal plan not found');
  }

  // Check ownership
  if (mealPlan.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Not authorized');
  }

  mealPlan.isFavorite = !mealPlan.isFavorite;
  await mealPlan.save();

  res.status(200).json(
    new ApiResponse(200, { mealPlan }, `Meal plan ${mealPlan.isFavorite ? 'added to' : 'removed from'} favorites`)
  );
});

module.exports = {
  createMealPlan,
  getMealPlans,
  getMealPlan,
  updateMealPlan,
  deleteMealPlan,
  toggleFavorite
};

