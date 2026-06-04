const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

// ── Public Routes ─────────────────────────────────────────────────────────────

// GET /api/blogs  — get all published blogs (with pagination)
router.get('/', async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 6;
    const skip  = (page - 1) * limit;

    const query = { isPublished: true };
    if (req.query.category) query.category = req.query.category;

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-content'),  // exclude heavy content in list view
      Blog.countDocuments(query),
    ]);

    res.json({ success: true, data: blogs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/blogs/:slug  — single blog by slug (increments views)
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!blog) return res.status(404).json({ success: false, error: 'Blog not found' });
    res.json({ success: true, data: blog });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Admin Routes (no auth middleware for now – add when needed) ───────────────

// POST /api/blogs  — create blog
router.post('/', async (req, res) => {
  try {
    const blog = await Blog.create(req.body);
    res.status(201).json({ success: true, data: blog });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /api/blogs/:id  — update blog
router.put('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!blog) return res.status(404).json({ success: false, error: 'Blog not found' });
    res.json({ success: true, data: blog });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/blogs/:id  — delete blog
router.delete('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ success: false, error: 'Blog not found' });
    res.json({ success: true, message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
