const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');

// ── Public Routes ─────────────────────────────────────────────────────────────

// GET /api/testimonials  — get all APPROVED testimonials
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isApproved: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: testimonials });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/testimonials  — submit a new testimonial (unapproved by default)
router.post('/', async (req, res) => {
  try {
    const testimonial = await Testimonial.create(req.body);
    res.status(201).json({ success: true, data: testimonial, message: 'Testimonial submitted successfully and is pending approval.' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ── Admin Routes (Protected in real app) ───────────────────────────────────────

// GET /api/testimonials/admin/all  — get ALL testimonials (approved & pending)
router.get('/admin/all', async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json({ success: true, data: testimonials });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/testimonials/admin/:id/approve  — toggle approve status
router.put('/admin/:id/approve', async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, error: 'Testimonial not found' });
    }
    testimonial.isApproved = !testimonial.isApproved;
    await testimonial.save();
    res.json({ success: true, data: testimonial });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/testimonials/admin/:id  — delete a testimonial
router.delete('/admin/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, error: 'Testimonial not found' });
    }
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
