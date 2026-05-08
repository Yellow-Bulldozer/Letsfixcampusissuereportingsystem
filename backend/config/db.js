const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error('MONGO_URI is missing. Add your MongoDB Atlas URI to backend/.env.');
    }

    await mongoose.connect(uri);
    const connectionType = uri.startsWith('mongodb+srv://') ? 'MongoDB Atlas' : 'local MongoDB';
    console.log(`${connectionType} connected`);
  } catch (err) {
    console.error('MongoDB connection failed');
    console.error('Set MONGO_URI in backend/.env to your MongoDB Atlas connection string.');
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
