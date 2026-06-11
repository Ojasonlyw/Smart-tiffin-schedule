// ============ src/utils/constants.js ============
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const USER_ROLES = {
  USER: 'user',
  PROVIDER: 'provider',
  ADMIN: 'admin',
};

export const MEAL_TYPES = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  FULL_DAY: 'fullDay',
};

export const PLAN_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
};

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  COMPLETED: 'completed',
};

export const DIETARY_TYPES = {
  VEG: 'veg',
  NON_VEG: 'non-veg',
  JAIN: 'jain',
  VEGAN: 'vegan',
};

export const CUISINES = [
  'North Indian',
  'South Indian',
  'Chinese',
  'Continental',
  'Maharashtrian',
  'Gujarati',
  'Punjabi',
  'Bengali',
  'Other',
];

export const SPECIALTIES = [
  'Jain-Friendly',
  'Homemade',
  'Vegan',
  'Organic',
  'High-Protein',
  'Low-Calorie',
];

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};
