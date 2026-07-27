const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    unique: true,
    trim: true
  },
  icon: {
    type: String, // String reference to an icon name/SVG/url
    default: 'briefcase'
  },
  isClickable: {
    type: Boolean,
    default: true
  },
  addonPrice: {
    type: Number,
    default: 1499
  },
  isLeaderCategory: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

CategorySchema.index({ isLeaderCategory: 1 });

module.exports = mongoose.model('Category', CategorySchema);
