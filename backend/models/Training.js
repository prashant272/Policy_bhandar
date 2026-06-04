const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  youtubeVideoId: {
    type: String,
    required: [true, 'Please add a valid YouTube Video ID']
  },
  categoryId: {
    type: mongoose.Schema.ObjectId,
    ref: 'TrainingCategory',
    required: [true, 'Please select a category']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Training', trainingSchema);
