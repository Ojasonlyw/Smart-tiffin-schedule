// ============ src/redux/slices/reviewSlice.js ============
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewApi } from '../../api/reviewApi';

export const fetchProviderReviews = createAsyncThunk(
  'review/fetchProviderReviews',
  async ({ providerId, params }, { rejectWithValue }) => {
    try {
      const response = await reviewApi.getProviderReviews(providerId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createReview = createAsyncThunk(
  'review/createReview',
  async (data, { rejectWithValue }) => {
    try {
      const response = await reviewApi.createReview(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateReview = createAsyncThunk(
  'review/updateReview',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await reviewApi.updateReview(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteReview = createAsyncThunk(
  'review/deleteReview',
  async (id, { rejectWithValue }) => {
    try {
      await reviewApi.deleteReview(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const reviewSlice = createSlice({
  name: 'review',
  initialState: {
    reviews: [],
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
      .addCase(fetchProviderReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProviderReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.reviews;
      })
      .addCase(fetchProviderReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.reviews.unshift(action.payload.review);
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        const index = state.reviews.findIndex(
          (review) => review._id === action.payload.review._id
        );
        if (index !== -1) {
          state.reviews[index] = action.payload.review;
        }
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter(
          (review) => review._id !== action.payload
        );
      });
  },
});

export const { clearError } = reviewSlice.actions;
export default reviewSlice.reducer;