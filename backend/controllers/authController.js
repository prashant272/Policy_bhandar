const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { uploadFile } = require('../config/r2');
const { sendEmailOTP, sendWhatsAppOTP } = require('../services/otpService');

// Helper to sign JWT and return response
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || 'supersecretjwtkey_policybhandar_123!',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );

  // Exclude password from response
  const userObj = user.toObject();
  delete userObj.password;

  res.status(statusCode).json({
    success: true,
    token,
    user: userObj
  });
};

// @desc    Register step 1: Init & Send OTP
// @route   POST /api/auth/register-init
// @access  Public
exports.registerInit = async (req, res) => {
  try {
    const { name, mobile, email, password } = req.body;

    // Check if user already exists and is verified
    let user = await User.findOne({ $or: [{ email }, { mobile }] });
    if (user && user.isVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email or Mobile number already registered'
      });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (user && !user.isVerified) {
      // Update existing unverified user
      user.name = name;
      user.password = password; // Will be hashed by pre-save middleware
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      // Create new unverified user
      user = await User.create({
        name,
        mobile,
        email,
        password,
        otp,
        otpExpires,
        isVerified: false
      });
    }

    // Send OTP asynchronously
    sendEmailOTP(email, name, otp);
    sendWhatsAppOTP(mobile, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent to email and WhatsApp',
      userId: user._id
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Register step 2: Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId).select('+otp +otpExpires');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, error: 'User already verified' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, error: 'Invalid OTP' });
    }

    if (Date.now() > user.otpExpires) {
      return res.status(400).json({ success: false, error: 'OTP has expired' });
    }

    // Mark as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Send token for login so they can proceed to step 3 (Profile Setup)
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Step 3: Complete Profile (Categories, Location, Occupation, Photo)
// @route   POST /api/auth/complete-profile
// @access  Private
exports.completeProfile = async (req, res) => {
  try {
    const { 
      state, city, 
      selectedCategoryId, selectedSubcategoryId,
      occupationType, company, designation 
    } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!user.isVerified) return res.status(400).json({ success: false, message: 'Please verify OTP first' });

    user.state = state || user.state;
    user.city = city || user.city;
    user.selectedCategoryId = selectedCategoryId === '' ? null : (selectedCategoryId || user.selectedCategoryId);
    user.selectedSubcategoryId = selectedSubcategoryId === '' ? null : (selectedSubcategoryId || user.selectedSubcategoryId);
    user.occupationType = occupationType || user.occupationType;
    user.company = company || user.company;
    user.designation = designation || user.designation;

    // Handle optional profile photo upload
    if (req.file) {
      const fileUrl = await uploadFile(req.file, 'profiles');
      user.profilePhoto = fileUrl;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile completed successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isVerified: user.isVerified,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (error) {
    console.error('Complete Profile error:', error);
    res.status(500).json({ success: false, message: 'Server error during profile completion' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // Identifier can be email or mobile

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email/mobile and password'
      });
    }

    // Check for user (select password explicitly because it's set to select: false in schema)
    const user = await User.findOne({
      $or: [{ email: identifier }, { mobile: identifier }]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    if (!user.isVerified && user.role !== 'SuperAdmin') {
       return res.status(403).json({
         success: false,
         error: 'Please verify your account first. Use the registration flow to verify your number.',
         unverifiedUserId: user._id
       });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { 
      name, mobile, email, company, occupationType, designation, 
      state, city, selectedCategoryId, selectedSubcategoryId, profilePhotoUrl 
    } = req.body;
    
    const updateData = { 
      name, mobile, email, company, occupationType, designation, 
      state, city,
      selectedCategoryId: selectedCategoryId === '' ? null : selectedCategoryId,
      selectedSubcategoryId: selectedSubcategoryId === '' ? null : selectedSubcategoryId
    };

    if (req.file) {
      updateData.profilePhoto = await uploadFile(req.file);
    } else if (profilePhotoUrl !== undefined) {
      updateData.profilePhoto = profilePhotoUrl;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      returnDocument: 'after',
      runValidators: true
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
