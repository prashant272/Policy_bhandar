const Material = require('../models/Material');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const User = require('../models/User');
const WatermarkTemplate = require('../models/WatermarkTemplate');
const { watermarkVideo } = require('../utils/videoWatermark');
const path = require('path');
const fs = require('fs');

// In-memory store for active download jobs
const downloadJobs = {};

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

    // Fetch the latest watermark template to use as the default if none is set
    const defaultTemplate = await WatermarkTemplate.findOne().sort({ createdAt: -1 });

    const processedMaterials = materials.map(m => {
      const obj = m.toObject();
      if (!obj.watermarkTemplateId && defaultTemplate) {
        obj.watermarkTemplateId = defaultTemplate.toObject();
      }
      return obj;
    });

    res.status(200).json({
      success: true,
      count: materials.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: processedMaterials
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
    const material = await Material.findById(req.params.id).populate('watermarkTemplateId');
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

    console.log('Download req.body:', req.body);
    const { resolution } = req.body || {};
    let finalFileUrl = material.fileUrl;

    if (material.type === 'Reel' || material.type === 'Video') {
      const jobId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      downloadJobs[jobId] = {
        status: 'processing',
        progress: 0,
        fileUrl: null,
        error: null
      };

      // Start processing in background
      (async () => {
        try {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const outputFilename = `watermarked-${uniqueSuffix}.mp4`;
          const outputPath = path.join(__dirname, '../uploads', outputFilename);
          
          const downloadUrl = material.fileUrl.startsWith('/uploads')
            ? `${req.protocol}://${req.get('host')}${material.fileUrl}`
            : material.fileUrl;
          
          let template = material.watermarkTemplateId;
          if (!template) {
            template = await WatermarkTemplate.findOne().sort({ createdAt: -1 });
          }

          console.log(`Starting background watermarking for job ${jobId}, resolution: ${resolution}`);
          await watermarkVideo(downloadUrl, user, outputPath, resolution, template, (percent) => {
            downloadJobs[jobId].progress = percent;
            console.log(`Job ${jobId} progress: ${percent}%`);
          });

          downloadJobs[jobId].fileUrl = `/uploads/${outputFilename}`;
          downloadJobs[jobId].status = 'completed';
          downloadJobs[jobId].progress = 100;
          console.log(`Job ${jobId} completed successfully! File URL: ${downloadJobs[jobId].fileUrl}`);
        } catch (err) {
          console.error(`Async video watermarking failed for job ${jobId}:`, err);
          downloadJobs[jobId].status = 'failed';
          downloadJobs[jobId].error = err.message;
        }
      })();

      return res.status(202).json({
        success: true,
        data: {
          jobId,
          type: material.type,
          title: material.title,
          downloadCount: user.downloadCount,
          subscriptionType: user.subscriptionType
        }
      });
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

// @desc    Direct download forcing attachment header
// @route   GET /api/materials/download-direct
// @access  Public
exports.downloadDirect = async (req, res) => {
  try {
    const { file, name } = req.query;
    if (!file) {
      return res.status(400).send('File path is required');
    }

    if (file.startsWith('http://') || file.startsWith('https://')) {
      const axios = require('axios');
      const response = await axios({
        url: file,
        method: 'GET',
        responseType: 'stream'
      });
      
      const cleanName = name || path.basename(new URL(file).pathname);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(cleanName)}"`);
      res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
      response.data.pipe(res);
      return;
    }

    // Resolve path safely (strip leading slash/backslash to prevent path.join from treating it as root on Windows)
    const cleanFile = file.replace(/^[/\\]+/, '');
    const normalizedFile = path.normalize(cleanFile).replace(/^(\.\.(\/|\\))+/, '');
    const absolutePath = path.join(__dirname, '..', normalizedFile);
    console.log(`Direct download resolving file path: ${absolutePath}`);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).send('File not found');
    }

    res.download(absolutePath, name || path.basename(absolutePath), (err) => {
      if (err) {
        if (err.code !== 'ECONNABORTED' && err.message !== 'Request aborted') {
          console.error('Download callback error:', err);
        } else {
          console.log('Download request was aborted or finished by the client.');
        }
      }
      // Delete temp watermarked video file immediately to free server storage
      if (path.basename(absolutePath).startsWith('watermarked-')) {
        fs.unlink(absolutePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Failed to delete temporary watermarked file:', unlinkErr);
          } else {
            console.log('Successfully deleted temporary watermarked file:', absolutePath);
          }
        });
      }
    });
  } catch (err) {
    console.error('Direct download error:', err);
    res.status(500).send('Server Error during download');
  }
};

// @desc    Get download job status/progress
// @route   GET /api/materials/download-job/:jobId
// @access  Public
exports.getDownloadJobStatus = async (req, res) => {
  const { jobId } = req.params;
  const job = downloadJobs[jobId];
  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Job not found'
    });
  }

  res.status(200).json({
    success: true,
    data: job
  });
};
