const express = require('express');
const {
  getTrainings,
  createTraining,
  updateTraining,
  deleteTraining,
  getTrainingCategories,
  createTrainingCategory,
  updateTrainingCategory,
  deleteTrainingCategory
} = require('../controllers/trainingController');

// The file might be in different location in this repo, let's assume standard
// I will check if authMiddleware exists, or use what other routes use.
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Categories routes
router.route('/categories')
  .get(getTrainingCategories)
  .post(protect, authorize('SuperAdmin', 'SubAdmin'), createTrainingCategory);

router.route('/categories/:id')
  .put(protect, authorize('SuperAdmin', 'SubAdmin'), updateTrainingCategory)
  .delete(protect, authorize('SuperAdmin', 'SubAdmin'), deleteTrainingCategory);

// Training routes
router.route('/')
  .get(getTrainings)
  .post(protect, authorize('SuperAdmin', 'SubAdmin'), createTraining);

router.route('/:id')
  .put(protect, authorize('SuperAdmin', 'SubAdmin'), updateTraining)
  .delete(protect, authorize('SuperAdmin', 'SubAdmin'), deleteTraining);

module.exports = router;
