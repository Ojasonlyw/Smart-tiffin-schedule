// ============ src/models/MealPlan.js ============
const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planName: {
    type: String,
    required: true,
    trim: true
  },
  weekStartDate: {
    type: Date,
    required: true
  },
  meals: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    breakfast: {
      name: String,
      provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TiffinProvider'
      },
      isCompleted: {
        type: Boolean,
        default: false
      }
    },
    lunch: {
      name: String,
      provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TiffinProvider'
      },
      isCompleted: {
        type: Boolean,
        default: false
      }
    },
    dinner: {
      name: String,
      provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TiffinProvider'
      },
      isCompleted: {
        type: Boolean,
        default: false
      }
    }
  }],
  isFavorite: {
    type: Boolean,
    default: false
  },
  totalMealsPlanned: {
    type: Number,
    default: 0
  },
  totalMealsCompleted: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate totals before saving
mealPlanSchema.pre('save', function(next) {
  let planned = 0;
  let completed = 0;
  
  this.meals.forEach(meal => {
    if (meal.breakfast?.name) {
      planned++;
      if (meal.breakfast.isCompleted) completed++;
    }
    if (meal.lunch?.name) {
      planned++;
      if (meal.lunch.isCompleted) completed++;
    }
    if (meal.dinner?.name) {
      planned++;
      if (meal.dinner.isCompleted) completed++;
    }
  });
  
  this.totalMealsPlanned = planned;
  this.totalMealsCompleted = completed;
  next();
});

module.exports = mongoose.model('MealPlan', mealPlanSchema);

