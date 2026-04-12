const mongoose = require('mongoose');

const communicationProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  mode: {
    type: String,
    enum: ['practice', 'improve', 'translate', 'interview'],
    default: 'practice',
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'kn'],
    default: 'en',
  },
  messagesExchanged: {
    type: Number,
    default: 0,
  },
  averageConfidenceScore: {
    type: Number,
    default: 0,
  },
  xpEarned: {
    type: Number,
    default: 0,
  },
  exercisesCompleted: {
    type: Number,
    default: 0,
  },
  grammarImprovements: {
    type: Number,
    default: 0,
  },
  vocabularyLearned: [{
    type: String,
  }],
  streak: {
    type: Number,
    default: 0,
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner',
  },
  totalXP: {
    type: Number,
    default: 0,
  },
  achievements: [{
    name: String,
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Indexes for efficient querying
communicationProgressSchema.index({ userId: 1, date: -1 });
communicationProgressSchema.index({ userId: 1, level: 1 });
communicationProgressSchema.index({ date: -1 });

// Calculate XP and level
communicationProgressSchema.methods.calculateLevel = function() {
  const totalXP = this.totalXP;
  
  if (totalXP >= 5000) {
    return 'expert';
  } else if (totalXP >= 2000) {
    return 'advanced';
  } else if (totalXP >= 500) {
    return 'intermediate';
  } else {
    return 'beginner';
  }
};

// Award XP
communicationProgressSchema.methods.awardXP = function(points) {
  this.xpEarned += points;
  this.totalXP += points;
  this.level = this.calculateLevel();
  return this.totalXP;
};

// Update streak
communicationProgressSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastDate = this.date ? new Date(this.date) : null;
  lastDate?.setHours(0, 0, 0, 0);
  
  if (!lastDate || lastDate.getTime() === today.getTime()) {
    // First time or already practiced today
    if (lastDate?.getTime() !== today.getTime()) {
      this.streak += 1;
    }
  } else if (lastDate.getTime() === yesterday.getTime()) {
    // Practiced yesterday, continue streak
    this.streak += 1;
  } else {
    // Missed days, reset streak
    this.streak = 1;
  }
  
  return this.streak;
};

// Static method to get or create today's progress
communicationProgressSchema.statics.getTodayProgress = async function(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  let progress = await this.findOne({
    userId,
    date: {
      $gte: today,
      $lt: tomorrow,
    },
  });
  
  if (!progress) {
    progress = await this.create({ userId, date: today });
  }
  
  return progress;
};

// Static method to get weekly stats
communicationProgressSchema.statics.getWeeklyStats = async function(userId) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const stats = await this.aggregate([
    {
      $match: {
        userId,
        date: { $gte: weekAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        totalXP: { $sum: '$xpEarned' },
        messages: { $sum: '$messagesExchanged' },
        avgConfidence: { $avg: '$averageConfidenceScore' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
  
  return stats;
};

module.exports = mongoose.model('CommunicationProgress', communicationProgressSchema);
