const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  conductingBody: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['UPSC', 'SSC', 'Banking', 'Railway', 'Defence', 'Entrance', 'State PSC', 'Teaching', 'Other'],
  },
  description: {
    type: String,
    required: true,
  },
  
  // Eligibility
  qualification: {
    type: String,
    required: true,
  },
  ageLimit: {
    min: Number,
    max: Number,
    relaxation: String,
  },
  nationality: {
    type: String,
    default: 'Indian',
  },
  
  // Timeline
  examDate: {
    type: Date,
  },
  examDateText: {
    type: String, // For dates like "To be announced"
  },
  applicationStartDate: {
    type: Date,
  },
  applicationDeadline: {
    type: Date,
  },
  admitCardDate: {
    type: Date,
  },
  resultDate: {
    type: Date,
  },
  
  // Links
  officialWebsite: {
    type: String,
    required: true,
  },
  notificationPDF: {
    type: String,
  },
  applicationLink: {
    type: String,
  },
  syllabusLink: {
    type: String,
  },
  
  // Metadata
  vacancies: {
    type: Number,
  },
  examFee: {
    general: Number,
    obc: Number,
    scSt: Number,
  },
  examMode: {
    type: String,
    enum: ['Online', 'Offline', 'Both'],
    default: 'Online',
  },
  stages: [{
    type: String,
  }], // e.g., ['Prelims', 'Mains', 'Interview']
  examPattern: {
    type: String,
  },
  
  // AI Generated Content
  preparationGuide: {
    syllabusOverview: String,
    studyRoadmap: String,
    strategy: String,
    timeline: String,
    resources: String,
    tips: String,
    generatedAt: Date,
  },
  syllabusOverview: {
    type: String,
  },
  
  // Source Tracking
  apiSource: {
    type: String,
    required: true,
  },
  externalId: {
    type: String,
  },
  lastScraped: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  
  // Analytics
  views: {
    type: Number,
    default: 0,
  },
  saves: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
examSchema.index({ category: 1, isActive: 1 });
examSchema.index({ applicationDeadline: 1 });
examSchema.index({ conductingBody: 1 });
examSchema.index({ name: 'text', conductingBody: 'text', description: 'text' });

module.exports = mongoose.model('Exam', examSchema);
