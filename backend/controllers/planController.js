const Plan = require('../models/Plan');

// @desc    Get all plans
// @route   GET /api/plans
// @access  Public
exports.getPlans = async (req, res) => {
  try {
    // If admin is requesting, they might need all plans. But for now, just return all.
    const plans = await Plan.find().populate('allowedCategories allowedSubcategories allowedTrainingCategories');
    res.status(200).json({ success: true, data: plans });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create a plan
// @route   POST /api/plans
// @access  Private/Admin
exports.createPlan = async (req, res) => {
  try {
    const plan = await Plan.create(req.body);
    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update a plan
// @route   PUT /api/plans/:id
// @access  Private/Admin
exports.updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });
    res.status(200).json({ success: true, data: plan });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete a plan
// @route   DELETE /api/plans/:id
// @access  Private/Admin
exports.deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ success: false, error: 'Plan not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
