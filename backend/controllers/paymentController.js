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
    const { planId, selectedAddons } = req.body;
    
    if (!planId) {
      return res.status(400).json({ success: false, error: 'Plan ID is required' });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    let basePrice = plan.price;
    let addonsPrice = 0;

    // Calculate addon prices if any
    if (selectedAddons && Array.isArray(selectedAddons) && selectedAddons.length > 0) {
      const Category = require('../models/Category');
      const addons = await Category.find({ _id: { $in: selectedAddons } });
      addons.forEach(addon => {
        addonsPrice += addon.addonPrice || 1499;
      });
    }

    const finalPrice = Math.round((basePrice + addonsPrice) * 1.18);

    // Amount should be in paise
    const options = {
      amount: finalPrice * 100, 
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, selectedCategories, selectedAddons } = req.body;

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
    
    if (planDoc.isLeaderIncluded) {
      user.hasLeaderAccess = true;
    }

    if (selectedCategories && Array.isArray(selectedCategories)) {
      user.unlockedCategories = selectedCategories;
    }
    
    if (selectedAddons && Array.isArray(selectedAddons)) {
      // Append new addons to existing ones, avoid duplicates
      const currentAddons = user.purchasedAddons ? user.purchasedAddons.map(id => id.toString()) : [];
      selectedAddons.forEach(id => {
        if (!currentAddons.includes(id)) {
           user.purchasedAddons.push(id);
        }
      });
    }
    
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

// @desc    Create Razorpay Subscription (Autopay)
// @route   POST /api/payments/create-subscription
// @access  Private
exports.createSubscription = async (req, res) => {
  try {
    const { planId, selectedAddons } = req.body;
    
    if (!planId) {
      return res.status(400).json({ success: false, error: 'Plan ID is required' });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    // Calculate total including addons
    let addonsTotal = 0;
    if (selectedAddons && selectedAddons.length > 0) {
      // Import Subcategory at top of file (or use mongoose model) if not imported, 
      // but assuming Subcategory is required. Let's just require it here if needed.
      const Subcategory = require('../models/Subcategory');
      for (const id of selectedAddons) {
        const subcat = await Subcategory.findById(id);
        if (subcat) addonsTotal += (subcat.addonPrice || 1499);
      }
    }
    
    const finalPrice = plan.price + addonsTotal;
    let finalRzpPlanId;

    let period = 'monthly';
    let interval = 1;
    if (plan.validityDays >= 360) {
      period = 'yearly';
      interval = 1;
    } else if (plan.validityDays >= 90) {
      period = 'monthly';
      interval = 3;
    } else {
      period = 'monthly';
      interval = 1;
    }

    if (addonsTotal > 0) {
      // Create a dynamic plan on the fly if there are addons
      const rzpPlan = await razorpay.plans.create({
        period: period,
        interval: interval,
        item: {
          name: `${plan.name} + Addons`,
          amount: Math.round(finalPrice * 1.18) * 100, // Amount in paise with 18% GST
          currency: 'INR',
          description: `Subscription with dynamic addons`
        }
      });
      finalRzpPlanId = rzpPlan.id;
    } else {
      // Ensure a base Razorpay Plan exists for this pricing plan
      if (!plan.razorpayPlanId) {
        const rzpPlan = await razorpay.plans.create({
          period: period,
          interval: interval,
          item: {
            name: plan.name,
            amount: Math.round(plan.price * 1.18) * 100,
            currency: 'INR',
            description: `${plan.name} Subscription`
          }
        });
        plan.razorpayPlanId = rzpPlan.id;
        await plan.save();
      }
      finalRzpPlanId = plan.razorpayPlanId;
    }

    // Create Razorpay Subscription with 15-day trial (start_at in 15 days)
    const startAt = Math.floor((Date.now() + 15 * 24 * 60 * 60 * 1000) / 1000);

    const subscriptionOptions = {
      plan_id: finalRzpPlanId,
      customer_notify: 1,
      total_count: plan.validityDays >= 360 ? 5 : 60, 
      start_at: startAt,
      notes: {
        userId: req.user.id,
        planId: plan._id.toString()
      }
    };

    const subscription = await razorpay.subscriptions.create(subscriptionOptions);

    res.status(200).json({
      success: true,
      data: subscription,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykey123'
    });

  } catch (err) {
    console.error('Error creating subscription:', err);
    res.status(500).json({ success: false, error: err.message || 'Could not create subscription' });
  }
};

// @desc    Verify Razorpay Subscription Payment
// @route   POST /api/payments/verify-subscription
// @access  Private
exports.verifySubscription = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature, planId, selectedCategories, selectedAddons } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummysecret123';

    // Verify signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpay_payment_id + "|" + razorpay_subscription_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Subscription verification failed (Signature mismatch)' });
    }

    const planDoc = await Plan.findById(planId);
    if (!planDoc) {
      return res.status(404).json({ success: false, error: 'Plan not found after payment' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.activePlan = planDoc._id;
    user.subscriptionType = planDoc.name;
    user.razorpaySubscriptionId = razorpay_subscription_id;
    user.subscriptionStatus = 'active';

    if (planDoc.isLeaderIncluded) {
      user.hasLeaderAccess = true;
    }

    if (selectedCategories && Array.isArray(selectedCategories)) {
      user.unlockedCategories = selectedCategories;
    }
    
    if (selectedAddons && Array.isArray(selectedAddons)) {
      const currentAddons = user.purchasedAddons ? user.purchasedAddons.map(id => id.toString()) : [];
      selectedAddons.forEach(id => {
        if (!currentAddons.includes(id)) {
           user.purchasedAddons.push(id);
        }
      });
    }

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 15 + (planDoc.validityDays || 30));
    user.planExpiryDate = expiry;

    await user.save();

    res.status(200).json({ success: true, message: 'Subscription activated successfully' });
  } catch (err) {
    console.error('Error verifying subscription:', err);
    res.status(500).json({ success: false, error: err.message || 'Could not verify subscription' });
  }
};
