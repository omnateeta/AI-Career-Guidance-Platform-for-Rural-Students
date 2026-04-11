const mongoose = require('mongoose');

const careerSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  startingEducation: {
    type: String,
    required: true,
  },
  exploredNodes: [{
    nodeId: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    depth: Number,
  }],
  selectedCareerPath: [{
    type: String,
  }],
  completedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes
careerSessionSchema.index({ userId: 1, createdAt: -1 });
careerSessionSchema.index({ startingEducation: 1 });

// Method to add explored node
careerSessionSchema.methods.exploreNode = function(nodeId, depth) {
  this.exploredNodes.push({
    nodeId,
    timestamp: new Date(),
    depth,
  });
  return this.save();
};

// Method to complete session with selected path
careerSessionSchema.methods.completeSession = function(careerPath) {
  this.selectedCareerPath = careerPath;
  this.completedAt = new Date();
  return this.save();
};

// Static method to get user's recent sessions
careerSessionSchema.statics.getUserSessions = async function(userId, limit = 10) {
  return await this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'profile.name email');
};

module.exports = mongoose.model('CareerSession', careerSessionSchema);
