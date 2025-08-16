const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/constants');
const { asyncHandler } = require('../middleware/errorHandler');
const { protect } = require('../middleware/auth');
const { successResponse } = require('../utils/response');
const { validatePassword } = require('../utils/validation');
const User = require('../models/User');
const router = express.Router();

// Register user
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists'
    });
  }

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Password validation failed',
      errors: passwordValidation.errors
    });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const user = new User({
    name,
    email,
    password: hashedPassword,
    phone,
    address,
  });

  await user.save();

  // Create JWT token
  const token = jwt.sign(
    { userId: user._id },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  return successResponse(res, {
    user: userResponse,
    token
  }, 'User registered successfully', 201);
}));

// Login user
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(400).json({
      success: false,
      message: 'Account is deactivated'
    });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Create JWT token
  const token = jwt.sign(
    { userId: user._id },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  return successResponse(res, {
    user: userResponse,
    token
  }, 'Login successful');
}));

// Get current user
router.get('/me', protect, asyncHandler(async (req, res) => {
  return successResponse(res, req.user, 'User retrieved successfully');
}));

// Change password
router.put('/change-password', protect, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Password validation failed',
      errors: passwordValidation.errors
    });
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update password
  user.password = hashedPassword;
  await user.save();

  return successResponse(res, null, 'Password changed successfully');
}));

// Update user profile
router.put('/profile', protect, asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;

  // Get user
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Update fields
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (address) user.address = address;

  await user.save();

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  return successResponse(res, userResponse, 'Profile updated successfully');
}));

// Forgot password (placeholder - implement email functionality)
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // TODO: Implement email sending functionality
  // For now, just return success message
  return successResponse(res, null, 'Password reset email sent (if email service is configured)');
}));

// Get available users for testing (development only)
router.get('/available-users', asyncHandler(async (req, res) => {
  // Only allow in development environment
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'This endpoint is not available in production'
    });
  }

  try {
    const users = await User.find({ isActive: true })
      .select('name email role phone currentDistrict')
      .limit(10)
      .sort({ createdAt: -1 });

    // Add test passwords for development (these should match the seed data)
    const usersWithPasswords = users.map(user => {
      const userObj = user.toObject();
      // Add test passwords based on role (these should match your seed data)
      if (user.role === 'admin') {
        userObj.password = 'Admin123!';
      } else if (user.role === 'moderator') {
        userObj.password = 'Moderator123!';
      } else {
        userObj.password = 'User123!';
      }
      return userObj;
    });

    return successResponse(res, usersWithPasswords, 'Available users retrieved successfully');
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users'
    });
  }
}));

module.exports = router; 