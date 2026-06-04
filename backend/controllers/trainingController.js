const Training = require('../models/Training');
const TrainingCategory = require('../models/TrainingCategory');

// @desc    Get all training categories
// @route   GET /api/trainings/categories
// @access  Public
exports.getTrainingCategories = async (req, res) => {
  try {
    // For admin panel we might want all, but for public only active ones.
    // Assuming we just send all for simplicity, or we can filter on frontend.
    const categories = await TrainingCategory.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create a training category
// @route   POST /api/trainings/categories
// @access  Private/Admin
exports.createTrainingCategory = async (req, res) => {
  try {
    const category = await TrainingCategory.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update a training category
// @route   PUT /api/trainings/categories/:id
// @access  Private/Admin
exports.updateTrainingCategory = async (req, res) => {
  try {
    const category = await TrainingCategory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, error: 'Category not found' });
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete a training category
// @route   DELETE /api/trainings/categories/:id
// @access  Private/Admin
exports.deleteTrainingCategory = async (req, res) => {
  try {
    const category = await TrainingCategory.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, error: 'Category not found' });
    // Optional: Delete or deactivate trainings in this category
    await Training.updateMany({ categoryId: req.params.id }, { isActive: false });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get all trainings
// @route   GET /api/trainings
// @access  Public
exports.getTrainings = async (req, res) => {
  try {
    const { categoryId, all } = req.query;
    let query = {};
    
    if (all !== 'true') {
      query.isActive = true;
    }
    
    if (categoryId) query.categoryId = categoryId;
    
    const trainings = await Training.find(query).populate('categoryId').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: trainings.length, data: trainings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create a training
// @route   POST /api/trainings
// @access  Private/Admin
exports.createTraining = async (req, res) => {
  try {
    // Extract videoId if a full URL is passed
    let videoId = req.body.youtubeVideoId;
    if (videoId && (videoId.includes('youtube.com') || videoId.includes('youtu.be'))) {
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
      const match = videoId.match(regex);
      if (match && match[1]) {
        req.body.youtubeVideoId = match[1];
      }
    }

    const training = await Training.create(req.body);
    const populated = await Training.findById(training._id).populate('categoryId');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update a training
// @route   PUT /api/trainings/:id
// @access  Private/Admin
exports.updateTraining = async (req, res) => {
  try {
    let videoId = req.body.youtubeVideoId;
    if (videoId && (videoId.includes('youtube.com') || videoId.includes('youtu.be'))) {
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
      const match = videoId.match(regex);
      if (match && match[1]) {
        req.body.youtubeVideoId = match[1];
      }
    }

    const training = await Training.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('categoryId');
    if (!training) return res.status(404).json({ success: false, error: 'Training not found' });
    res.status(200).json({ success: true, data: training });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete a training
// @route   DELETE /api/trainings/:id
// @access  Private/Admin
exports.deleteTraining = async (req, res) => {
  try {
    const training = await Training.findByIdAndDelete(req.params.id);
    if (!training) return res.status(404).json({ success: false, error: 'Training not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
