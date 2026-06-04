const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Serve static upload files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
app.use('/api/watermarks', require('./routes/watermarkRoutes'));
app.use('/api/trainings', require('./routes/trainingRoutes'));
app.use('/api/plans', require('./routes/planRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
// Inline Contact Inquiry Route
app.post('/api/contacts', async (req, res) => {
  try {
    const { name, email, phone, message, source } = req.body;
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
    const newContact = await ContactModel.create({ name, email, phone, message, source });
    res.status(201).json({ success: true, data: newContact });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Basic health route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Policybhandar API' });
});

// Error handling middleware (fallback)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
