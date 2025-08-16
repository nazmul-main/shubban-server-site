const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');
const User = require('../models/User');
const { AppError, asyncHandler } = require('./errorHandler');

// Protect routes - require authentication
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('🔐 Token decoded:', { userId: decoded.userId });

    // Check if user still exists
    const currentUser = await User.findById(decoded.userId).select('-password');
    console.log('👤 Current user found:', { 
      id: currentUser?._id, 
      email: currentUser?.email, 
      role: currentUser?.role,
      isActive: currentUser?.isActive 
    });
    
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Check if user is active
    if (!currentUser.isActive) {
      return next(new AppError('Your account has been deactivated. Please contact support.', 401));
    }

    // Grant access to protected route
    req.user = currentUser;
    console.log('✅ User set in req.user:', { 
      id: req.user._id, 
      email: req.user.email, 
      role: req.user.role 
    });
    next();
  } catch (error) {
    console.error('❌ Token verification error:', error.message);
    return next(new AppError('Invalid token. Please log in again.', 401));
  }
});

// Restrict to certain roles
const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('🔒 Authorization check:', {
      userRole: req.user?.role,
      requiredRoles: roles,
      userId: req.user?._id,
      userEmail: req.user?.email,
      userObject: req.user
    });
    
    if (!roles.includes(req.user.role)) {
      console.log('❌ Authorization failed: User role not in required roles');
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    
    console.log('✅ Authorization successful');
    next();
  };
};

// Optional authentication - doesn't require token but adds user if available
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const currentUser = await User.findById(decoded.userId).select('-password');
      
      if (currentUser && currentUser.isActive) {
        req.user = currentUser;
      }
    } catch (error) {
      // Token is invalid, but we don't throw error for optional auth
    }
  }

  next();
});

module.exports = {
  protect,
  authorize,
  optionalAuth,
}; 