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
    const { name, icon, isClickable, isLeaderCategory, addonPrice } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Please provide category name' });
    }

    const category = await Category.create({ 
      name, 
      icon, 
      isClickable,
      isLeaderCategory,
      addonPrice
    });
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
    const { categoryId, parentSubcategoryId, name, isClickable, isMainSubcategory, isLeaderCategory, addonPrice } = req.body;

    if (!categoryId || !name) {
      return res.status(400).json({ success: false, error: 'Please provide categoryId and subcategory name' });
    }

    const subcategory = await Subcategory.create({
      categoryId,
      parentSubcategoryId: parentSubcategoryId || null,
      name,
      isClickable,
      isMainSubcategory,
      isLeaderCategory,
      addonPrice
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
    const { title, categoryId, subcategoryId, type, companyName, tags, isPremium, watermarkTemplateId, language } = req.body;

    // Check files uploaded (req.files or req.file)
    // For MVP, we will assume files are uploaded, or URLs are provided manually if files are mock
    let fileUrl = req.body.fileUrl;
    let thumbnail = req.body.thumbnail;

    let mainFile = req.files && req.files.file ? req.files.file[0] : (req.file ? req.file : null);
    let thumbFile = req.files && req.files.thumbnail ? req.files.thumbnail[0] : null;

    if (mainFile) {
      // Multer file upload to Cloudflare R2 or local filesystem fallback
      fileUrl = await uploadFile(mainFile);
      // In a real app, generate thumbnails. For MVP, use fileUrl if it is an image
      if (mainFile.mimetype.startsWith('image/') && !mainFile.mimetype.includes('svg')) {
        thumbnail = fileUrl;
      } else {
        if (type === 'PPT') {
          thumbnail = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=400';
        } else if (type === 'PDF' || type === 'Brochure') {
          thumbnail = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=400';
        } else if (type === 'Reel' || type === 'Video') {
          thumbnail = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400';
        } else {
          thumbnail = fileUrl;
        }
      }
    }

    if (thumbFile) {
      thumbnail = await uploadFile(thumbFile);
    }

    if (!fileUrl) {
      return res.status(400).json({ success: false, error: 'Please upload a file or provide fileUrl' });
    }

    if (!thumbnail || thumbnail === 'https://via.placeholder.com/150') {
      if (type === 'PPT') {
        thumbnail = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=400';
      } else if (type === 'PDF' || type === 'Brochure') {
        thumbnail = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=400';
      } else if (type === 'Reel' || type === 'Video') {
        thumbnail = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400';
      } else {
        thumbnail = 'https://via.placeholder.com/150'; // default thumbnail fallback
      }
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
      language: language || 'English',
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
    const users = await User.find()
      .populate('activePlan')
      .sort({ createdAt: -1 });
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
    const { role, subscriptionType, activePlan, name, email, mobile, password, unlockedCategories } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (role) user.role = role;
    if (subscriptionType) user.subscriptionType = subscriptionType;
    if (name) user.name = name;
    if (email) user.email = email;
    if (mobile) user.mobile = mobile;
    if (password) user.password = password;
    if (unlockedCategories && Array.isArray(unlockedCategories)) {
      user.unlockedCategories = unlockedCategories;
    }

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
          
          // If a plan is assigned from admin, mark user as verified so they can login
          user.isVerified = true;
          user.otp = undefined;
          user.otpExpires = undefined;
        }
      }
    }

    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete User
// @route   DELETE /api/admin/users/:id
// @access  Private (SuperAdmin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get all materials (Admin view, full list)
// @route   GET /api/admin/materials
// @access  Private (SuperAdmin, SubAdmin)
exports.getMaterials = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const search = req.query.search || '';

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Material.countDocuments(query);

    const materials = await Material.find(query)
      .populate('categoryId', 'name')
      .populate('subcategoryId', 'name')
      .populate('watermarkTemplateId')
      .sort({ createdAt: -1, _id: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: materials,
      pagination: {
        page,
        limit,
        total,
        hasMore: startIndex + materials.length < total
      }
    });
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
    const { title, categoryId, subcategoryId, type, companyName, tags, isPremium, fileUrl, thumbnail, watermarkTemplateId, language } = req.body;

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

    if (language) {
      updateData.language = language;
    }

    if (tags) {
      updateData.tags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;
    }

    let mainFile = req.files && req.files.file ? req.files.file[0] : (req.file ? req.file : null);
    let thumbFile = req.files && req.files.thumbnail ? req.files.thumbnail[0] : null;

    if (mainFile) {
      updateData.fileUrl = await uploadFile(mainFile);
      // Update thumbnail logic if type is image
      if (mainFile.mimetype.startsWith('image/') && !mainFile.mimetype.includes('svg')) {
        updateData.thumbnail = updateData.fileUrl;
      }
    }

    if (thumbFile) {
      updateData.thumbnail = await uploadFile(thumbFile);
    } else if (thumbnail) {
      updateData.thumbnail = thumbnail;
    } else if (!material.thumbnail || material.thumbnail === 'https://via.placeholder.com/150' || material.thumbnail === material.fileUrl) {
        // If updating type without a thumbnail, or the old thumbnail was just the file url of a non-image file, update it to a proper default
        if (type === 'PPT') {
          updateData.thumbnail = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=400';
        } else if (type === 'PDF' || type === 'Brochure') {
          updateData.thumbnail = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=400';
        } else if (type === 'Reel' || type === 'Video') {
          updateData.thumbnail = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400';
        }
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

// @desc    Update Category
// @route   PUT /api/admin/categories/:id
// @access  Private (SuperAdmin, SubAdmin)
exports.updateCategory = async (req, res) => {
  try {
    const { name, icon, isClickable, isLeaderCategory, addonPrice } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    if (name) category.name = name;
    if (icon !== undefined) category.icon = icon;
    if (isClickable !== undefined) category.isClickable = isClickable;
    if (isLeaderCategory !== undefined) category.isLeaderCategory = isLeaderCategory;
    if (addonPrice !== undefined) category.addonPrice = addonPrice;

    await category.save();
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update Subcategory
// @route   PUT /api/admin/subcategories/:id
// @access  Private (SuperAdmin, SubAdmin)
exports.updateSubcategory = async (req, res) => {
  try {
    const { name, parentSubcategoryId, isClickable, isMainSubcategory, isLeaderCategory, addonPrice } = req.body;
    const subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ success: false, error: 'Subcategory not found' });
    }

    if (name) subcategory.name = name;
    
    if (parentSubcategoryId !== undefined) {
      subcategory.parentSubcategoryId = parentSubcategoryId || null;
    }
    
    if (isClickable !== undefined) subcategory.isClickable = isClickable;
    if (isMainSubcategory !== undefined) subcategory.isMainSubcategory = isMainSubcategory;
    if (isLeaderCategory !== undefined) subcategory.isLeaderCategory = isLeaderCategory;
    if (addonPrice !== undefined) subcategory.addonPrice = addonPrice;

    await subcategory.save();
    res.status(200).json({ success: true, data: subcategory });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const Coupon = require('../models/Coupon');

// @desc    Get all coupons
// @route   GET /api/admin/coupons
// @access  Private (SuperAdmin)
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: coupons });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create coupon
// @route   POST /api/admin/coupons
// @access  Private (SuperAdmin)
exports.createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'Coupon code already exists' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Update coupon
// @route   PUT /api/admin/coupons/:id
// @access  Private (SuperAdmin)
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Coupon not found' });
    }
    res.status(200).json({ success: true, data: coupon });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/admin/coupons/:id
// @access  Private (SuperAdmin)
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Coupon not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
