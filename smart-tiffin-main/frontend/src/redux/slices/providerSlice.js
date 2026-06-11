// ============ src/redux/slices/providerSlice.js ============
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { providerApi } from '../../api/providerApi';

export const fetchProviders = createAsyncThunk(
  'provider/fetchProviders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await providerApi.getProviders(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchProvider = createAsyncThunk(
  'provider/fetchProvider',
  async (id, { rejectWithValue }) => {
    try {
      const response = await providerApi.getProvider(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createProvider = createAsyncThunk(
  'provider/createProvider',
  async (data, { rejectWithValue }) => {
    try {
      const response = await providerApi.createProvider(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchNearbyProviders = createAsyncThunk(
  'provider/fetchNearbyProviders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await providerApi.getNearbyProviders(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const providerSlice = createSlice({
  name: 'provider',
  initialState: {
    providers: [],
    currentProvider: null,
    nearbyProviders: [],
    pagination: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProvider: (state) => {
      state.currentProvider = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProviders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProviders.fulfilled, (state, action) => {
        state.loading = false;
        state.providers = action.payload.providers;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProviders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProvider.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProvider.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProvider = action.payload.provider;
      })
      .addCase(fetchProvider.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchNearbyProviders.fulfilled, (state, action) => {
        state.nearbyProviders = action.payload.providers;
      })
      .addCase(createProvider.fulfilled, (state, action) => {
        state.currentProvider = action.payload.provider;
      });
  },
});

export const { clearError, clearCurrentProvider } = providerSlice.actions;
export default providerSlice.reducer;

