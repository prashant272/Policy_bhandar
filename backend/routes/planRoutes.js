const express = require('express');
const { getPlans, createPlan, updatePlan, deletePlan } = require('../controllers/planController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.route('/')
  .get(getPlans)
  .post(protect, authorize('SuperAdmin', 'SubAdmin'), createPlan);

router.route('/:id')
  .put(protect, authorize('SuperAdmin', 'SubAdmin'), updatePlan)
  .delete(protect, authorize('SuperAdmin', 'SubAdmin'), deletePlan);

module.exports = router;
