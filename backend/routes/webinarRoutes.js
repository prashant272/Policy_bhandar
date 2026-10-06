const express = require('express');
const router = express.Router();
const {
  createRegistrationOrder,
  verifyRegistrationPayment,
  getRegistrations,
  updateRegistrationStatus
} = require('../controllers/webinarController');
const { protect, authorize } = require('../middlewares/auth');

// Public routes for payment
router.post('/register', createRegistrationOrder);
router.post('/verify', verifyRegistrationPayment);

// Admin routes
router.get('/admin/registrations', protect, authorize('SuperAdmin', 'SubAdmin'), getRegistrations);
router.put('/admin/registrations/:id', protect, authorize('SuperAdmin', 'SubAdmin'), updateRegistrationStatus);

module.exports = router;
