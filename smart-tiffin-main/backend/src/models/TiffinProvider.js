const mongoose = require('mongoose');

const tiffinProviderSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    }
  },
  images: [{
    url: String,
    caption: String
  }],
  coverImage: String,
  cuisines: [{
    type: String,
    enum: ['North Indian', 'South Indian', 'Chinese', 'Continental', 'Maharashtrian', 'Gujarati', 'Punjabi', 'Bengali', 'Other']
  }],
  specialties: [{
    type: String,
    enum: ['Jain-Friendly', 'Homemade', 'Vegan', 'Organic', 'High-Protein', 'Low-Calorie']
  }],
  menu: {
    breakfast: [{
      name: String,
      description: String,
      price: Number,
      isAvailable: {
        type: Boolean,
        default: true
      }
    }],
    lunch: [{
      name: String,
      description: String,
      price: Number,
      isAvailable: {
        type: Boolean,
        default: true
      }
    }],
    dinner: [{
      name: String,
      description: String,
      price: Number,
      isAvailable: {
        type: Boolean,
        default: true
      }
    }]
  },
  weeklyMenu: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    meals: {
      breakfast: String,
      lunch: String,
      dinner: String
    }
  }],
  pricing: {
    daily: {
      breakfast: Number,
      lunch: Number,
      dinner: Number,
      fullDay: Number
    },
    weekly: {
      breakfast: Number,
      lunch: Number,
      dinner: Number,
      fullDay: Number
    },
    monthly: {
      breakfast: Number,
      lunch: Number,
      dinner: Number,
      fullDay: Number
    }
  },
  availability: {
    breakfast: {
      type: Boolean,
      default: true
    },
    lunch: {
      type: Boolean,
      default: true
    },
    dinner: {
      type: Boolean,
      default: true
    }
  },
  timings: {
    breakfast: {
      from: String,
      to: String
    },
    lunch: {
      from: String,
      to: String
    },
    dinner: {
      from: String,
      to: String
    }
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  totalSubscribers: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  documents: {
    fssaiLicense: String,
    gstNumber: String,
    panCard: String
  }
}, {
  timestamps: true
});

// Index for geospatial queries
tiffinProviderSchema.index({ 'address.coordinates': '2dsphere' });

// Method to calculate average rating
tiffinProviderSchema.methods.updateRating = async function(newRating) {
  const Review = mongoose.model('Review');
  const reviews = await Review.find({ provider: this._id });
  
  const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
  this.ratings.average = reviews.length > 0 ? totalRatings / reviews.length : 0;
  this.ratings.count = reviews.length;
  
  await this.save();
};

module.exports = mongoose.model('TiffinProvider', tiffinProviderSchema);
