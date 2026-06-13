const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  mobile: {
    type: String,
    required: [true, 'Please add a mobile number'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ],
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['SuperAdmin', 'SubAdmin', 'Agent', 'Leader'],
    default: 'Agent'
  },
  state: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  occupationType: {
    type: String,
    enum: ['Agent', 'Advisor', 'Other', ''],
    default: ''
  },
  designation: {
    type: String,
    default: ''
  },
  company: {
    type: String,
    default: ''
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    select: false
  },
  otpExpires: {
    type: Date,
    select: false
  },
  selectedCategoryId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category'
  },
  selectedSubcategoryId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subcategory'
  },
  subscriptionType: {
    type: String,
    default: 'Free'
  },
  activePlan: {
    type: mongoose.Schema.ObjectId,
    ref: 'Plan'
  },
  planExpiryDate: {
    type: Date
  },
  razorpaySubscriptionId: {
    type: String
  },
  subscriptionStatus: {
    type: String
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  dailyLimitResetDate: {
    type: Date,
    default: () => {
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      return tomorrow;
    }
  }
}, {
  timestamps: true
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
