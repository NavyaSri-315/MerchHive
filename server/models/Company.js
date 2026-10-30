const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company / Organization name is required'],
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    businessType: {
      type: String,
      enum: ['manufacturer', 'wholesaler', 'distributor', 'importer_exporter', 'retailer', 'enterprise_buyer'],
      default: 'wholesaler',
    },
    taxId: {
      type: String,
      required: [true, 'Tax Registration Number (GST/PAN/Tax ID) is required'],
      trim: true,
      uppercase: true,
    },
    documents: [
      {
        title: { type: String, default: 'Business License / GST Certificate' },
        url: { type: String, required: true },
        documentType: { type: String, enum: ['gst_cert', 'pan_card', 'incorporation_cert', 'trade_license', 'other'], default: 'gst_cert' },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: 'India' },
      zip: { type: String, default: '' },
    },
    contactPhone: {
      type: String,
      default: '',
    },
    contactEmail: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    creditLimit: {
      type: Number,
      default: 500000, // standard default 5 Lakhs credit line
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    establishedYear: {
      type: Number,
      default: 2018,
    },
    logo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=300&q=80',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Company', companySchema);
