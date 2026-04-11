const mongoose = require('mongoose');

const careerRecommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recommendedCareers: [{
    careerTitle: {
      type: String,
      required: true,
    },
    matchPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    description: String,
    requiredSkills: [String],
    averageSalary: {
      entry: Number,
      mid: Number,
      senior: Number,
    },
    growthOutlook: {
      type: String,
      enum: ['growing', 'stable', 'declining'],
    },
    educationRequired: String,
    reasoning: String,
  }],
  inputProfile: {
    interests: [String],
    skills: [String],
    marks: Number,
    location: String,
    educationLevel: String,
  },
  generatedBy: {
    type: String,
    default: 'ai-service-v1',
  },
  version: {
    type: String,
    default: '1.0.0',
  },
}, {
  timestamps: true,
});

// Indexes
careerRecommendationSchema.index({ userId: 1, createdAt: -1 });

// Get latest recommendation for a user
careerRecommendationSchema.statics.getLatestForUser = async function(userId) {
  return await this.findOne({ userId }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('CareerRecommendation', careerRecommendationSchema);
