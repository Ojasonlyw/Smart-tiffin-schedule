// ============ src/models/Subscription.js ============
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TiffinProvider',
    required: true
  },
  planType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'fullDay'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'paused', 'cancelled', 'expired', 'completed'],
    default: 'pending'
  },
  paymentDetails: {
    orderId: String,
    paymentId: String,
    signature: String,
    method: String,
    paidAt: Date
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  deliveryInstructions: String,
  autoRenew: {
    type: Boolean,
    default: false
  },
  pauseHistory: [{
    pausedFrom: Date,
    pausedUntil: Date,
    reason: String
  }],
  mealsDelivered: {
    type: Number,
    default: 0
  },
  totalMeals: Number
}, {
  timestamps: true
});

// Calculate end date based on plan type
subscriptionSchema.pre('save', function(next) {
  if (this.isNew && this.startDate && !this.endDate) {
    const start = new Date(this.startDate);
    let endDate = new Date(start);
    
    switch(this.planType) {
      case 'daily':
        endDate.setDate(start.getDate() + 1);
        this.totalMeals = this.mealType === 'fullDay' ? 3 : 1;
        break;
      case 'weekly':
        endDate.setDate(start.getDate() + 7);
        this.totalMeals = this.mealType === 'fullDay' ? 21 : 7;
        break;
      case 'monthly':
        endDate.setMonth(start.getMonth() + 1);
        this.totalMeals = this.mealType === 'fullDay' ? 90 : 30;
        break;
    }
    
    this.endDate = endDate;
  }
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);

