const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  createCategory,
  updateCategory,
  createSubcategory,
  updateSubcategory,
  uploadMaterial,
  getUsers,
  updateUser,
  getMaterials,
  updateMaterial,
  deleteMaterial,
  deleteCategory,
  deleteSubcategory,
  getContacts,
  deleteUser,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

const upload = multer({ storage: multer.memoryStorage() });

// All routes here require protection and admin role
router.use(protect);
router.use(authorize('SuperAdmin', 'SubAdmin'));

router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

router.post('/subcategories', createSubcategory);
router.put('/subcategories/:id', updateSubcategory);
router.delete('/subcategories/:id', deleteSubcategory);

router.get('/materials', getMaterials);
router.post('/materials', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), uploadMaterial);
router.put('/materials/:id', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), updateMaterial);
router.delete('/materials/:id', deleteMaterial);

// SuperAdmin only routes
router.get('/users', authorize('SuperAdmin'), getUsers);
router.put('/users/:id', authorize('SuperAdmin'), updateUser);
router.delete('/users/:id', authorize('SuperAdmin'), deleteUser);
router.get('/contacts', authorize('SuperAdmin'), getContacts);

// Coupon routes (SuperAdmin only)
router.get('/coupons', authorize('SuperAdmin'), getCoupons);
router.post('/coupons', authorize('SuperAdmin'), createCoupon);
router.put('/coupons/:id', authorize('SuperAdmin'), updateCoupon);
router.delete('/coupons/:id', authorize('SuperAdmin'), deleteCoupon);

module.exports = router;
