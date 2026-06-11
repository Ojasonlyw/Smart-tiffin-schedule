// ============ src/services/aiService.js ============
const MealPlan = require('../models/MealPlan');
const TiffinProvider = require('../models/TiffinProvider');

// Get AI-based meal suggestions
const getMealSuggestions = async (userId, preferences) => {
  try {
    // Get user's past meal plans
    const pastPlans = await MealPlan.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('meals.breakfast.provider meals.lunch.provider meals.dinner.provider');

    // Extract frequently chosen meals
    const mealFrequency = {};
    const providerFrequency = {};

    pastPlans.forEach(plan => {
      plan.meals.forEach(day => {
        ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
          if (day[mealType]?.name) {
            const mealName = day[mealType].name;
            mealFrequency[mealName] = (mealFrequency[mealName] || 0) + 1;

            if (day[mealType].provider) {
              const providerId = day[mealType].provider._id.toString();
              providerFrequency[providerId] = (providerFrequency[providerId] || 0) + 1;
            }
          }
        });
      });
    });

    // Sort by frequency
    const topMeals = Object.entries(mealFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name);

    const topProviders = Object.entries(providerFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    // Get current week's meals to avoid duplicates
    const currentWeekStart = new Date();
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
    
    const currentWeekPlan = await MealPlan.findOne({
      user: userId,
      weekStartDate: { $gte: currentWeekStart }
    });

    const plannedMeals = new Set();
    if (currentWeekPlan) {
      currentWeekPlan.meals.forEach(day => {
        ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
          if (day[mealType]?.name) {
            plannedMeals.add(day[mealType].name);
          }
        });
      });
    }

    // Filter suggestions based on dietary preferences
    const dietaryType = preferences?.dietaryType || 'veg';
    
    // Get recommended providers
    const recommendedProviders = await TiffinProvider.find({
      _id: { $in: topProviders },
      isApproved: true,
      isActive: true,
      specialties: { $in: [dietaryType === 'jain' ? 'Jain-Friendly' : 'Homemade'] }
    }).limit(5);

    // Generate meal suggestions
    const suggestions = {
      breakfast: topMeals.filter(meal => !plannedMeals.has(meal)).slice(0, 3),
      lunch: topMeals.filter(meal => !plannedMeals.has(meal)).slice(3, 6),
      dinner: topMeals.filter(meal => !plannedMeals.has(meal)).slice(6, 9),
      recommendedProviders
    };

    return suggestions;
  } catch (error) {
    console.error('AI Suggestion Error:', error);
    return {
      breakfast: ['Poha', 'Upma', 'Idli'],
      lunch: ['Dal Rice', 'Roti Sabzi', 'Khichdi'],
      dinner: ['Chapati Curry', 'Rice Dal', 'Mixed Veg'],
      recommendedProviders: []
    };
  }
};

// Recommend providers based on preferences
const recommendProviders = async (userId, location, preferences) => {
  try {
    const query = {
      isApproved: true,
      isActive: true
    };

    // Filter by dietary preferences
    if (preferences?.dietaryType) {
      const specialtyMap = {
        'veg': 'Homemade',
        'jain': 'Jain-Friendly',
        'vegan': 'Vegan',
        'non-veg': 'High-Protein'
      };
      
      if (specialtyMap[preferences.dietaryType]) {
        query.specialties = { $in: [specialtyMap[preferences.dietaryType]] };
      }
    }

    // Filter by cuisine preferences
    if (preferences?.cuisinePreferences?.length > 0) {
      query.cuisines = { $in: preferences.cuisinePreferences };
    }

    // Location-based filtering
    if (location?.lat && location?.lng) {
      query['address.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [location.lng, location.lat]
          },
          $maxDistance: 5000 // 5km radius
        }
      };
    }

    const providers = await TiffinProvider.find(query)
      .sort({ 'ratings.average': -1 })
      .limit(10);

    return providers;
  } catch (error) {
    console.error('Provider Recommendation Error:', error);
    return [];
  }
};

module.exports = {
  getMealSuggestions,
  recommendProviders
};

