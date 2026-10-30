import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

// Thunks
export const createRFQ = createAsyncThunk(
  'rfq/createRFQ',
  async (rfqData, { rejectWithValue }) => {
    try {
      const response = await API.post('/rfqs', rfqData);
      return response.data.rfq;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit RFQ');
    }
  }
);

export const fetchRFQs = createAsyncThunk(
  'rfq/fetchRFQs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await API.get('/rfqs', { params });
      return response.data.rfqs;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load RFQs');
    }
  }
);

export const fetchRFQById = createAsyncThunk(
  'rfq/fetchRFQById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.get(`/rfqs/${id}`);
      return response.data.rfq;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load RFQ details');
    }
  }
);

export const submitCounterOffer = createAsyncThunk(
  'rfq/submitCounterOffer',
  async ({ id, pricePerUnit, quantity, leadTimeDays, notes }, { rejectWithValue }) => {
    try {
      const response = await API.post(`/rfqs/${id}/counter`, {
        pricePerUnit,
        quantity,
        leadTimeDays,
        notes,
      });
      return response.data.rfq;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit counter offer');
    }
  }
);

export const acceptRFQOffer = createAsyncThunk(
  'rfq/acceptRFQOffer',
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.post(`/rfqs/${id}/accept`);
      return response.data.rfq;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to accept offer');
    }
  }
);

export const fetchChatMessages = createAsyncThunk(
  'rfq/fetchChatMessages',
  async (rfqId, { rejectWithValue }) => {
    try {
      const response = await API.get(`/chat/rfq/${rfqId}`);
      return response.data.messages;
    } catch (error) {
      return rejectWithValue('Failed to load chat messages');
    }
  }
);

const rfqSlice = createSlice({
  name: 'rfq',
  initialState: {
    items: [],
    currentRFQ: null,
    messages: [],
    loading: false,
    error: null,
    activeTypingUser: null,
  },
  reducers: {
    addSocketMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateRFQFromSocket: (state, action) => {
      if (state.currentRFQ && state.currentRFQ._id === action.payload.rfqId) {
        state.currentRFQ.status = action.payload.status;
        state.currentRFQ.currentOfferedPrice = action.payload.currentOfferedPrice;
      }
    },
    setTypingIndicator: (state, action) => {
      state.activeTypingUser = action.payload;
    },
    clearCurrentRFQ: (state) => {
      state.currentRFQ = null;
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch RFQs
      .addCase(fetchRFQs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRFQs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRFQs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single RFQ
      .addCase(fetchRFQById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRFQById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRFQ = action.payload;
      })
      // Submit counter offer
      .addCase(submitCounterOffer.fulfilled, (state, action) => {
        state.currentRFQ = action.payload;
      })
      // Accept offer
      .addCase(acceptRFQOffer.fulfilled, (state, action) => {
        state.currentRFQ = action.payload;
      })
      // Fetch Chat
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
      });
  },
});

export const {
  addSocketMessage,
  updateRFQFromSocket,
  setTypingIndicator,
  clearCurrentRFQ,
} = rfqSlice.actions;

export default rfqSlice.reducer;
