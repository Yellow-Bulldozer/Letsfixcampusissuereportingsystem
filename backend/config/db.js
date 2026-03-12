const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/myDatabase';

    await mongoose.connect(uri);
    console.log('MongoDB Connected');
  } catch (err) {
    console.log('Connection Error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
