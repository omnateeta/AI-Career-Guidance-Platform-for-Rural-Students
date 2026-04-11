const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  profile: {
    bio: {
      type: String,
      required: true,
    },
    tagline: String,
    avatar: String,
    yearsOfExperience: Number,
    currentRole: String,
    currentCompany: String,
    linkedIn: String,
    website: String,
  },
  expertise: [{
    type: String,
    required: true,
  }],
  industries: [String],
  languagesSpoken: [{
    type: String,
    default: ['English'],
  }],
  availability: {
    status: {
      type: String,
      enum: ['available', 'busy', 'unavailable'],
      default: 'available',
    },
    maxStudents: {
      type: Number,
      default: 10,
    },
    currentStudents: {
      type: Number,
      default: 0,
    },
    availableHours: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      },
      startTime: String,
      endTime: String,
    }],
  },
  matchedStudents: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    matchedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
  }],
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  reviews: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  totalSessions: {
    type: Number,
    default: 0,
  },
  responseTime: {
    type: String,
    default: 'within 24 hours',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes
mentorSchema.index({ expertise: 1 });
mentorSchema.index({ languagesSpoken: 1 });
mentorSchema.index({ 'rating.average': -1 });
mentorSchema.index({ 'availability.status': 1 });

// Calculate average rating
mentorSchema.methods.calculateRating = function() {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
    return;
  }
  
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  this.rating.average = Math.round((sum / this.reviews.length) * 10) / 10;
  this.rating.count = this.reviews.length;
};

// Check if mentor can accept more students
mentorSchema.methods.canAcceptStudents = function() {
  return this.availability.currentStudents < this.availability.maxStudents &&
         this.availability.status === 'available';
};

module.exports = mongoose.model('Mentor', mentorSchema);
