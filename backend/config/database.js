const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Create indexes for better query performance
    await createIndexes();
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const User = require('../models/User');
    const JobListing = require('../models/JobListing');
    const Mentor = require('../models/Mentor');

    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ 'profile.location.state': 1 });
    await User.collection.createIndex({ 'profile.location.district': 1 });

    // Job listing indexes
    await JobListing.collection.createIndex({ location: 1 });
    await JobListing.collection.createIndex({ requiredSkills: 1 });
    await JobListing.collection.createIndex({ postedDate: -1 });
    await JobListing.collection.createIndex({ geoLocation: '2dsphere' });

    // Mentor indexes
    await Mentor.collection.createIndex({ expertise: 1 });
    await Mentor.collection.createIndex({ languagesSpoken: 1 });

    console.log('✅ Database indexes created');
  } catch (error) {
    console.error('⚠️  Error creating indexes:', error.message);
  }
};

module.exports = connectDB;
