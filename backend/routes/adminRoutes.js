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
  getContacts
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
router.post('/materials', upload.single('file'), uploadMaterial);
router.put('/materials/:id', upload.single('file'), updateMaterial);
router.delete('/materials/:id', deleteMaterial);

// SuperAdmin only routes
router.get('/users', authorize('SuperAdmin'), getUsers);
router.put('/users/:id', authorize('SuperAdmin'), updateUser);
router.get('/contacts', authorize('SuperAdmin'), getContacts);

module.exports = router;
