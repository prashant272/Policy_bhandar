const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.route('/')
  .get(getSettings)
  .put(protect, authorize('SuperAdmin', 'SubAdmin'), updateSettings);

module.exports = router;
