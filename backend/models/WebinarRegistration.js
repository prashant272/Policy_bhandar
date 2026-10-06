const mongoose = require('mongoose');

const webinarRegistrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  occupation: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    default: 99
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WebinarRegistration', webinarRegistrationSchema);
