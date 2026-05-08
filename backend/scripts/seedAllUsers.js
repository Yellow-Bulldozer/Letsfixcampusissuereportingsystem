/**
 * Script to seed all admin and authority users into a fresh database
 * Run: node scripts/seedAllUsers.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const users = [
  {
    name: 'Vivek',
    email: 'veeramokshit1pro@gmail.com',
    password: 'vivek@06',
    department: 'Administration',
    role: 'admin',
    isActive: true
  },
  {
    name: 'Yuvan',
    email: 'yuvan2006@gmail.com',
    password: 'yuvan@06',
    department: 'Administration',
    role: 'admin',
    isActive: true
  },
  {
    name: 'College Authority',
    email: `authority@grietcollege.com`,
    password: 'authority123',
    department: 'Management',
    role: 'authority',
    isActive: true
  }
];

const seedAllUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    for (const userData of users) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`⚠️  Already exists: ${userData.email} (role: ${existing.role})`);
      } else {
        const user = await User.create(userData);
        console.log(`✅ Created: ${user.name} | ${user.email} | role: ${user.role}`);
      }
    }

    console.log('\n🎉 Done! All users have been seeded.');
    console.log('\nLogin credentials:');
    console.log('  Admin 1  → veeramokshit1pro@gmail.com  / vivek@06');
    console.log('  Admin 2  → yuvan2006@gmail.com         / yuvan@06');
    console.log('  Authority → authority@grietcollege.com / authority123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    process.exit(1);
  }
};

seedAllUsers();
