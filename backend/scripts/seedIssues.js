/**
 * Seed Script — 8 sample issues for UI testing
 * Run: node scripts/seedIssues.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Issue = require('../models/Issue');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/letsfixreports';

const SAMPLE_ISSUES = [
  {
    title: 'Water Leakage in Block A Corridor',
    description: 'There is a continuous water leakage from the ceiling pipe in the Block A ground floor corridor near the main entrance. The floor has become slippery and hazardous for students.',
    category: 'water',
    location: { block: 'Block A', floor: 'Ground Floor', room: 'Main Corridor' },
    status: 'Pending',
    priority: 'high',
    verified: false,
  },
  {
    title: 'Broken Bench in Reading Room',
    description: 'Two benches in the library reading room (Room 202) have broken legs. Students are avoiding sitting on them but they remain a safety hazard. They need to be repaired or replaced immediately.',
    category: 'bench',
    location: { block: 'Library Building', floor: '2nd Floor', room: 'Reading Room 202' },
    status: 'Pending',
    priority: 'medium',
    verified: false,
  },
  {
    title: 'Street Light Outage Near Parking Lot',
    description: 'Three street lights near the main parking lot have been non-functional for over two weeks. Students returning from evening classes face difficulty and safety concerns in the dark area.',
    category: 'electrical',
    location: { block: 'Main Building', floor: 'Ground Floor', room: 'Parking Lot' },
    status: 'Ongoing',
    priority: 'high',
    verified: true,
  },
  {
    title: 'Washroom Not Cleaned Regularly',
    description: 'The washrooms on the 3rd floor of Block B have not been cleaned properly for the past week. The bins are overflowing and there is a foul smell. Immediate attention from the housekeeping team is required.',
    category: 'washroom',
    location: { block: 'Block B', floor: '3rd Floor', room: 'Washroom 3B' },
    status: 'Pending',
    priority: 'high',
    verified: true,
  },
  {
    title: 'Projector Not Working in Room 301',
    description: 'The projector in Classroom 301 has been malfunctioning for 4 days. It turns off randomly mid-lecture causing disruptions. Multiple faculty members have reported this issue verbally to the department.',
    category: 'classroom',
    location: { block: 'Block C', floor: '3rd Floor', room: 'Room 301' },
    status: 'Ongoing',
    priority: 'critical',
    verified: true,
  },
  {
    title: 'WiFi Not Working in Seminar Hall',
    description: 'The WiFi access point in the Main Seminar Hall has been offline for 3 days. Multiple workshops and online sessions have been affected. The IT department has been informed but no action has been taken.',
    category: 'internet',
    location: { block: 'Main Building', floor: '1st Floor', room: 'Main Seminar Hall' },
    status: 'Pending',
    priority: 'critical',
    verified: false,
  },
  {
    title: 'Damaged Road Near Block D Gate',
    description: 'The road near the Block D entrance has a large pothole that formed after recent rains. Several students have tripped over it, and two-wheeler riders have had near-miss accidents. This needs urgent repair.',
    category: 'infrastructure',
    location: { block: 'Block D', floor: 'Ground Floor', room: 'Main Gate' },
    status: 'Completed',
    priority: 'high',
    verified: true,
  },
  {
    title: 'Garbage Bins Overflowing in Canteen Area',
    description: 'The garbage bins near the canteen have been overflowing since Monday. The smell is affecting students dining in the nearby seating area. The cleaning staff has not collected the waste on schedule.',
    category: 'cleanliness',
    location: { block: 'Main Building', floor: 'Ground Floor', room: 'Canteen Area' },
    status: 'Pending',
    priority: 'medium',
    verified: false,
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find a student user to use as reporter
    const student = await User.findOne({ role: 'student' });
    if (!student) {
      console.error('❌ No student user found. Please create a student account first by signing up via the app.');
      process.exit(1);
    }
    console.log(`👤 Using student: ${student.name} (${student.email}) as reporter`);

    // Insert issues
    const issues = SAMPLE_ISSUES.map(issue => ({
      ...issue,
      reportedBy: student._id,
    }));

    const inserted = await Issue.insertMany(issues);
    console.log(`\n🎉 Successfully seeded ${inserted.length} issues:\n`);
    inserted.forEach((issue, i) => {
      console.log(`  ${i + 1}. [${issue.status}] ${issue.title}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Done! Refresh the app to see the issues.');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
