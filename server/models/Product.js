const mongoose = require('mongoose');

const tieredPriceSchema = new mongoose.Schema(
  {
    minQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    maxQuantity: {
      type: Number,
      // If null or 0, represents "and above"
      default: null,
    },
    pricePerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    brand: {
      type: String,
      default: 'Generic',
      trim: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    specifications: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    moq: {
      type: Number,
      required: [true, 'Minimum Order Quantity (MOQ) is required'],
      default: 10,
      min: 1,
    },
    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      default: 100,
      min: 0,
    },
    unit: {
      type: String,
      default: 'units',
      enum: ['units', 'pieces', 'boxes', 'cartons', 'kg', 'meters', 'sets', 'liters'],
    },
    tieredPricing: {
      type: [tieredPriceSchema],
      required: true,
      validate: {
        validator: function (tiers) {
          return tiers && tiers.length > 0;
        },
        message: 'At least one pricing tier must be defined',
      },
    },
    basePrice: {
      type: Number,
      // Cached price per unit for the lowest tier (MOQ tier)
      default: 0,
    },
    leadTimeDays: {
      type: Number,
      default: 5, // e.g. 5 days production/dispatch lead time
    },
    hsnCode: {
      type: String,
      default: '84713010',
    },
    taxPercent: {
      type: Number,
      default: 18, // 18% GST standard
    },
    status: {
      type: String,
      enum: ['active', 'draft', 'archived'],
      default: 'active',
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    reviewsCount: {
      type: Number,
      default: 12,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save to compute basePrice from lowest tier
productSchema.pre('save', function (next) {
  if (this.tieredPricing && this.tieredPricing.length > 0) {
    // Sort tiers by minQuantity ascending
    this.tieredPricing.sort((a, b) => a.minQuantity - b.minQuantity);
    this.basePrice = this.tieredPricing[0].pricePerUnit;
  }
  next();
});

// Helper method to compute price for a given quantity
productSchema.methods.getPriceForQuantity = function (qty) {
  if (!this.tieredPricing || this.tieredPricing.length === 0) return this.basePrice;
  const sorted = [...this.tieredPricing].sort((a, b) => b.minQuantity - a.minQuantity);
  for (const tier of sorted) {
    if (qty >= tier.minQuantity) {
      if (!tier.maxQuantity || qty <= tier.maxQuantity) {
        return tier.pricePerUnit;
      }
    }
  }
  return this.tieredPricing[0].pricePerUnit;
};

module.exports = mongoose.model('Product', productSchema);
