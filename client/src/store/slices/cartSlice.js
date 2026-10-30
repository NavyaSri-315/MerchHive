import { createSlice } from '@reduxjs/toolkit';

const loadCartFromStorage = () => {
  try {
    const data = localStorage.getItem('bulkconnect_cart');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveCartToStorage = (items) => {
  try {
    localStorage.setItem('bulkconnect_cart', JSON.stringify(items));
  } catch (e) {}
};

// Helper to determine price based on product tiered pricing
const getCalculatedPrice = (product, quantity, isRfq, rfqPrice) => {
  if (isRfq && rfqPrice) return rfqPrice;
  if (!product || !product.tieredPricing || product.tieredPricing.length === 0) {
    return product?.basePrice || 0;
  }
  const sorted = [...product.tieredPricing].sort((a, b) => b.minQuantity - a.minQuantity);
  for (const tier of sorted) {
    if (quantity >= tier.minQuantity) {
      if (!tier.maxQuantity || quantity <= tier.maxQuantity) {
        return tier.pricePerUnit;
      }
    }
  }
  return product.tieredPricing[0].pricePerUnit;
};

const initialItems = loadCartFromStorage();

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: initialItems,
    couponCode: '',
    discountPercent: 0,
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity, isRfq, rfqPrice, rfqId } = action.payload;
      const existingIndex = state.items.findIndex(
        (i) => i.productId === product._id && i.isRfq === !!isRfq && i.rfqId === rfqId
      );

      const qty = Number(quantity);
      const unitPrice = getCalculatedPrice(product, qty, isRfq, rfqPrice);

      if (existingIndex > -1) {
        const newQty = isRfq ? qty : state.items[existingIndex].quantity + qty;
        state.items[existingIndex].quantity = newQty;
        state.items[existingIndex].unitPrice = getCalculatedPrice(product, newQty, isRfq, rfqPrice);
        state.items[existingIndex].totalPrice = state.items[existingIndex].unitPrice * newQty;
      } else {
        state.items.push({
          productId: product._id,
          name: product.name,
          sku: product.sku,
          image: product.images?.[0] || '',
          unit: product.unit || 'units',
          moq: product.moq,
          quantity: qty,
          unitPrice,
          totalPrice: unitPrice * qty,
          tieredPricing: product.tieredPricing || [],
          supplier: product.supplier,
          company: product.company,
          isRfq: !!isRfq,
          rfqId: rfqId || null,
        });
      }
      saveCartToStorage(state.items);
    },
    updateQuantity: (state, action) => {
      const { productId, quantity, rfqId } = action.payload;
      const item = state.items.find((i) => i.productId === productId && i.rfqId === rfqId);
      if (item) {
        const qty = Math.max(item.isRfq ? item.quantity : item.moq, Number(quantity));
        item.quantity = qty;
        item.unitPrice = getCalculatedPrice(item, qty, item.isRfq, item.unitPrice);
        item.totalPrice = item.unitPrice * qty;
        saveCartToStorage(state.items);
      }
    },
    removeFromCart: (state, action) => {
      const { productId, rfqId } = action.payload;
      state.items = state.items.filter((i) => !(i.productId === productId && i.rfqId === rfqId));
      saveCartToStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      state.couponCode = '';
      state.discountPercent = 0;
      saveCartToStorage([]);
    },
    applyCoupon: (state, action) => {
      const code = action.payload.trim().toUpperCase();
      state.couponCode = code;
      if (code === 'MERCHHIVE10' || code === 'BULKCONNECT10') {
        state.discountPercent = 10;
      } else if (code === 'B2BTRADE5') {
        state.discountPercent = 5;
      } else {
        state.discountPercent = 0;
      }
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart, applyCoupon } = cartSlice.actions;

// Selectors for calculations
export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

export const selectCartTax = (state) =>
  Math.round(selectCartSubtotal(state) * 0.18); // 18% GST

export const selectCartShipping = (state) => {
  const subtotal = selectCartSubtotal(state);
  if (subtotal === 0) return 0;
  return subtotal > 100000 ? 0 : 2500;
};

export const selectCartDiscount = (state) => {
  const subtotal = selectCartSubtotal(state);
  return Math.round((subtotal * (state.cart.discountPercent || 0)) / 100);
};

export const selectCartTotal = (state) => {
  const subtotal = selectCartSubtotal(state);
  const tax = selectCartTax(state);
  const shipping = selectCartShipping(state);
  const discount = selectCartDiscount(state);
  return Math.max(0, subtotal + tax + shipping - discount);
};

export default cartSlice.reducer;
