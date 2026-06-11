// ============ src/services/inventoryService.js ============
const Subscription = require('../models/Subscription');
const TiffinProvider = require('../models/TiffinProvider');

// Generate inventory list for provider
const generateInventoryList = async (providerId, startDate, endDate) => {
  try {
    // Get all active subscriptions for the provider
    const subscriptions = await Subscription.find({
      provider: providerId,
      status: 'active',
      startDate: { $lte: endDate },
      endDate: { $gte: startDate }
    });

    // Get provider details with menu
    const provider = await TiffinProvider.findById(providerId);

    if (!provider) {
      throw new Error('Provider not found');
    }

    // Calculate meal counts
    const mealCounts = {
      breakfast: 0,
      lunch: 0,
      dinner: 0
    };

    subscriptions.forEach(sub => {
      if (sub.mealType === 'fullDay') {
        mealCounts.breakfast++;
        mealCounts.lunch++;
        mealCounts.dinner++;
      } else {
        mealCounts[sub.mealType]++;
      }
    });

    // Calculate days in range
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));

    // Generate inventory based on menu items (simplified example)
    const inventory = {
      period: {
        startDate,
        endDate,
        days
      },
      mealCounts,
      estimatedIngredients: {
        rice: { quantity: (mealCounts.lunch + mealCounts.dinner) * days * 0.15, unit: 'kg' },
        dal: { quantity: (mealCounts.lunch + mealCounts.dinner) * days * 0.1, unit: 'kg' },
        vegetables: { quantity: (mealCounts.lunch + mealCounts.dinner) * days * 0.2, unit: 'kg' },
        oil: { quantity: (mealCounts.breakfast + mealCounts.lunch + mealCounts.dinner) * days * 0.05, unit: 'liters' },
        spices: { quantity: days * 0.5, unit: 'kg' },
        flour: { quantity: (mealCounts.lunch + mealCounts.dinner) * days * 0.1, unit: 'kg' }
      },
      totalSubscribers: subscriptions.length,
      totalMeals: (mealCounts.breakfast + mealCounts.lunch + mealCounts.dinner) * days
    };

    return inventory;
  } catch (error) {
    console.error('Inventory Generation Error:', error);
    throw error;
  }
};

// Optimize inventory based on historical data
const optimizeInventory = async (providerId) => {
  try {
    // Get past 30 days subscriptions
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const subscriptions = await Subscription.find({
      provider: providerId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Calculate average daily meals
    const avgDailyMeals = {
      breakfast: 0,
      lunch: 0,
      dinner: 0
    };

    subscriptions.forEach(sub => {
      const days = Math.ceil((new Date(sub.endDate) - new Date(sub.startDate)) / (1000 * 60 * 60 * 24));
      
      if (sub.mealType === 'fullDay') {
        avgDailyMeals.breakfast += days;
        avgDailyMeals.lunch += days;
        avgDailyMeals.dinner += days;
      } else {
        avgDailyMeals[sub.mealType] += days;
      }
    });

    // Calculate per day average
    Object.keys(avgDailyMeals).forEach(mealType => {
      avgDailyMeals[mealType] = Math.ceil(avgDailyMeals[mealType] / 30);
    });

    // Generate weekly suggestions
    const weeklySuggestions = {
      averageDailyMeals: avgDailyMeals,
      weeklyIngredients: {
        rice: { quantity: (avgDailyMeals.lunch + avgDailyMeals.dinner) * 7 * 0.15, unit: 'kg' },
        dal: { quantity: (avgDailyMeals.lunch + avgDailyMeals.dinner) * 7 * 0.1, unit: 'kg' },
        vegetables: { quantity: (avgDailyMeals.lunch + avgDailyMeals.dinner) * 7 * 0.2, unit: 'kg' },
        oil: { quantity: (avgDailyMeals.breakfast + avgDailyMeals.lunch + avgDailyMeals.dinner) * 7 * 0.05, unit: 'liters' }
      },
      wastageReduction: '15% reduction possible with accurate planning'
    };

    return weeklySuggestions;
  } catch (error) {
    console.error('Inventory Optimization Error:', error);
    throw error;
  }
};

module.exports = {
  generateInventoryList,
  optimizeInventory
};