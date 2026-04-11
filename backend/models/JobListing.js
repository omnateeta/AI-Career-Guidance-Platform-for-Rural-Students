const mongoose = require('mongoose');

const jobListingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  location: {
    city: String,
    district: String,
    state: String,
    country: String,
    remote: {
      type: Boolean,
      default: false,
    },
  },
  geoLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
    },
  },
  description: {
    type: String,
    required: true,
  },
  requiredSkills: [{
    type: String,
  }],
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'INR',
    },
    period: {
      type: String,
      enum: ['hourly', 'monthly', 'yearly'],
      default: 'yearly',
    },
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
    default: 'full-time',
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'executive'],
    default: 'entry',
  },
  educationRequired: String,
  source: {
    type: String,
    default: 'manual',
  },
  sourceUrl: String,
  applicationUrl: String,
  applicationEmail: String,
  postedDate: {
    type: Date,
    default: Date.now,
  },
  deadline: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
  tags: [String],
  benefits: [String],
  views: {
    type: Number,
    default: 0,
  },
  applications: {
    type: Number,
    default: 0,
  },
  externalId: String, // ID from external API
}, {
  timestamps: true,
});

// Indexes
jobListingSchema.index({ title: 'text', company: 'text', description: 'text' });
jobListingSchema.index({ 'location.state': 1, 'location.district': 1, 'location.city': 1 });
jobListingSchema.index({ requiredSkills: 1 });
jobListingSchema.index({ postedDate: -1 });
jobListingSchema.index({ jobType: 1, experienceLevel: 1 });
jobListingSchema.index({ geoLocation: '2dsphere' });
jobListingSchema.index({ isActive: 1, postedDate: -1 });

// Increment views
jobListingSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Find nearby jobs
jobListingSchema.statics.findNearby = async function(longitude, latitude, maxDistance = 50000) {
  return await this.find({
    geoLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance, // in meters
      },
    },
    isActive: true,
  });
};

module.exports = mongoose.model('JobListing', jobListingSchema);
