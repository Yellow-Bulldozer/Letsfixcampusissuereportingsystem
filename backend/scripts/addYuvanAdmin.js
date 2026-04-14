/**
 * Script to create admin user: Yuvan
 * Run: node scripts/addYuvanAdmin.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

const addAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const adminData = {
            name: 'Yuvan',
            email: 'yuvan2006@gmail.com',
            password: 'yuvan@06',
            department: 'Administration',
            role: 'admin',
            isActive: true
        };

        // Check if user already exists
        const existing = await User.findOne({ email: adminData.email });
        if (existing) {
            console.log('User with this email already exists.');
            console.log('Existing user role:', existing.role);
            process.exit(0);
        }

        const user = await User.create(adminData);
        console.log('Admin user created successfully!');
        console.log(`  Name:  ${user.name}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Role:  ${user.role}`);

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error.message);
        process.exit(1);
    }
};

addAdmin();
