const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const Material = require('../models/Material');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/policybhandar');
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Subcategory.deleteMany();
    await Material.deleteMany();

    console.log('Existing data cleared.');

    // Create SuperAdmin User
    const adminUser = await User.create({
      name: 'Prashant Kumar Jha',
      mobile: '9999999999',
      email: 'admin@policybhandar.com',
      password: '123456789', // Will be hashed by user schema pre-save hook
      role: 'SuperAdmin',
      isVerified: true,
      state: 'Bihar',
      city: 'Patna',
      agentType: 'Multiple',
      company: 'All',
      subscriptionType: 'Yearly'
    });

    console.log('Admin user created.');

    // Categories
    const categories = [
      { name: 'Health Insurance', icon: 'heartPulse' },
      { name: 'Life Insurance', icon: 'shield' },
      { name: 'Motor Insurance', icon: 'car' },
      { name: 'Mutual Funds', icon: 'trendingUp' },
      { name: 'Recruitment', icon: 'users' },
      { name: 'Greetings & Festivals', icon: 'gift' }
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log('Categories created.');

    // Find category IDs
    const healthCat = createdCategories.find(c => c.name === 'Health Insurance');
    const lifeCat = createdCategories.find(c => c.name === 'Life Insurance');
    const motorCat = createdCategories.find(c => c.name === 'Motor Insurance');
    const mfCat = createdCategories.find(c => c.name === 'Mutual Funds');
    const recruitCat = createdCategories.find(c => c.name === 'Recruitment');
    const greetCat = createdCategories.find(c => c.name === 'Greetings & Festivals');

    // Root Subcategories
    const rootSubcategories = [
      // Health
      { categoryId: healthCat._id, name: 'Individual Health' },
      { categoryId: healthCat._id, name: 'Family Floater' },
      { categoryId: healthCat._id, name: 'Critical Illness' },
      // Life
      { categoryId: lifeCat._id, name: 'Term Plans' },
      { categoryId: lifeCat._id, name: 'ULIP Plans' },
      // Motor
      { categoryId: motorCat._id, name: 'Car Insurance' },
      { categoryId: motorCat._id, name: 'Two Wheeler' },
      // MF
      { categoryId: mfCat._id, name: 'SIP' },
      { categoryId: mfCat._id, name: 'ELSS Tax Saver' },
      // Recruitment
      { categoryId: recruitCat._id, name: 'Become an Agent' },
      // Greetings
      { categoryId: greetCat._id, name: 'Festival Wishes' },
      { categoryId: greetCat._id, name: 'Daily Motivation' }
    ];

    const createdRootSubcategories = await Subcategory.insertMany(rootSubcategories);
    console.log('Root subcategories created.');

    // Find Root Subcategory IDs
    const individualSub = createdRootSubcategories.find(s => s.name === 'Individual Health');
    const familySub = createdRootSubcategories.find(s => s.name === 'Family Floater');
    const termSub = createdRootSubcategories.find(s => s.name === 'Term Plans');
    const sipSub = createdRootSubcategories.find(s => s.name === 'SIP');
    const agentSub = createdRootSubcategories.find(s => s.name === 'Become an Agent');
    const festivalSub = createdRootSubcategories.find(s => s.name === 'Festival Wishes');

    // Nested Subcategories (Child Levels)
    const childSubcategories = [
      { categoryId: healthCat._id, parentSubcategoryId: familySub._id, name: 'Star Health Family' },
      { categoryId: healthCat._id, parentSubcategoryId: familySub._id, name: 'HDFC Family Floater' },
      { categoryId: lifeCat._id, parentSubcategoryId: termSub._id, name: 'LIC Term Plans' },
      { categoryId: lifeCat._id, parentSubcategoryId: termSub._id, name: 'HDFC Click 2 Protect' }
    ];

    const createdChildSubcategories = await Subcategory.insertMany(childSubcategories);
    console.log('Child subcategories created.');

    const starHealthFamilySub = createdChildSubcategories.find(s => s.name === 'Star Health Family');
    const licTermSub = createdChildSubcategories.find(s => s.name === 'LIC Term Plans');

    // Materials
    const materials = [
      {
        title: 'Star Health Optima Banner',
        categoryId: healthCat._id,
        subcategoryId: individualSub._id,
        type: 'Banner',
        fileUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600',
        thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=200',
        companyName: 'Star Health',
        tags: ['health', 'individual', 'star health', 'banner'],
        isPremium: false,
        uploadedBy: adminUser._id
      },
      {
        title: 'Family Health Cover Protection Reel',
        categoryId: healthCat._id,
        subcategoryId: familySub._id,
        type: 'Reel',
        fileUrl: 'https://assets.mixkit.co/videos/preview/mixkit-happy-family-in-nature-380-large.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=200',
        companyName: 'HDFC Ergo',
        tags: ['family', 'floater', 'reel', 'video'],
        isPremium: true,
        uploadedBy: adminUser._id
      },
      {
        title: 'Star Health Family Optima Banner',
        categoryId: healthCat._id,
        subcategoryId: starHealthFamilySub._id,
        type: 'Banner',
        fileUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600',
        thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=200',
        companyName: 'Star Health',
        tags: ['health', 'family', 'star health', 'banner'],
        isPremium: false,
        uploadedBy: adminUser._id
      },
      {
        title: 'LIC Jeevan Utsav Plan Brochure',
        categoryId: lifeCat._id,
        subcategoryId: termSub._id,
        type: 'PDF',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        thumbnail: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=200',
        companyName: 'LIC',
        tags: ['lic', 'jeevan utsav', 'pdf', 'brochure'],
        isPremium: false,
        uploadedBy: adminUser._id
      },
      {
        title: 'LIC Tech Term Plan Premium',
        categoryId: lifeCat._id,
        subcategoryId: licTermSub._id,
        type: 'PDF',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        thumbnail: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=200',
        companyName: 'LIC',
        tags: ['lic', 'term', 'pdf', 'brochure'],
        isPremium: true,
        uploadedBy: adminUser._id
      },
      {
        title: 'Power of Compounding (SIP Explained)',
        categoryId: mfCat._id,
        subcategoryId: sipSub._id,
        type: 'Banner',
        fileUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=600',
        thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=200',
        companyName: 'ICICI Prudential',
        tags: ['sip', 'compounding', 'mutual fund', 'banner'],
        isPremium: false,
        uploadedBy: adminUser._id
      },
      {
        title: 'Join Our Team - Agent Recruitment Banner',
        categoryId: recruitCat._id,
        subcategoryId: agentSub._id,
        type: 'Banner',
        fileUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=600',
        thumbnail: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=200',
        companyName: 'Policybhandar',
        tags: ['recruitment', 'become agent', 'job', 'banner'],
        isPremium: false,
        uploadedBy: adminUser._id
      },
      {
        title: 'Happy Diwali Greeting 2026',
        categoryId: greetCat._id,
        subcategoryId: festivalSub._id,
        type: 'Banner',
        fileUrl: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?q=80&w=600',
        thumbnail: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?q=80&w=200',
        companyName: 'Policybhandar',
        tags: ['diwali', 'festival', 'greetings', 'wishes'],
        isPremium: false,
        uploadedBy: adminUser._id
      }
    ];

    await Material.insertMany(materials);
    console.log('Materials created.');

    console.log('Database Seeding Successful!');
    process.exit();
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
};

seedData();
