const WatermarkTemplate = require('../models/WatermarkTemplate');
const { uploadFile } = require('../config/r2');

// @desc    Get all watermark templates
// @route   GET /api/watermarks
// @access  Private/Admin
exports.getWatermarks = async (req, res) => {
  try {
    const templates = await WatermarkTemplate.find().sort('-createdAt');
    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create a watermark template
// @route   POST /api/watermarks
// @access  Private/Admin
exports.createWatermark = async (req, res) => {
  try {
    let data = { ...req.body };
    if (req.file) {
      data.logoUrl = await uploadFile(req.file);
    }

    // Convert string booleans to actual booleans if passed as form-data
    if (data.showUserPhoto === 'false') data.showUserPhoto = false;
    if (data.showUserName === 'false') data.showUserName = false;
    if (data.showUserDetails === 'false') data.showUserDetails = false;
    if (data.showUserMobile === 'false') data.showUserMobile = false;

    const template = await WatermarkTemplate.create(data);
    res.status(201).json({
      success: true,
      data: template
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update watermark template
// @route   PUT /api/watermarks/:id
// @access  Private/Admin
exports.updateWatermark = async (req, res) => {
  try {
    let data = { ...req.body };
    if (req.file) {
      data.logoUrl = await uploadFile(req.file);
    }
    
    // Convert string booleans to actual booleans if passed as form-data
    if (data.showUserPhoto === 'false') data.showUserPhoto = false;
    if (data.showUserPhoto === 'true') data.showUserPhoto = true;
    if (data.showUserName === 'false') data.showUserName = false;
    if (data.showUserName === 'true') data.showUserName = true;
    if (data.showUserDetails === 'false') data.showUserDetails = false;
    if (data.showUserDetails === 'true') data.showUserDetails = true;
    if (data.showUserMobile === 'false') data.showUserMobile = false;
    if (data.showUserMobile === 'true') data.showUserMobile = true;

    const template = await WatermarkTemplate.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true
    });

    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    res.status(200).json({
      success: true,
      data: template
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete watermark template
// @route   DELETE /api/watermarks/:id
// @access  Private/Admin
exports.deleteWatermark = async (req, res) => {
  try {
    const template = await WatermarkTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    await template.deleteOne();
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
