import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

// Check local storage for initial auth state
const token = localStorage.getItem('bulkconnect_token');
const savedUser = localStorage.getItem('bulkconnect_user')
  ? JSON.parse(localStorage.getItem('bulkconnect_user'))
  : null;

// Async Thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await API.post('/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('bulkconnect_token', token);
      localStorage.setItem('bulkconnect_user', JSON.stringify(user));
      return { token, user };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await API.post('/auth/register', formData);
      const { token, user } = response.data;
      localStorage.setItem('bulkconnect_token', token);
      localStorage.setItem('bulkconnect_user', JSON.stringify(user));
      return { token, user };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const loadCurrentUser = createAsyncThunk(
  'auth/loadMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/auth/me');
      localStorage.setItem('bulkconnect_user', JSON.stringify(response.data.user));
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load user profile');
    }
  }
);

export const uploadCompanyDocument = createAsyncThunk(
  'auth/uploadDocument',
  async ({ formData }, { rejectWithValue }) => {
    try {
      const response = await API.post('/companies/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.company;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload document');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: token || null,
    user: savedUser || null,
    isAuthenticated: !!token,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('bulkconnect_token');
      localStorage.removeItem('bulkconnect_user');
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    setDemoUser: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      localStorage.setItem('bulkconnect_token', token);
      localStorage.setItem('bulkconnect_user', JSON.stringify(user));
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Load Current User
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      // Upload Document
      .addCase(uploadCompanyDocument.fulfilled, (state, action) => {
        if (state.user) {
          state.user.company = action.payload;
          localStorage.setItem('bulkconnect_user', JSON.stringify(state.user));
        }
      });
  },
});

export const { logout, clearAuthError, setDemoUser } = authSlice.actions;
export default authSlice.reducer;
