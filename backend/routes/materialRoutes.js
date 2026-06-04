const express = require('express');
const router = express.Router();
const {
  getCategories,
  getSubcategories,
  getMaterials,
  getTags,
  downloadMaterial
} = require('../controllers/materialController');
const { protect } = require('../middlewares/auth');

router.get('/categories', getCategories);
router.get('/categories/:categoryId/subcategories', getSubcategories);
router.get('/tags', getTags);
router.get('/', getMaterials);
router.post('/:id/download', protect, downloadMaterial);

module.exports = router;
