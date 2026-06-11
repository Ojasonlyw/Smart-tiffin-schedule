// ============ src/redux/store.js ============
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import providerReducer from './slices/providerSlice';
import mealPlanReducer from './slices/mealPlanSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import reviewReducer from './slices/reviewSlice';
import chatReducer from './slices/chatSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    provider: providerReducer,
    mealPlan: mealPlanReducer,
    subscription: subscriptionReducer,
    review: reviewReducer,
    chat: chatReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

