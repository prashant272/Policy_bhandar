const GlobalSetting = require('../models/GlobalSetting');

// @desc    Get global settings
// @route   GET /api/settings
// @access  Public
exports.getSettings = async (req, res) => {
  try {
    let settings = await GlobalSetting.findOne();
    if (!settings) {
      settings = await GlobalSetting.create({});
    }
    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update global settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    let settings = await GlobalSetting.findOne();
    if (!settings) {
      settings = await GlobalSetting.create(req.body);
    } else {
      settings = await GlobalSetting.findByIdAndUpdate(settings._id, req.body, { new: true });
    }
    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
