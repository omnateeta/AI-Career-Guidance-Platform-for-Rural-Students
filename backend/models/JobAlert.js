const mongoose = require('mongoose');

const jobAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  locations: [{
    type: String,
    trim: true,
  }],
  jobTypes: [{
    type: String,
    enum: ['private', 'government', 'both'],
    default: 'both',
  }],
  skills: [{
    type: String,
    trim: true,
  }],
  minSalary: {
    type: Number,
  },
  preferredRoles: [{
    type: String,
    trim: true,
  }],
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  whatsappNotifications: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastSentAt: {
    type: Date,
  },
  totalAlertsSent: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes for efficient querying
jobAlertSchema.index({ userId: 1, isActive: 1 });
jobAlertSchema.index({ locations: 1 });
jobAlertSchema.index({ skills: 1 });

module.exports = mongoose.model('JobAlert', jobAlertSchema);
