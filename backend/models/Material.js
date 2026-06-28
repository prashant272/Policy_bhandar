const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory',
    required: true
  },
  type: {
    type: String,
    enum: ['Banner', 'Reel', 'PDF', 'PPT', 'Video', 'Brochure'],
    required: [true, 'Please specify the material type']
  },
  language: {
    type: String,
    enum: ['English', 'Hindi', 'Both'],
    default: 'English'
  },
  fileUrl: {
    type: String,
    required: [true, 'Please provide the file URL']
  },
  thumbnail: {
    type: String,
    required: [true, 'Please provide a thumbnail URL']
  },
  companyName: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPremium: {
    type: Boolean,
    default: false
  },
  watermarkTemplateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WatermarkTemplate',
    default: null
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Material', MaterialSchema);
