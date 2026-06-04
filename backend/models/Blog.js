const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  excerpt: {
    type: String,
    required: [true, 'Short excerpt is required'],
    maxlength: 300,
  },
  content: {
    type: String,
    required: [true, 'Blog content is required'],
  },
  coverImage: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['Training', 'Insurance Tips', 'Industry News', 'Success Stories', 'General'],
    default: 'General',
  },
  tags: [{ type: String }],
  author: {
    type: String,
    default: 'Policy Bhandar Team',
  },
  readTime: {
    type: Number, // in minutes
    default: 3,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  views: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Auto-generate slug from title before save
BlogSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

module.exports = mongoose.model('Blog', BlogSchema);
