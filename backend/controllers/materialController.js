const Material = require('../models/Material');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const User = require('../models/User');
const { watermarkVideo } = require('../utils/videoWatermark');
const path = require('path');
const fs = require('fs');

// @desc    Get all categories
// @route   GET /api/materials/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get subcategories by Category ID
// @route   GET /api/materials/categories/:categoryId/subcategories
// @access  Public
exports.getSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.find({ categoryId: req.params.categoryId });
    res.status(200).json({
      success: true,
      data: subcategories
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get all materials with filters (pagination, category, subcategory, type, company, search)
// @route   GET /api/materials
// @access  Public
exports.getMaterials = async (req, res) => {
  try {
    const { categoryId, subcategoryId, type, companyName, search, tag, page = 1, limit = 12 } = req.query;

    const query = {};

    if (categoryId) query.categoryId = categoryId;
    
    if (subcategoryId) {
      const subcategory = await Subcategory.findById(subcategoryId);
      if (subcategory) {
        const allSubcats = await Subcategory.find({ categoryId: subcategory.categoryId });
        const getDescendantIds = (parentId) => {
          let ids = [parentId];
          const children = allSubcats.filter(s => s.parentSubcategoryId && s.parentSubcategoryId.toString() === parentId.toString());
          for (const child of children) {
            ids = [...ids, ...getDescendantIds(child._id)];
          }
          return ids;
        };
        const subcatIds = getDescendantIds(subcategoryId);
        query.subcategoryId = { $in: subcatIds };
      } else {
        query.subcategoryId = subcategoryId;
      }
    }
    if (type) {
      if (type.includes(',')) {
        query.type = { $in: type.split(',') };
      } else {
        query.type = type;
      }
    }
    if (tag) query.tags = tag;
    if (companyName) query.companyName = { $regex: companyName, $options: 'i' };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Material.countDocuments(query);
    const materials = await Material.find(query)
      .populate('watermarkTemplateId')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: materials.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: materials
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Get unique tags for materials
// @route   GET /api/materials/tags
// @access  Public
exports.getTags = async (req, res) => {
  try {
    const { categoryId, subcategoryId } = req.query;
    const query = {};
    if (categoryId) query.categoryId = categoryId;
    if (subcategoryId) {
      const subcategory = await Subcategory.findById(subcategoryId);
      if (subcategory) {
        const allSubcats = await Subcategory.find({ categoryId: subcategory.categoryId });
        const getDescendantIds = (parentId) => {
          let ids = [parentId.toString()];
          const children = allSubcats.filter(s => s.parentSubcategoryId && s.parentSubcategoryId.toString() === parentId.toString());
          for (const child of children) {
            ids = [...ids, ...getDescendantIds(child._id.toString())];
          }
          return ids;
        };
        query.subcategoryId = { $in: getDescendantIds(subcategoryId.toString()) };
      } else {
        query.subcategoryId = subcategoryId.toString();
      }
    }
    
    const tags = await Material.distinct('tags', query);
    res.status(200).json({
      success: true,
      data: tags
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// @desc    Download material (with verification of limits)
// @route   POST /api/materials/:id/download
// @access  Private (Agent/Leader/SubAdmin/SuperAdmin)
exports.downloadMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({
        success: false,
        error: 'Material not found'
      });
    }

    const user = await User.findById(req.user.id).populate('activePlan');

    // If user is an Agent, enforce plan rules
    if (user.role === 'Agent') {
      let limit = 5; // Default legacy free limit

      if (user.activePlan) {
        limit = user.activePlan.dailyDownloadLimit;

        // Plan Access Check
        const matCatId = material.categoryId?.toString();
        const matSubCatId = material.subcategoryId?.toString();

        const allowedCats = user.activePlan.allowedCategories?.map(c => c.toString()) || [];
        const allowedSubCats = user.activePlan.allowedSubcategories?.map(c => c.toString()) || [];

        // If the plan has defined category restrictions
        if (allowedCats.length > 0 || allowedSubCats.length > 0) {
          const hasCatAccess = allowedCats.includes(matCatId);
          const hasSubCatAccess = allowedSubCats.includes(matSubCatId);

          if (!hasCatAccess && !hasSubCatAccess) {
             return res.status(403).json({
               success: false,
               limitReached: true,
               needsUpgrade: true,
               error: 'Premium Content: Your current plan does not include access to this category. Please upgrade your plan!'
             });
          }
        }
      } else if (user.subscriptionType !== 'Free') {
        // Legacy fallback: if they have a legacy paid subscription, maybe give unlimited
        limit = -1;
      }

      // Check daily download limits
      if (limit !== -1) {
        const now = new Date();

        if (now >= user.dailyLimitResetDate) {
          user.downloadCount = 0;
          const tomorrow = new Date();
          tomorrow.setHours(24, 0, 0, 0);
          user.dailyLimitResetDate = tomorrow;
        }

        if (user.downloadCount >= limit) {
          return res.status(403).json({
            success: false,
            limitReached: true,
            needsUpgrade: true,
            error: `Daily limit reached (${limit} items/day). Please upgrade your plan!`
          });
        }

        user.downloadCount += 1;
        await user.save();
      }
    }

    let finalFileUrl = material.fileUrl;

    if (material.type === 'Reel' || material.type === 'Video') {
      try {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const outputFilename = `watermarked-${uniqueSuffix}.mp4`;
        const outputPath = path.join(__dirname, '../../uploads', outputFilename);
        
        const downloadUrl = material.fileUrl.startsWith('/uploads')
          ? `${req.protocol}://${req.get('host')}${material.fileUrl}`
          : material.fileUrl;
        
        await watermarkVideo(downloadUrl, user, outputPath);
        finalFileUrl = `/uploads/${outputFilename}`;
      } catch (err) {
        console.error('Video watermarking failed, serving raw file:', err);
      }
    }

    // Response includes confirmation and the file URL for downloading
    res.status(200).json({
      success: true,
      data: {
        fileUrl: finalFileUrl,
        type: material.type,
        title: material.title,
        downloadCount: user.downloadCount,
        subscriptionType: user.subscriptionType
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
