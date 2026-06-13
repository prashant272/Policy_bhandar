const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, createSubscription, verifySubscription } = require('../controllers/paymentController');
const { protect } = require('../middlewares/auth');

// All payment routes are protected (must be logged in)
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/create-subscription', protect, createSubscription);
router.post('/verify-subscription', protect, verifySubscription);

module.exports = router;
