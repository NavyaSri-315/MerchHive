import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

// Thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await API.get('/products', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.get(`/products/${id}`);
      return response.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Product not found');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/admin/categories');
      return response.data.categories;
    } catch (error) {
      return rejectWithValue('Failed to load categories');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await API.post('/products', productData);
      return response.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create product');
    }
  }
);

export const fetchSupplierProducts = createAsyncThunk(
  'products/fetchSupplierProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/products/supplier/my');
      return response.data.products;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch supplier products');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    supplierItems: [],
    currentProduct: null,
    categories: [],
    pagination: { page: 1, total: 0, totalPages: 1 },
    selectedCategory: '',
    searchQuery: '',
    compareList: [], // Array of products for side-by-side comparison
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    addToCompare: (state, action) => {
      const exists = state.compareList.find((p) => p._id === action.payload._id);
      if (!exists && state.compareList.length < 4) {
        state.compareList.push(action.payload);
      }
    },
    removeFromCompare: (state, action) => {
      state.compareList = state.compareList.filter((p) => p._id !== action.payload);
    },
    clearCompare: (state) => {
      state.compareList = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single Product
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // Fetch Supplier Products
      .addCase(fetchSupplierProducts.fulfilled, (state, action) => {
        state.supplierItems = action.payload;
      })
      // Create Product
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.supplierItems.unshift(action.payload);
      });
  },
});

export const {
  setSelectedCategory,
  setSearchQuery,
  addToCompare,
  removeFromCompare,
  clearCompare,
} = productSlice.actions;

export default productSlice.reducer;
