const mongoose = require('mongoose');

const savedExamSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
  reminderEnabled: {
    type: Boolean,
    default: true,
  },
  reminderDaysBefore: {
    type: Number,
    default: 7, // Days before deadline to remind
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Ensure unique saved exams per user
savedExamSchema.index({ userId: 1, examId: 1 }, { unique: true });
savedExamSchema.index({ userId: 1, savedAt: -1 });

module.exports = mongoose.model('SavedExam', savedExamSchema);
