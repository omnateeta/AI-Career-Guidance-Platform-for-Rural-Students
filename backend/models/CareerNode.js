const mongoose = require('mongoose');

const careerNodeSchema = new mongoose.Schema({
  nodeId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  parentNodeId: {
    type: String,
    default: null,
    index: true,
  },
  educationLevel: {
    type: String,
    required: true,
    enum: ['10th', '12th', 'Diploma', 'Degree', 'ITI', 'Certificate', 'Other'],
    index: true,
  },
  label: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['education', 'stream', 'degree', 'specialization', 'career', 'job', 'certification'],
  },
  description: {
    type: String,
    required: true,
  },
  children: [{
    type: String,
  }],
  metadata: {
    duration: String,
    eligibility: String,
    averageSalary: {
      entry: String,
      mid: String,
      senior: String,
    },
    demand: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    growthRate: Number,
    skills: [String],
    educationPath: [String],
    growthOpportunities: [String],
    sourceUrls: [String],
  },
  depth: {
    type: Number,
    default: 0,
  },
  cachedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

// Indexes for efficient querying
careerNodeSchema.index({ educationLevel: 1, parentNodeId: 1 });
careerNodeSchema.index({ category: 1 });
careerNodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to check if node is expired
careerNodeSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Static method to clean expired nodes
careerNodeSchema.statics.cleanExpired = async function() {
  return await this.deleteMany({ expiresAt: { $lte: new Date() } });
};

module.exports = mongoose.model('CareerNode', careerNodeSchema);
