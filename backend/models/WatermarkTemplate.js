const mongoose = require('mongoose');

const watermarkTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a template name'],
    trim: true,
  },
  layoutType: {
    type: String,
    enum: ['bottom-bar', 'top-bar', 'bottom-right-box', 'bottom-left-box', 'top-right-box', 'top-left-box', 'professional-bottom'],
    default: 'bottom-bar'
  },
  backgroundColor: {
    type: String,
    default: 'rgba(15, 23, 42, 0.8)' // slate-950/80
  },
  textColor: {
    type: String,
    default: '#ffffff'
  },
  accentColor: {
    type: String,
    default: '#a855f7' // purple-500
  },
  borderColor: {
    type: String,
    default: 'rgba(99, 102, 241, 0.3)' // indigo-500/30
  },
  logoUrl: {
    type: String,
    default: null
  },
  showUserPhoto: {
    type: Boolean,
    default: true
  },
  showUserName: {
    type: Boolean,
    default: true
  },
  showUserDetails: {
    type: Boolean,
    default: true
  },
  showUserMobile: {
    type: Boolean,
    default: true
  },
  sizeScale: {
    type: Number,
    default: 100
  },
  imageScale: {
    type: Number,
    default: 100
  },
  showSocialIcons: {
    type: Boolean,
    default: true
  },
  appendMode: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WatermarkTemplate', watermarkTemplateSchema);
