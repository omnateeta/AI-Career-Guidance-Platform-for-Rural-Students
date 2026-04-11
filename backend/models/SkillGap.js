const mongoose = require('mongoose');

const skillGapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetCareer: {
    type: String,
    required: true,
  },
  requiredSkills: [{
    name: String,
    importance: {
      type: Number,
      min: 1,
      max: 10,
    },
    category: String,
  }],
  currentSkills: [{
    name: String,
    proficiency: {
      type: Number,
      min: 0,
      max: 100,
    },
    category: String,
  }],
  missingSkills: [{
    name: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
    },
    estimatedLearningTime: String,
    learningResources: [{
      title: String,
      type: {
        type: String,
        enum: ['course', 'video', 'article', 'certification', 'tutorial'],
      },
      url: String,
      platform: String,
      duration: String,
      isFree: Boolean,
    }],
  }],
  overallMatchPercentage: {
    type: Number,
    min: 0,
    max: 100,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  recommendations: [String],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
skillGapSchema.index({ userId: 1, targetCareer: 1 });
skillGapSchema.index({ userId: 1, lastUpdated: -1 });

// Get latest skill gap analysis for a user and career
skillGapSchema.statics.getLatestForUserAndCareer = async function(userId, career) {
  return await this.findOne({ userId, targetCareer: career }).sort({ lastUpdated: -1 });
};

module.exports = mongoose.model('SkillGap', skillGapSchema);
