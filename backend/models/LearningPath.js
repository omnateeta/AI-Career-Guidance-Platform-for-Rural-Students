const mongoose = require('mongoose');

const learningPathSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  careerPath: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  estimatedDuration: {
    type: String,
    default: '6 months',
  },
  steps: [{
    stepNumber: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    type: {
      type: String,
      enum: ['course', 'video', 'certification', 'project', 'article', 'tutorial', 'assessment'],
      required: true,
    },
    resources: [{
      title: String,
      url: String,
      platform: String,
      duration: String,
      thumbnail: String,
      isFree: Boolean,
      rating: Number,
    }],
    estimatedTime: String,
    skills: [String],
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
    notes: String,
  }],
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  startedAt: Date,
  completedAt: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
  milestones: [{
    title: String,
    stepNumber: Number,
    reward: {
      xp: Number,
      badge: String,
    },
  }],
}, {
  timestamps: true,
});

// Indexes
learningPathSchema.index({ userId: 1, careerPath: 1 });
learningPathSchema.index({ userId: 1, isActive: 1 });

// Calculate overall progress
learningPathSchema.methods.calculateProgress = function() {
  if (!this.steps || this.steps.length === 0) {
    this.overallProgress = 0;
    return 0;
  }
  
  const completedSteps = this.steps.filter(step => step.completed).length;
  this.overallProgress = Math.round((completedSteps / this.steps.length) * 100);
  
  // Mark as completed if all steps are done
  if (this.overallProgress === 100 && !this.completedAt) {
    this.completedAt = new Date();
    this.isActive = false;
  }
  
  return this.overallProgress;
};

// Mark step as complete
learningPathSchema.methods.markStepComplete = function(stepNumber) {
  const step = this.steps.find(s => s.stepNumber === stepNumber);
  if (step) {
    step.completed = true;
    step.completedAt = new Date();
    return this.calculateProgress();
  }
  return null;
};

module.exports = mongoose.model('LearningPath', learningPathSchema);
