const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    image: { type: String },
    unit: { type: String, default: 'units' },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    isRfqNegotiated: { type: Boolean, default: false },
    rfqId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ' },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
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
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
    },
    platformCommission: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'credit_approved', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay_stripe', 'b2b_credit_terms', 'bank_transfer'],
      default: 'b2b_credit_terms',
    },
    creditTerms: {
      termDays: { type: Number, default: 30 }, // Net 30, Net 60 days
      dueDate: { type: Date },
      creditApprovedAt: { type: Date },
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'confirmed',
    },
    shippingAddress: {
      contactName: { type: String, required: true },
      companyName: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, default: 'India' },
      zip: { type: String, required: true },
      phone: { type: String, required: true },
      gstNumber: { type: String },
    },
    shipment: {
      trackingId: { type: String, default: '' },
      carrier: { type: String, default: '' },
      shippedAt: { type: Date },
      estimatedDelivery: { type: Date },
      courierNotes: { type: String, default: '' },
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save to generate order number
orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    this.orderNumber = `BKC-${new Date().getFullYear()}-${randomSuffix}`;
  }
  if (this.paymentMethod === 'b2b_credit_terms' && !this.creditTerms.dueDate) {
    const days = this.creditTerms.termDays || 30;
    const due = new Date();
    due.setDate(due.getDate() + days);
    this.creditTerms.dueDate = due;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
