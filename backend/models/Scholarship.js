const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  provider: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['government', 'private'],
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  
  eligibility: {
    educationLevel: [{
      type: String,
      enum: ['10th', '11th', '12th', 'Diploma', 'Undergraduate', 'Postgraduate', 'PhD', 'Any'],
    }],
    minPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    category: [{
      type: String,
      enum: ['General', 'OBC', 'SC', 'ST', 'Minority', 'Any'],
    }],
    incomeLimit: {
      type: Number, // Annual family income in INR
    },
    state: [{
      type: String,
    }],
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Any'],
      default: 'Any',
    },
    otherCriteria: String,
  },
  
  benefits: {
    amount: {
      type: String, // e.g., "₹50,000/year"
      required: true,
    },
    type: {
      type: String,
      enum: ['full', 'partial', 'monthly-stipend', 'one-time', 'reimbursement'],
    },
    additionalBenefits: [{
      type: String, // e.g., 'books', 'hostel', 'travel', 'laptop'
    }],
  },
  
  deadlines: {
    startDate: Date,
    endDate: {
      type: Date,
      required: true,
    },
    isRolling: {
      type: Boolean,
      default: false,
    },
  },
  
  applicationDetails: {
    applyLink: {
      type: String,
      required: true,
    },
    requiresOnline: {
      type: Boolean,
      default: true,
    },
    documentsRequired: [{
      type: String,
    }],
  },
  
  metadata: {
    sourceUrl: String,
    lastVerified: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    verificationStatus: {
      type: String,
      enum: ['verified', 'pending', 'expired'],
      default: 'pending',
    },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better query performance
scholarshipSchema.index({ type: 1 });
scholarshipSchema.index({ 'eligibility.educationLevel': 1 });
scholarshipSchema.index({ 'eligibility.state': 1 });
scholarshipSchema.index({ 'eligibility.category': 1 });
scholarshipSchema.index({ 'deadlines.endDate': 1 });
scholarshipSchema.index({ 'metadata.isActive': 1 });
scholarshipSchema.index({ name: 'text', provider: 'text', description: 'text' });

// Virtual for checking if scholarship is expired
scholarshipSchema.virtual('isExpired').get(function() {
  if (!this.deadlines.endDate) return false;
  if (this.deadlines.isRolling) return false;
  return new Date() > this.deadlines.endDate;
});

// Virtual for days until deadline
scholarshipSchema.virtual('daysUntilDeadline').get(function() {
  if (!this.deadlines.endDate) return null;
  if (this.deadlines.isRolling) return 999;
  const now = new Date();
  const deadline = new Date(this.deadlines.endDate);
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to check if student is eligible
scholarshipSchema.methods.checkEligibility = function(studentProfile) {
  const { educationLevel, category, state, income, gender } = studentProfile;
  
  let isEligible = true;
  let reasons = [];

  // Check education level
  if (this.eligibility.educationLevel.length > 0 && 
      !this.eligibility.educationLevel.includes('Any') &&
      educationLevel && !this.eligibility.educationLevel.includes(educationLevel)) {
    isEligible = false;
    reasons.push(`Requires: ${this.eligibility.educationLevel.join(', ')}`);
  }

  // Check category
  if (this.eligibility.category.length > 0 && 
      !this.eligibility.category.includes('Any') &&
      category && !this.eligibility.category.includes(category)) {
    isEligible = false;
    reasons.push(`Category restriction: ${this.eligibility.category.join(', ')}`);
  }

  // Check state
  if (this.eligibility.state.length > 0 && state && 
      !this.eligibility.state.includes(state)) {
    isEligible = false;
    reasons.push(`State restriction: ${this.eligibility.state.join(', ')}`);
  }

  // Check income limit
  if (this.eligibility.incomeLimit && income && income > this.eligibility.incomeLimit) {
    isEligible = false;
    reasons.push(`Income exceeds limit of ₹${this.eligibility.incomeLimit.toLocaleString()}`);
  }

  // Check gender
  if (this.eligibility.gender !== 'Any' && gender && this.eligibility.gender !== gender) {
    isEligible = false;
    reasons.push(`Gender restriction: ${this.eligibility.gender}`);
  }

  // Check if expired
  if (this.isExpired) {
    isEligible = false;
    reasons.push('Scholarship deadline has passed');
  }

  return {
    isEligible,
    reasons,
    daysUntilDeadline: this.daysUntilDeadline,
  };
};

module.exports = mongoose.model('Scholarship', scholarshipSchema);
