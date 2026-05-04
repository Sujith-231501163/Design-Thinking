const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://sujith:Dropout@cluster.ppyo8za.mongodb.net/edushield?retryWrites=true&w=majority&appName=Cluster';

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('  ✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('  ❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
