const { generateToken, generateResetToken } = require('../middleware/auth');
const { ValidationError, AuthenticationError, NotFoundError } = require('../utils/errorHandler');
const { sendResponse } = require('../utils/errorHandler');
const User = require('../models/User');
const logger = require('../config/logger');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { email, password, role, profile, education, skills, interests } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ValidationError('User with this email already exists');
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role: role || 'student',
      profile,
      education,
      skills,
      interests,
    });

    // Award XP for registration
    user.awardXP(50);
    user.updateStreak();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    logger.info(`New user registered: ${email}`);

    sendResponse(res, 201, true, 'User registered successfully', {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        gamification: user.gamification,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new ValidationError('Please provide email and password');
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AuthenticationError('Your account has been deactivated. Please contact support.');
    }

    // Verify password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Update last login and streak
    user.lastLogin = new Date();
    user.updateStreak();
    user.awardXP(10); // Daily login XP
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    logger.info(`User logged in: ${email}`);

    sendResponse(res, 200, true, 'Login successful', {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        gamification: user.gamification,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    sendResponse(res, 200, true, 'User data retrieved successfully', {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        education: user.education,
        skills: user.skills,
        interests: user.interests,
        gamification: user.gamification,
        preferences: user.preferences,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ValidationError('Please provide current and new password');
    }

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      throw new AuthenticationError('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id);

    sendResponse(res, 200, true, 'Password updated successfully', { token });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      throw new NotFoundError('No user found with this email');
    }

    // Generate reset token
    const resetToken = generateResetToken();

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // TODO: Send email with reset token
    // In production, integrate with email service

    sendResponse(res, 200, true, 'Password reset token generated', {
      message: 'Reset token sent to email (implement email service)',
      resetToken, // Remove in production
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resetToken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      throw new ValidationError('Please provide a new password');
    }

    const user = await User.findOne({
      resetPasswordToken: req.params.resetToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new ValidationError('Invalid or expired reset token');
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);

    sendResponse(res, 200, true, 'Password reset successful', { token });
  } catch (error) {
    next(error);
  }
};
