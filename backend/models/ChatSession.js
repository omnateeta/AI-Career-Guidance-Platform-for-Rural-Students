const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sessionType: {
    type: String,
    enum: ['ai-chatbot', 'mentor-chat'],
    default: 'ai-chatbot',
  },
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor',
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: 'en',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isVoice: {
      type: Boolean,
      default: false,
    },
  }],
  context: {
    topic: String,
    career: String,
    sentiment: String,
  },
  sessionDuration: {
    type: Number, // in seconds
    default: 0,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5,
    },
    feedback: String,
  },
}, {
  timestamps: true,
});

// Indexes
chatSessionSchema.index({ userId: 1, createdAt: -1 });
chatSessionSchema.index({ sessionType: 1, isActive: 1 });

// Add message to session
chatSessionSchema.methods.addMessage = function(role, content, language = 'en', isVoice = false) {
  this.messages.push({
    role,
    content,
    language,
    isVoice,
    timestamp: new Date(),
  });
  
  // Update session duration
  if (this.startedAt) {
    this.sessionDuration = Math.floor((new Date() - this.startedAt) / 1000);
  }
  
  return this.save();
};

// End session
chatSessionSchema.methods.endSession = function() {
  this.isActive = false;
  this.endedAt = new Date();
  this.sessionDuration = Math.floor((this.endedAt - this.startedAt) / 1000);
  return this.save();
};

// Get recent active session for user
chatSessionSchema.statics.getActiveSession = async function(userId, sessionType = 'ai-chatbot') {
  return await this.findOne({
    userId,
    sessionType,
    isActive: true,
  }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('ChatSession', chatSessionSchema);
