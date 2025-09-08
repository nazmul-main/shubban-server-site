const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
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
      if (user.role === 'moderator') {
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

// Admin login with device tracking
router.post('/admin-login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists and is admin
  const user = await User.findOne({ email, role: 'admin' });
  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'অবৈধ এডমিন অ্যাকাউন্ট'
    });
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'ভুল পাসওয়ার্ড'
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(400).json({
      success: false,
      message: 'অ্যাকাউন্ট নিষ্ক্রিয়'
    });
  }

  // Generate device ID
  const deviceId = crypto.randomBytes(16).toString('hex');
  const deviceInfo = req.headers['user-agent'] || 'Unknown Device';

  // Check device limit (max 3 devices for admin)
  const maxDevices = 3;
  if (user.activeDevices.length >= maxDevices) {
    // Check if this is a new device
    const isNewDevice = !user.activeDevices.some(device => 
      device.deviceInfo === deviceInfo
    );
    
    if (isNewDevice) {
      // Remove oldest device
      user.activeDevices.sort((a, b) => new Date(a.loginTime) - new Date(b.loginTime));
      const removedDevice = user.activeDevices.shift();
      
      // Remove corresponding token
      user.tokens = user.tokens.filter(token => token.deviceId !== removedDevice.deviceId);
    }
  }

  // Add new device
  user.activeDevices.push({
    deviceId,
    deviceInfo,
    loginTime: new Date(),
    lastActivity: new Date()
  });

  // Create JWT token with 2 hours expiry
  const token = jwt.sign(
    { 
      userId: user._id,
      role: user.role,
      deviceId: deviceId
    },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  // Add token to user's token list
  const tokenExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
  user.tokens.push({
    token,
    deviceId,
    createdAt: new Date(),
    expiresAt: tokenExpiry
  });

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.tokens;

  return successResponse(res, {
    user: userResponse,
    token,
    deviceId
  }, 'এডমিন লগইন সফল');
}));

// Logout user (general logout)
router.post('/logout', protect, asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Update last logout time
  user.lastLogout = new Date();
  await user.save();

  return successResponse(res, null, 'Logout successful');
}));

// Admin signout (remove device)
router.post('/admin-signout', protect, asyncHandler(async (req, res) => {
  const { deviceId } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'ইউজার খুঁজে পাওয়া যায়নি'
    });
  }

  // Remove device from active devices
  user.activeDevices = user.activeDevices.filter(device => device.deviceId !== deviceId);
  
  // Remove token from tokens list
  user.tokens = user.tokens.filter(token => token.deviceId !== deviceId);
  
  await user.save();

  return successResponse(res, null, 'লগআউট সফল');
}));

// Get admin devices
router.get('/admin-devices', protect, asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const user = await User.findById(userId).select('activeDevices');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'ইউজার খুঁজে পাওয়া যায়নি'
    });
  }

  return successResponse(res, user.activeDevices, 'ডিভাইস তালিকা');
}));

// Remove specific device (admin only)
router.delete('/admin-devices/:deviceId', protect, asyncHandler(async (req, res) => {
  const { deviceId } = req.params;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'ইউজার খুঁজে পাওয়া যায়নি'
    });
  }

  // Remove device
  user.activeDevices = user.activeDevices.filter(device => device.deviceId !== deviceId);
  user.tokens = user.tokens.filter(token => token.deviceId !== deviceId);
  
  await user.save();

  return successResponse(res, null, 'ডিভাইস সরানো হয়েছে');
}));

module.exports = router; 