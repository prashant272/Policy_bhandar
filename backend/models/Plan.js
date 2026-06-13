const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a plan name'],
    trim: true,
    unique: true
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  validityDays: {
    type: Number,
    required: [true, 'Please add validity in days (e.g. 30, 365)']
  },
  dailyDownloadLimit: {
    type: Number,
    default: 5 // -1 means unlimited
  },
  features: {
    type: [String],
    default: []
  },
  allowedCategories: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Category'
  }],
  allowedSubcategories: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Subcategory'
  }],
  allowedTrainingCategories: [{
    type: mongoose.Schema.ObjectId,
    ref: 'TrainingCategory'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  razorpayPlanId: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Plan', planSchema);
