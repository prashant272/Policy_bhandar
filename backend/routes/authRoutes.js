const express = require('express');
const router = express.Router();
const { registerInit, verifyOtp, completeProfile, login, getMe, updateProfile, forgotPasswordInit, forgotPasswordVerify } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/register-init', registerInit);
router.post('/verify-otp', verifyOtp);
router.post('/complete-profile', protect, upload.fields([{ name: 'profilePhoto', maxCount: 1 }, { name: 'whatsappScannerPhoto', maxCount: 1 }]), completeProfile);
router.post('/login', login);
router.post('/forgot-password-init', forgotPasswordInit);
router.post('/forgot-password-verify', forgotPasswordVerify);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.fields([{ name: 'profilePhoto', maxCount: 1 }, { name: 'whatsappScannerPhoto', maxCount: 1 }]), updateProfile);

module.exports = router;
