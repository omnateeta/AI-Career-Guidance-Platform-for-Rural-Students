const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['student', 'mentor', 'admin'],
    default: 'student',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  profile: {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    age: {
      type: Number,
      min: 10,
      max: 100,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    },
    location: {
      district: String,
      state: String,
      country: {
        type: String,
        default: 'India',
      },
      pincode: String,
    },
    languagePreference: {
      type: String,
      default: 'en',
    },
    phoneNumber: String,
    avatar: String,
  },
  education: {
    currentLevel: {
      type: String,
      enum: ['primary', 'secondary', 'higher_secondary', 'undergraduate', 'graduate', 'other'],
    },
    marks: {
      percentage: Number,
      grade: String,
    },
    subjects: [String],
    school: String,
  },
  skills: [{
    name: {
      type: String,
      required: true,
    },
    proficiency: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    category: {
      type: String,
      enum: ['technical', 'soft', 'language', 'creative', 'analytical', 'other'],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  }],
  interests: [{
    type: String,
    trim: true,
  }],
  careerGoals: [{
    career: String,
    priority: {
      type: Number,
      min: 1,
      max: 5,
    },
  }],
  gamification: {
    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    badges: [{
      name: String,
      description: String,
      earnedAt: {
        type: Date,
        default: Date.now,
      },
      icon: String,
    }],
    streak: {
      count: {
        type: Number,
        default: 0,
      },
      lastActivityDate: Date,
    },
    totalLogins: {
      type: Number,
      default: 0,
    },
  },
  preferences: {
    lowBandwidthMode: {
      type: Boolean,
      default: false,
    },
    notifications: {
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      jobAlerts: {
        type: Boolean,
        default: true,
      },
      learningReminders: {
        type: Boolean,
        default: true,
      },
    },
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date,
}, {
  timestamps: true,
});

// Index for better query performance
userSchema.index({ 'profile.location.state': 1, 'profile.location.district': 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update gamification streak
userSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActivity = this.gamification.streak.lastActivityDate;
  
  if (!lastActivity) {
    this.gamification.streak.count = 1;
  } else {
    const lastDate = new Date(lastActivity);
    lastDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      this.gamification.streak.count += 1;
    } else if (diffDays > 1) {
      this.gamification.streak.count = 1; // Reset streak
    }
  }
  
  this.gamification.streak.lastActivityDate = today;
  this.gamification.totalLogins += 1;
};

// Award XP
userSchema.methods.awardXP = function(points) {
  this.gamification.xp += points;
  
  // Level up every 1000 XP
  const newLevel = Math.floor(this.gamification.xp / 1000) + 1;
  if (newLevel > this.gamification.level) {
    this.gamification.level = newLevel;
  }
};

// Add badge
userSchema.methods.addBadge = function(badge) {
  const exists = this.gamification.badges.find(b => b.name === badge.name);
  if (!exists) {
    this.gamification.badges.push(badge);
  }
};

module.exports = mongoose.model('User', userSchema);
