const Razorpay = require('razorpay');
const crypto = require('crypto');
const WebinarRegistration = require('../models/WebinarRegistration');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykey123',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummysecret123'
});

// @desc    Create webinar registration order
// @route   POST /api/webinar/register
// @access  Public
exports.createRegistrationOrder = async (req, res) => {
  try {
    const { name, email, phone, occupation } = req.body;

    if (!name || !email || !phone || !occupation) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    const amount = 99; // ₹99

    // Create Razorpay Order
    const options = {
      amount: amount * 100, // in paise
      currency: 'INR',
      receipt: `receipt_webinar_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    // Create pending registration in DB
    const registration = await WebinarRegistration.create({
      name,
      email,
      phone,
      occupation,
      amount,
      razorpayOrderId: order.id,
      paymentStatus: 'Pending'
    });

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      registrationId: registration._id,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykey123'
    });

  } catch (err) {
    console.error('Error creating webinar order:', err);
    res.status(500).json({ success: false, error: 'Failed to create payment order' });
  }
};

// @desc    Verify webinar payment
// @route   POST /api/webinar/verify
// @access  Public
exports.verifyRegistrationPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummysecret123';

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      // Payment verification failed
      await WebinarRegistration.findByIdAndUpdate(registrationId, { paymentStatus: 'Failed' });
      return res.status(400).json({ success: false, error: 'Payment verification failed' });
    }

    // Payment successful
    await WebinarRegistration.findByIdAndUpdate(registrationId, {
      paymentStatus: 'Paid',
      razorpayPaymentId: razorpay_payment_id
    });

    res.status(200).json({ success: true, message: 'Payment verified successfully' });
  } catch (err) {
    console.error('Error verifying webinar payment:', err);
    res.status(500).json({ success: false, error: 'Server error during payment verification' });
  }
};

// @desc    Get all webinar registrations (Admin)
// @route   GET /api/webinar/admin/registrations
// @access  Private (Admin)
exports.getRegistrations = async (req, res) => {
  try {
    const registrations = await WebinarRegistration.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: registrations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update registration status manually (Admin)
// @route   PUT /api/webinar/admin/registrations/:id
// @access  Private (Admin)
exports.updateRegistrationStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const registration = await WebinarRegistration.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );
    if (!registration) {
      return res.status(404).json({ success: false, error: 'Registration not found' });
    }
    res.status(200).json({ success: true, data: registration });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
