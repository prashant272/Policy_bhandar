const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  designation: {
    type: String,
    required: [true, 'Designation or Agency Name is required'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Testimonial message is required'],
    trim: true,
    maxlength: 500,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 5,
  },
  avatar: {
    type: String,
    default: '',
  },
  isApproved: {
    type: Boolean,
    default: false, // Admin must approve before it appears on the site
  },
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', TestimonialSchema);
