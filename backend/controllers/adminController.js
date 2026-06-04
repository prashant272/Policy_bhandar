const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const Material = require('../models/Material');
const User = require('../models/User');
const { uploadFile } = require('../config/r2');

// @desc    Create Category
// @route   POST /api/admin/categories
// @access  Private (SuperAdmin, SubAdmin)
exports.createCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Please provide category name' });
    }

    const category = await Category.create({ name, icon });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create Subcategory
// @route   POST /api/admin/subcategories
// @access  Private (SuperAdmin, SubAdmin)
exports.createSubcategory = async (req, res) => {
  try {
    const { categoryId, parentSubcategoryId, name } = req.body;

    if (!categoryId || !name) {
      return res.status(400).json({ success: false, error: 'Please provide categoryId and subcategory name' });
    }

    const subcategory = await Subcategory.create({
      categoryId,
      parentSubcategoryId: parentSubcategoryId || null,
      name
    });
    res.status(201).json({ success: true, data: subcategory });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Upload Material
// @route   POST /api/admin/materials
// @access  Private (SuperAdmin, SubAdmin)
exports.uploadMaterial = async (req, res) => {
  try {
    const { title, categoryId, subcategoryId, type, companyName, tags, isPremium, watermarkTemplateId } = req.body;

    // Check files uploaded (req.files or req.file)
    // For MVP, we will assume files are uploaded, or URLs are provided manually if files are mock
    let fileUrl = req.body.fileUrl;
    let thumbnail = req.body.thumbnail;

    if (req.file) {
      // Multer file upload to Cloudflare R2 or local filesystem fallback
      fileUrl = await uploadFile(req.file);
      // In a real app, generate thumbnails. For MVP, use fileUrl if it is an image
      thumbnail = fileUrl;
    }

    if (!fileUrl) {
      return res.status(400).json({ success: false, error: 'Please upload a file or provide fileUrl' });
    }

    if (!thumbnail) {
      thumbnail = 'https://via.placeholder.com/150'; // default thumbnail
    }

    const parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;

    const material = await Material.create({
      title,
      categoryId,
      subcategoryId,
      type,
      fileUrl,
      thumbnail,
      companyName,
      tags: parsedTags || [],
      isPremium: isPremium === 'true' || isPremium === true,
      watermarkTemplateId: watermarkTemplateId || null,
      uploadedBy: req.user.id
    });

    res.status(201).json({ success: true, data: material });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (SuperAdmin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update User Role/Subscription
// @route   PUT /api/admin/users/:id
// @access  Private (SuperAdmin)
exports.updateUser = async (req, res) => {
  try {
    const { role, subscriptionType, activePlan } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (role) user.role = role;
    if (subscriptionType) user.subscriptionType = subscriptionType;

    if (activePlan !== undefined) {
      if (activePlan === null || activePlan === '') {
        user.activePlan = null;
        user.subscriptionType = 'Free';
        user.planExpiryDate = null;
      } else {
        const Plan = require('../models/Plan');
        const planDoc = await Plan.findById(activePlan);
        if (planDoc) {
          user.activePlan = planDoc._id;
          user.subscriptionType = planDoc.name;
          
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + (planDoc.validityDays || 30));
          user.planExpiryDate = expiry;
        }
      }
    }

    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get all materials (Admin view, full list)
// @route   GET /api/admin/materials
// @access  Private (SuperAdmin, SubAdmin)
exports.getMaterials = async (req, res) => {
  try {
    const materials = await Material.find()
      .populate('categoryId', 'name')
      .populate('subcategoryId', 'name')
      .populate('watermarkTemplateId')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: materials });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get all Contacts / Leads
// @route   GET /api/admin/contacts
// @access  Private (SuperAdmin)
exports.getContacts = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (!mongoose.models.Contact) {
      mongoose.model('Contact', new mongoose.Schema({
        name: String,
        email: String,
        phone: String,
        message: String,
        source: String
      }, { timestamps: true }));
    }
    const ContactModel = mongoose.model('Contact');
    const contacts = await ContactModel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: contacts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update Material
// @route   PUT /api/admin/materials/:id
// @access  Private (SuperAdmin, SubAdmin)
exports.updateMaterial = async (req, res) => {
  try {
    const { title, categoryId, subcategoryId, type, companyName, tags, isPremium, fileUrl, thumbnail, watermarkTemplateId } = req.body;

    let material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    // Prepare update data
    const updateData = {
      title,
      categoryId,
      subcategoryId,
      type,
      companyName,
      isPremium: isPremium === 'true' || isPremium === true || isPremium === '1',
      watermarkTemplateId: watermarkTemplateId || null
    };

    if (tags) {
      updateData.tags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;
    }

    if (req.file) {
      updateData.fileUrl = await uploadFile(req.file);
      updateData.thumbnail = updateData.fileUrl; // MVP behavior
    } else {
      if (fileUrl) updateData.fileUrl = fileUrl;
      if (thumbnail) updateData.thumbnail = thumbnail;
    }

    material = await Material.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.status(200).json({ success: true, data: material });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete Material
// @route   DELETE /api/admin/materials/:id
// @access  Private (SuperAdmin, SubAdmin)
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    // Optional: Delete physical file if it was uploaded locally
    if (material.fileUrl.startsWith('/uploads/')) {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, '../../', material.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Material.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Material deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete Category
// @route   DELETE /api/admin/categories/:id
// @access  Private (SuperAdmin, SubAdmin)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    // Delete subcategories and materials under this category to maintain references
    await Subcategory.deleteMany({ categoryId: req.params.id });
    await Material.deleteMany({ categoryId: req.params.id });

    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Category and all associated materials deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete Subcategory
// @route   DELETE /api/admin/subcategories/:id
// @access  Private (SuperAdmin, SubAdmin)
exports.deleteSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ success: false, error: 'Subcategory not found' });
    }

    // Recursively find all descendant subcategories under this category
    const allSubcats = await Subcategory.find({ categoryId: subcategory.categoryId });
    const getDescendantIds = (parentId) => {
      let ids = [parentId];
      const children = allSubcats.filter(s => s.parentSubcategoryId && s.parentSubcategoryId.toString() === parentId.toString());
      for (const child of children) {
        ids = [...ids, ...getDescendantIds(child._id)];
      }
      return ids;
    };

    const targetIds = getDescendantIds(subcategory._id);

    // Delete all materials in the descendant subcategories
    await Material.deleteMany({ subcategoryId: { $in: targetIds } });

    // Delete all descendant subcategories
    await Subcategory.deleteMany({ _id: { $in: targetIds } });

    res.status(200).json({ success: true, message: 'Subcategory and all nested subcategories/materials deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
