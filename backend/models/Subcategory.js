const mongoose = require('mongoose');

const SubcategorySchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  parentSubcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory',
    default: null
  },
  name: {
    type: String,
    required: [true, 'Please add a subcategory name'],
    trim: true
  },
  isClickable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure subcategory names are unique under the same category level
SubcategorySchema.index({ categoryId: 1, parentSubcategoryId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Subcategory', SubcategorySchema);
