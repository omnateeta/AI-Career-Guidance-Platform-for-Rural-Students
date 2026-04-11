const jwt = require('jsonwebtoken');
const { AuthenticationError, AuthorizationError } = require('../utils/errorHandler');
const User = require('../models/User');

// Verify JWT token and attach user to request
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new AuthenticationError('Not authorized to access this route. Please login.');
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        throw new AuthenticationError('User not found. Token invalid.');
      }

      // Check if user is active
      if (!req.user.isActive) {
        throw new AuthenticationError('User account is deactivated.');
      }

      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new AuthenticationError('Invalid token. Please login again.');
      }
      if (error.name === 'TokenExpiredError') {
        throw new AuthenticationError('Token expired. Please login again.');
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AuthorizationError(
        `User role '${req.user.role}' is not authorized to access this route`
      );
    }
    next();
  };
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Generate password reset token
const generateResetToken = () => {
  return jwt.sign({}, process.env.JWT_SECRET, {
    expiresIn: '10m', // Reset token expires in 10 minutes
  });
};

module.exports = {
  protect,
  authorize,
  generateToken,
  generateResetToken,
};
