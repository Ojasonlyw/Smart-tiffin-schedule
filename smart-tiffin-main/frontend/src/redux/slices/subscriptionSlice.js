import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { subscriptionApi } from '../../api/subscriptionApi';

export const fetchSubscriptions = createAsyncThunk(
  'subscription/fetchSubscriptions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.getSubscriptions(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createSubscription = createAsyncThunk(
  'subscription/createSubscription',
  async (data, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.createSubscription(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscription/cancelSubscription',
  async (id, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.cancelSubscription(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const pauseSubscription = createAsyncThunk(
  'subscription/pauseSubscription',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.pauseSubscription(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const resumeSubscription = createAsyncThunk(
  'subscription/resumeSubscription',
  async (id, { rejectWithValue }) => {
    try {
      const response = await subscriptionApi.resumeSubscription(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: {
    subscriptions: [],
    currentSubscription: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = action.payload.subscriptions;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.subscriptions.unshift(action.payload.subscription);
        state.currentSubscription = action.payload.subscription;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        const index = state.subscriptions.findIndex(
          (sub) => sub._id === action.payload.subscription._id
        );
        if (index !== -1) {
          state.subscriptions[index] = action.payload.subscription;
        }
      })
      .addCase(pauseSubscription.fulfilled, (state, action) => {
        const index = state.subscriptions.findIndex(
          (sub) => sub._id === action.payload.subscription._id
        );
        if (index !== -1) {
          state.subscriptions[index] = action.payload.subscription;
        }
      })
      .addCase(resumeSubscription.fulfilled, (state, action) => {
        const index = state.subscriptions.findIndex(
          (sub) => sub._id === action.payload.subscription._id
        );
        if (index !== -1) {
          state.subscriptions[index] = action.payload.subscription;
        }
      });
  },
});

export const { clearError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;