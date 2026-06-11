// ============ src/redux/slices/mealPlanSlice.js ============
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mealPlanApi } from '../../api/mealPlanApi';

export const fetchMealPlans = createAsyncThunk(
  'mealPlan/fetchMealPlans',
  async (params, { rejectWithValue }) => {
    try {
      const response = await mealPlanApi.getMealPlans(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createMealPlan = createAsyncThunk(
  'mealPlan/createMealPlan',
  async (data, { rejectWithValue }) => {
    try {
      const response = await mealPlanApi.createMealPlan(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateMealPlan = createAsyncThunk(
  'mealPlan/updateMealPlan',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await mealPlanApi.updateMealPlan(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteMealPlan = createAsyncThunk(
  'mealPlan/deleteMealPlan',
  async (id, { rejectWithValue }) => {
    try {
      await mealPlanApi.deleteMealPlan(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const mealPlanSlice = createSlice({
  name: 'mealPlan',
  initialState: {
    mealPlans: [],
    currentMealPlan: null,
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentMealPlan: (state, action) => {
      state.currentMealPlan = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMealPlans.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMealPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.mealPlans = action.payload.mealPlans;
      })
      .addCase(fetchMealPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createMealPlan.fulfilled, (state, action) => {
        state.mealPlans.unshift(action.payload.mealPlan);
        state.currentMealPlan = action.payload.mealPlan;
      })
      .addCase(updateMealPlan.fulfilled, (state, action) => {
        const index = state.mealPlans.findIndex(
          (plan) => plan._id === action.payload.mealPlan._id
        );
        if (index !== -1) {
          state.mealPlans[index] = action.payload.mealPlan;
        }
        state.currentMealPlan = action.payload.mealPlan;
      })
      .addCase(deleteMealPlan.fulfilled, (state, action) => {
        state.mealPlans = state.mealPlans.filter(
          (plan) => plan._id !== action.payload
        );
      });
  },
});

export const { setCurrentMealPlan, clearError } = mealPlanSlice.actions;
export default mealPlanSlice.reducer;

