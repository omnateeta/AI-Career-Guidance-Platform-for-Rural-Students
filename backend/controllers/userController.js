const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { profile, education, skills, interests, careerGoals, preferences } = req.body;

    // Find user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update profile information
    if (profile) {
      if (profile.name) user.profile.name = profile.name;
      if (profile.age !== undefined) user.profile.age = profile.age;
      if (profile.gender) user.profile.gender = profile.gender;
      if (profile.phoneNumber !== undefined) user.profile.phoneNumber = profile.phoneNumber;
      if (profile.avatar !== undefined) user.profile.avatar = profile.avatar;
      
      if (profile.location) {
        if (profile.location.district !== undefined) user.profile.location.district = profile.location.district;
        if (profile.location.state !== undefined) user.profile.location.state = profile.location.state;
        if (profile.location.pincode !== undefined) user.profile.location.pincode = profile.location.pincode;
        if (profile.location.country !== undefined) user.profile.location.country = profile.location.country;
      }
      
      if (profile.languagePreference) {
        user.profile.languagePreference = profile.languagePreference;
      }
    }

    // Update education information
    if (education) {
      if (education.currentLevel) user.education.currentLevel = education.currentLevel;
      if (education.school !== undefined) user.education.school = education.school;
      
      if (education.marks) {
        if (education.marks.percentage !== undefined) user.education.marks.percentage = education.marks.percentage;
        if (education.marks.grade !== undefined) user.education.marks.grade = education.marks.grade;
      }
      
      if (education.subjects) {
        user.education.subjects = education.subjects;
      }
    }

    // Update skills
    if (skills) {
      user.skills = skills;
    }

    // Update interests
    if (interests) {
      user.interests = interests;
    }

    // Update career goals
    if (careerGoals) {
      user.careerGoals = careerGoals;
    }

    // Update preferences
    if (preferences) {
      if (preferences.lowBandwidthMode !== undefined) {
        user.preferences.lowBandwidthMode = preferences.lowBandwidthMode;
      }
      if (preferences.notifications) {
        if (preferences.notifications.email !== undefined) {
          user.preferences.notifications.email = preferences.notifications.email;
        }
        if (preferences.notifications.push !== undefined) {
          user.preferences.notifications.push = preferences.notifications.push;
        }
        if (preferences.notifications.jobAlerts !== undefined) {
          user.preferences.notifications.jobAlerts = preferences.notifications.jobAlerts;
        }
        if (preferences.notifications.learningReminders !== undefined) {
          user.preferences.notifications.learningReminders = preferences.notifications.learningReminders;
        }
      }
    }

    // Save updated user
    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(user.id).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: error.message
    });
  }
};

module.exports = {
  getProfile,
  updateProfile
};
