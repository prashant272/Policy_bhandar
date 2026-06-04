const Razorpay = require('razorpay');
const crypto = require('crypto');
const Plan = require('../models/Plan');
const User = require('../models/User');

// Initialize Razorpay with fallback dummy keys if env is not set
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykey123',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummysecret123'
});

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    
    if (!planId) {
      return res.status(400).json({ success: false, error: 'Plan ID is required' });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    // Amount should be in paise
    const options = {
      amount: plan.price * 100, 
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    
    res.status(200).json({ 
      success: true, 
      data: order, 
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykey123' 
    });

  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ success: false, error: 'Could not create order' });
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummysecret123';

    // Verify signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Payment verification failed (Signature mismatch)' });
    }

    // Payment is successful, update user
    const planDoc = await Plan.findById(planId);
    if (!planDoc) {
      return res.status(404).json({ success: false, error: 'Plan not found after payment' });
    }

    const user = await User.findById(req.user.id);
    user.activePlan = planDoc._id;
    user.subscriptionType = planDoc.name;
    
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + (planDoc.validityDays || 30));
    user.planExpiryDate = expiry;

    await user.save();

    res.status(200).json({ success: true, message: 'Payment verified and plan upgraded successfully' });
  } catch (err) {
    console.error('Error verifying payment:', err);
    res.status(500).json({ success: false, error: 'Could not verify payment' });
  }
};
