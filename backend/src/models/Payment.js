const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // PUBLIC FIELDS
  paymentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  amount: {
    type: Number, // integer, smallest currency unit
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'INR'
  },
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['PENDING', 'NOT_VERIFIED', 'VERIFIED', 'FAILED', 'EXPIRED'],
    default: 'PENDING'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },

  // PRIVATE FIELDS
  razorpay_order_id: {
    type: String
  },
  razorpay_payment_id: {
    type: String
  },
  razorpay_signature: {
    type: String
  },
  returnUrl: {
    type: String
  },
  userId: {
    type: String
  },
  ipAddress: {
    type: String
  },
  webhookLogs: {
    type: [Object], // array of logged events
    default: []
  },
  verificationHistory: {
    type: [Object],
    default: []
  },
  internalNotes: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
