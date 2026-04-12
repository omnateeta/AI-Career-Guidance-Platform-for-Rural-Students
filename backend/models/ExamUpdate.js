const mongoose = require('mongoose');

const examUpdateSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  updateType: {
    type: String,
    required: true,
    enum: ['notification', 'deadline', 'admit-card', 'result', 'postponed', 'cancelled', 'application-open', 'other'],
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  sourceUrl: {
    type: String,
  },
  important: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes
examUpdateSchema.index({ examId: 1, date: -1 });
examUpdateSchema.index({ updateType: 1 });

module.exports = mongoose.model('ExamUpdate', examUpdateSchema);
