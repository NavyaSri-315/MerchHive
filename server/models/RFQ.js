const mongoose = require('mongoose');

const counterOfferSchema = new mongoose.Schema(
  {
    offeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['buyer', 'supplier'],
      required: true,
    },
    pricePerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    leadTimeDays: {
      type: Number,
      default: 7,
    },
    notes: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const rfqSchema = new mongoose.Schema(
  {
    rfqNumber: {
      type: String,
      unique: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    buyerCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    supplierCompany: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Requested quantity is required'],
      min: 1,
    },
    targetPricePerUnit: {
      type: Number,
      required: [true, 'Target price per unit is required'],
      min: 0,
    },
    currentOfferedPrice: {
      type: Number,
      required: true,
    },
    lastOfferedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'countered', 'accepted', 'rejected', 'ordered'],
      default: 'pending',
    },
    notes: {
      type: String,
      default: '',
    },
    deliveryLocation: {
      type: String,
      default: '',
    },
    targetDeliveryDate: {
      type: Date,
    },
    counterOffers: [counterOfferSchema],
    acceptedAt: {
      type: Date,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  },
  {
    timestamps: true,
  }
);

// Generate friendly RFQ Number e.g. RFQ-2026-1042
rfqSchema.pre('save', function (next) {
  if (!this.rfqNumber) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.rfqNumber = `RFQ-${new Date().getFullYear()}-${randomSuffix}`;
  }
  next();
});

module.exports = mongoose.model('RFQ', rfqSchema);
