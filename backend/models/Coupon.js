const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  discountType: {
    type: String,
    enum: ['PERCENTAGE', 'FLAT'],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  expiryDate: {
    type: Date,
  },
  maxUses: {
    type: Number, // If null or 0, implies unlimited
    default: 0,
  },
  currentUses: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
