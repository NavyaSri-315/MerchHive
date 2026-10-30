const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    rfq: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RFQ',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    offerDetails: {
      isCounterOffer: { type: Boolean, default: false },
      pricePerUnit: { type: Number },
      quantity: { type: Number },
      leadTimeDays: { type: Number },
      status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Message', messageSchema);
