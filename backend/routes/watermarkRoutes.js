const express = require('express');
const {
  createWatermark,
  getWatermarks,
  updateWatermark,
  deleteWatermark
} = require('../controllers/watermarkController');

const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);
router.use(authorize('SuperAdmin', 'SubAdmin'));

router
  .route('/')
  .get(getWatermarks)
  .post(upload.single('logo'), createWatermark);

router
  .route('/:id')
  .put(upload.single('logo'), updateWatermark)
  .delete(deleteWatermark);

module.exports = router;
