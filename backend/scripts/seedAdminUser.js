/**
 * Script to create initial admin and authority users
 * Run: node scripts/seedAdminUser.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB Connected');
    
    // Admin user
    const adminData = {
      name: 'Admin User',
      email: `admin${process.env.COLLEGE_EMAIL_DOMAIN || '@yourcollege.edu'}`,
      password: 'admin123', // Change this!
      department: 'Administration',
      role: 'admin',
      isActive: true
    };
    
    // Authority user
    const authorityData = {
      name: 'College Authority',
      email: `authority${process.env.COLLEGE_EMAIL_DOMAIN || '@yourcollege.edu'}`,
      password: 'authority123', // Change this!
      department: 'Management',
      role: 'authority',
      isActive: true
    };
    
    // Check if admin exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      await User.create(adminData);
      console.log('Admin user created successfully');
      console.log(`Email: ${adminData.email}`);
      console.log(`Password: ${adminData.password}`);
    }
    
    // Check if authority exists
    const existingAuthority = await User.findOne({ email: authorityData.email });
    if (existingAuthority) {
      console.log('Authority user already exists');
    } else {
      await User.create(authorityData);
      console.log('Authority user created successfully');
      console.log(`Email: ${authorityData.email}`);
      console.log(`Password: ${authorityData.password}`);
    }
    
    console.log('\n⚠️  IMPORTANT: Change these passwords immediately after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
