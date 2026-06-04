const express = require('express');
const router = express.Router();
const { registerInit, verifyOtp, completeProfile, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/register-init', registerInit);
router.post('/verify-otp', verifyOtp);
router.post('/complete-profile', protect, upload.single('profilePhoto'), completeProfile);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('profilePhoto'), updateProfile);

module.exports = router;
